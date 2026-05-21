import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { BillingAbi } from 'src/abis/BillingAbi';
import { TransactionAction, TransactionType } from 'generated/prisma/enums';

@Injectable()
export class BlockchainListenerService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainListenerService.name);
    private provider: ethers.WebSocketProvider;
    private contract: ethers.Contract;

    constructor(private prisma: PrismaService, private config: ConfigService) { }

    onModuleInit() {
        this.initListener()
    }

    private initListener() {
        this.provider = new ethers.WebSocketProvider(this.config.get<string>('MEZO_WSS_RPC_URL') || "wss://rpc-ws.test.mezo.org");

        this.contract = new ethers.Contract(this.config.get<string>('CONTRACT_ADDRESS') || "", BillingAbi.abi, this.provider);

        this.attachEventListeners();

        this.provider.on("error", async (tx) => {
            this.logger.error(`WebSocket Error detected. Rebooting listener in 5 seconds...`);
            setTimeout(() => this.rebootConnection(), 5000);
        });

        // Catch connection close events
        this.provider.websocket.onerror = () => {
            this.logger.warn('WebSocket connection closed. Rebooting...');
            setTimeout(() => this.rebootConnection(), 5000);
        };
    }

    private attachEventListeners() {


        this.contract.on("AccountToppedUp", async (userWallet, amountWei) => {
            const amountPaid = parseFloat(ethers.formatUnits(amountWei, 18));
            this.logger.log(`💰 Top up detected: ${amountPaid} BTC from ${userWallet}`);
            const creditsToAdd = amountPaid * 50000; // Conversion rate (e.g., 1 mBTC = 50,000 credits)
            const wallet = await this.prisma.wallet.findUnique({ where: { address: userWallet }, include: { user: true } });
            const credits = wallet?.creditBalance || "0";


            await this.prisma.user.update({
                where: { id: wallet?.user?.id },
                data: {
                    wallet: { update: { creditBalance: (Number(credits) + Number(creditsToAdd)).toString() } },
                    transactions: {
                        create: {
                            amount: creditsToAdd.toString(),
                            type: TransactionType.CREDIT,
                            action: TransactionAction.Transfer,
                            title: "Top up via wallet transfer"
                        }
                    }
                }
            });


        });

        this.contract.on("CollateralLocked", async (whaleWallet, amountWei, unlockTime) => {
            const amountLocked = parseFloat(ethers.formatUnits(amountWei, 18));
            const stakedCredits = amountLocked * 100000; // Whales get a massive permanent allowance

            this.logger.log(`🐳 Whale ${whaleWallet} locked ${amountLocked} BTC. Granting ${stakedCredits} Staked Credits.`);

            await this.prisma.wallet.update({
                where: { address: whaleWallet },
                data: { stakedBalance: String(stakedCredits) }
            });
        });

        this.contract.on("CollateralWithdrawn", async (whaleWallet, amountWei, wasSlashed) => {
            this.logger.warn(`📉 Whale ${whaleWallet} withdrew collateral. Revoking Staked Credits!`);

            await this.prisma.wallet.update({
                where: { address: whaleWallet },
                data: { stakedBalance: String(0) }
            });
        });

        this.logger.log('🎧 Active listeners attached to Mezo Host Smart Contract.');
    }

    private rebootConnection() {
        this.logger.log('🔄 Destroying old connection and reconnecting...');
        if (this.provider) {
            this.provider.removeAllListeners(); // Clear old memory
            if (this.provider.websocket) {
                this.provider.websocket.close(); // Kill dead socket
            }
        }
        this.initListener(); // Boot it back up!
    }

}