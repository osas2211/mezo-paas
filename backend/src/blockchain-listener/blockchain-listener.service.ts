import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { BillingAbi } from 'src/abis/BillingAbi';
import { TransactionAction, TransactionType } from 'generated/prisma/enums';

@Injectable()
export class BlockchainListenerService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainListenerService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private lastPolledBlock: number;
  private pollingInterval: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    // Connect via HTTP for reliable event polling instead of WSS
    this.provider = new ethers.JsonRpcProvider(
      this.config.get<string>('MEZO_RPC_URL') || 'https://rpc.test.mezo.org',
    );
    this.contract = new ethers.Contract(
      this.config.get<string>('CONTRACT_ADDRESS') || '',
      BillingAbi.abi,
      this.provider,
    );

    try {
      this.lastPolledBlock = await this.provider.getBlockNumber();
      this.logger.log(
        `🎧 Starting manual event polling from block ${this.lastPolledBlock}...`,
      );
      this.startManualPolling();
    } catch (error) {
      this.logger.error(`❌ Failed to get initial block: ${error.message}`);
    }
  }

  private startManualPolling() {
    this.pollingInterval = setInterval(async () => {
      try {
        const latestBlock = await this.provider.getBlockNumber();
        if (latestBlock > this.lastPolledBlock) {
          await this.pollEvents(this.lastPolledBlock + 1, latestBlock);
          this.lastPolledBlock = latestBlock;
        }
      } catch (error) {
        // Ignore transient network errors during polling
        this.logger.debug(`Polling skip: ${error.message}`);
      }
    }, 5000); // Poll every 5 seconds
  }

  private async pollEvents(fromBlock: number, toBlock: number) {
    try {
      const events = await this.contract.queryFilter('*', fromBlock, toBlock);
      for (const event of events) {
        const ev = event as ethers.EventLog;
        if (!ev.eventName) continue;

        this.logger.log(`[DEBUG] Polled event: ${ev.eventName}`);

        if (ev.eventName === 'AccountToppedUp') {
          await this.handleAccountToppedUp(ev.args[0], ev.args[1]);
        } else if (ev.eventName === 'CollateralLocked') {
          await this.handleCollateralLocked(ev.args[0], ev.args[1], ev.args[2]);
        } else if (ev.eventName === 'CollateralWithdrawn') {
          await this.handleCollateralWithdrawn(
            ev.args[0],
            ev.args[1],
            ev.args[2],
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error querying logs: ${error.message}`);
    }
  }

  private async handleAccountToppedUp(userWallet: string, amountWei: any) {
    try {
      this.logger.log(
        `[DEBUG] Raw AccountToppedUp: ${userWallet}, ${amountWei}`,
      );
      const amountPaid = parseFloat(ethers.formatUnits(amountWei, 18));
      this.logger.log(
        `💰 Top up detected: ${amountPaid} MUSD from ${userWallet}`,
      );
      const creditsToAdd = amountPaid * 135; // Conversion rate (e.g., 1 MUSD = 135 credits)
      const wallet = await this.prisma.wallet.findUnique({
        where: { address: userWallet },
        include: { user: true },
      });
      const credits = wallet?.creditBalance || '0';

      if (wallet?.user?.id) {
        await this.prisma.user.update({
          where: { id: wallet.user.id },
          data: {
            wallet: {
              update: {
                creditBalance: (
                  Number(credits) + Number(creditsToAdd)
                ).toString(),
              },
            },
            transactions: {
              create: {
                amount: creditsToAdd.toString(),
                type: TransactionType.CREDIT,
                action: TransactionAction.Transfer,
                title: 'Top up via wallet transfer',
              },
            },
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error processing AccountToppedUp: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleCollateralLocked(
    userAppWallet: string,
    amountWei: any,
    unlockTime: any,
  ) {
    try {
      this.logger.log(
        `[DEBUG] Raw CollateralLocked: ${userAppWallet}, ${amountWei}, ${unlockTime}`,
      );
      const amountLocked = parseFloat(ethers.formatUnits(amountWei, 18));
      const stakedCredits = amountLocked * 1350; // Whales get a massive permanent allowance

      this.logger.log(
        `🐳 Whale ${userAppWallet} locked ${amountLocked} BTC. Granting ${stakedCredits} Staked Credits.`,
      );

      const wallet = await this.prisma.wallet.findUnique({
        where: { address: userAppWallet },
        include: { user: true },
      });

      if (wallet?.user?.id) {
        await this.prisma.user.update({
          where: { id: wallet.user.id },
          data: {
            wallet: { update: { stakedBalance: String(stakedCredits) } },
            transactions: {
              create: {
                amount: stakedCredits.toString(),
                type: TransactionType.CREDIT,
                action: TransactionAction.Transfer,
                title: 'Staked capacity via collateral lock',
              },
            },
          },
        });
      } else {
        this.logger.warn(`User not found for wallet ${userAppWallet}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing CollateralLocked: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleCollateralWithdrawn(
    whaleWallet: string,
    amountWei: any,
    wasSlashed: any,
  ) {
    try {
      this.logger.log(
        `[DEBUG] Raw CollateralWithdrawn: ${whaleWallet}, ${amountWei}, ${wasSlashed}`,
      );
      this.logger.warn(
        `📉 Whale ${whaleWallet} withdrew collateral. Revoking Staked Credits!`,
      );

      const wallet = await this.prisma.wallet.findUnique({
        where: { address: whaleWallet },
        include: { user: true },
      });

      if (wallet?.user?.id) {
        await this.prisma.user.update({
          where: { id: wallet.user.id },
          data: {
            wallet: { update: { stakedBalance: String(0) } },
            transactions: {
              create: {
                amount: wallet.stakedBalance,
                type: TransactionType.DEBIT,
                action: TransactionAction.Withdraw,
                title: 'Withdraw from staked capacity: Reverted credits',
              },
            },
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error processing CollateralWithdrawn: ${error.message}`,
        error.stack,
      );
    }
  }
}
