import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { BillingV2Abi } from 'src/abis/BillingV2Abi';
import { TransactionAction, TransactionType } from 'generated/prisma/enums';

/**
 * Blockchain Event Listener Service
 *
 * Security notes (2026-09-19):
 * - V1 contract support removed (V1 had forgeable harvestYield events)
 * - All events are verified to come from the expected contract address
 * - YieldCredited events are validated against on-chain state
 * - Only V2 contract is supported
 */
@Injectable()
export class BlockchainListenerService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainListenerService.name);
  private provider: ethers.JsonRpcProvider;
  private contractV2: ethers.Contract;
  private contractAddressV2: string;
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

    // V2 Contract only (V1 removed for security reasons)
    this.contractAddressV2 = this.config.get<string>('CONTRACT_ADDRESS_V2') || '';
    if (this.contractAddressV2) {
      this.contractV2 = new ethers.Contract(
        this.contractAddressV2,
        BillingV2Abi.abi,
        this.provider,
      );
      this.logger.log(`V2 Contract configured: ${this.contractAddressV2}`);
    } else {
      this.logger.warn('No CONTRACT_ADDRESS_V2 configured - event listening disabled');
      return;
    }

    try {
      this.lastPolledBlock = await this.provider.getBlockNumber();
      this.logger.log(
        `Starting event polling from block ${this.lastPolledBlock}...`,
      );
      this.startManualPolling();
    } catch (error) {
      this.logger.error(`Failed to get initial block: ${error.message}`);
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
    if (!this.contractV2) return;

    try {
      const eventsV2 = await this.contractV2.queryFilter('*', fromBlock, toBlock);
      for (const event of eventsV2) {
        const ev = event as ethers.EventLog;
        if (!ev.eventName) continue;

        // SECURITY: Verify event comes from expected contract address
        if (ev.address.toLowerCase() !== this.contractAddressV2.toLowerCase()) {
          this.logger.warn(
            `Ignoring event from unexpected contract: ${ev.address} (expected ${this.contractAddressV2})`,
          );
          continue;
        }

        this.logger.log(`[V2] Polled event: ${ev.eventName}`);

        if (ev.eventName === 'AccountToppedUp') {
          await this.handleAccountToppedUp(ev.args[0], ev.args[1]);
        } else if (ev.eventName === 'CollateralLocked') {
          // V2 has 4 args: whale, amount, unlockTime, lockTime
          await this.handleCollateralLockedV2(ev.args[0], ev.args[1], ev.args[2], ev.args[3]);
        } else if (ev.eventName === 'CollateralWithdrawn') {
          await this.handleCollateralWithdrawn(ev.args[0], ev.args[1], ev.args[2]);
        } else if (ev.eventName === 'YieldCredited') {
          await this.handleYieldCredited(ev.args[0], ev.args[1], ev.args[2]);
        } else if (ev.eventName === 'WithdrawalQueued') {
          await this.handleWithdrawalQueued(ev.args[0], ev.args[1], ev.args[2]);
        } else if (ev.eventName === 'WithdrawalProcessed') {
          // V2 WithdrawalProcessed now has 2 args: whale, amount (no timestamp)
          await this.handleWithdrawalProcessed(ev.args[0], ev.args[1]);
        }
      }
    } catch (error) {
      this.logger.error(`Error querying V2 logs: ${error.message}`);
    }
  }

  private async handleAccountToppedUp(userWallet: string, amountWei: any) {
    try {
      this.logger.log(
        `[DEBUG] Raw AccountToppedUp: ${userWallet}, ${amountWei}`,
      );
      const amountPaid = parseFloat(ethers.formatUnits(amountWei, 18));
      this.logger.log(
        `Top up detected: ${amountPaid} MUSD from ${userWallet}`,
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

  private async handleCollateralLockedV2(
    userAppWallet: string,
    amountWei: any,
    unlockTime: any,
    lockTime: any,
  ) {
    try {
      this.logger.log(
        `[DEBUG] Raw CollateralLocked V2: ${userAppWallet}, ${amountWei}, unlock=${unlockTime}, lock=${lockTime}`,
      );
      const amountLocked = parseFloat(ethers.formatUnits(amountWei, 18));
      const stakedCredits = amountLocked * 1350; // Whales get massive permanent allowance

      this.logger.log(
        `[V2] Whale ${userAppWallet} locked ${amountLocked} MUSD. Granting ${stakedCredits} Staked Credits.`,
      );

      const wallet = await this.prisma.wallet.findUnique({
        where: { address: userAppWallet },
        include: { user: true },
      });

      if (wallet?.user?.id) {
        await this.prisma.user.update({
          where: { id: wallet.user.id },
          data: {
            role: 'PRO_DEVELOPER', // Upgrade to Pro when locking collateral
            wallet: { update: { stakedBalance: String(stakedCredits) } },
            transactions: {
              create: {
                amount: stakedCredits.toString(),
                type: TransactionType.CREDIT,
                action: TransactionAction.Stake,
                title: `Staked capacity via V2 collateral lock (${amountLocked.toFixed(4)} MUSD)`,
              },
            },
          },
        });
      } else {
        this.logger.warn(`User not found for wallet ${userAppWallet}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing CollateralLocked V2: ${error.message}`,
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
        `Whale ${whaleWallet} withdrew collateral. Revoking Staked Credits!`,
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

  private async handleYieldCredited(
    whaleWallet: string,
    yieldAmountWei: any,
    timestamp: any,
  ) {
    try {
      const yieldAmount = parseFloat(ethers.formatUnits(yieldAmountWei, 18));
      const creditAmount = yieldAmount * 135; // Convert yield to credits

      // SECURITY: Validate on-chain state before crediting
      // Verify the user has an active vault
      const lockStatus = await this.contractV2.getLockStatus(whaleWallet);
      if (!lockStatus[0]) {
        // lockStatus[0] is isActive
        this.logger.warn(
          `YieldCredited event for wallet without active vault: ${whaleWallet} - ignoring`,
        );
        return;
      }

      this.logger.log(
        `[V2] Yield credited to ${whaleWallet}: ${yieldAmount.toFixed(6)} MUSD = ${creditAmount.toFixed(2)} credits`,
      );

      const wallet = await this.prisma.wallet.findUnique({
        where: { address: whaleWallet },
        include: { user: true },
      });

      if (wallet?.user?.id) {
        const currentStaked = Number(wallet.stakedBalance);
        await this.prisma.user.update({
          where: { id: wallet.user.id },
          data: {
            wallet: {
              update: {
                stakedBalance: String(currentStaked + creditAmount),
              },
            },
            transactions: {
              create: {
                amount: creditAmount.toString(),
                type: TransactionType.CREDIT,
                action: TransactionAction.Stake,
                title: `Yield credit: ${creditAmount.toFixed(2)} credits`,
              },
            },
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error processing YieldCredited: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleWithdrawalQueued(
    whaleWallet: string,
    amountWei: any,
    timestamp: any,
  ) {
    try {
      const amount = parseFloat(ethers.formatUnits(amountWei, 18));
      this.logger.log(
        `[V2] Withdrawal queued for ${whaleWallet}: ${amount.toFixed(4)} MUSD`,
      );

      const wallet = await this.prisma.wallet.findUnique({
        where: { address: whaleWallet },
        include: { user: true },
      });

      if (wallet?.user?.id) {
        await this.prisma.transaction.create({
          data: {
            userId: wallet.user.id,
            amount: amount.toString(),
            type: TransactionType.DEBIT,
            action: TransactionAction.Withdraw,
            title: `Withdrawal queued: ${amount.toFixed(4)} MUSD (pending - claim when funds available)`,
            status: 'Pending',
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error processing WithdrawalQueued: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleWithdrawalProcessed(
    whaleWallet: string,
    amountWei: any,
  ) {
    try {
      const amount = parseFloat(ethers.formatUnits(amountWei, 18));
      this.logger.log(
        `[V2] Withdrawal processed for ${whaleWallet}: ${amount.toFixed(4)} MUSD`,
      );

      const wallet = await this.prisma.wallet.findUnique({
        where: { address: whaleWallet },
        include: { user: true },
      });

      if (wallet?.user?.id) {
        // Update pending transaction to success
        await this.prisma.transaction.updateMany({
          where: {
            userId: wallet.user.id,
            status: 'Pending',
            action: TransactionAction.Withdraw,
          },
          data: { status: 'Success' },
        });

        // Reset staked balance
        await this.prisma.wallet.update({
          where: { id: wallet.id },
          data: { stakedBalance: '0' },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error processing WithdrawalProcessed: ${error.message}`,
        error.stack,
      );
    }
  }
}
