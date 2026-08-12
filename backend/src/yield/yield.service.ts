import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { BillingV2Abi } from '../abis/BillingV2Abi';
import { TransactionAction, TransactionType } from '../../generated/prisma/enums';

@Injectable()
export class YieldService {
  private readonly logger = new Logger(YieldService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  // Yield configuration
  private readonly ANNUAL_YIELD_RATE = 0.08; // 8% APY
  private readonly DAILY_YIELD_RATE = this.ANNUAL_YIELD_RATE / 365;
  private readonly YIELD_TO_CREDIT_RATIO = 135; // How many credits per 1 MUSD of yield

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(
        this.config.get<string>('MEZO_RPC_URL') || 'https://rpc.test.mezo.org',
      );
      this.contract = new ethers.Contract(
        this.config.get<string>('CONTRACT_ADDRESS_V2') || '',
        BillingV2Abi.abi,
        this.provider,
      );
      this.logger.log('Yield service initialized with V2 contract');
    } catch (error) {
      this.logger.error(`Failed to initialize provider: ${error.message}`);
    }
  }

  /**
   * Runs daily at 1 AM UTC to calculate and credit yield to Pro Developers
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: 'UTC' })
  async calculateAndCreditYield() {
    this.logger.log('Starting daily yield calculation...');

    try {
      // Find all users with staked balance (locked collateral)
      const proUsers = await this.prisma.user.findMany({
        where: {
          wallet: { stakedBalance: { not: '0' } },
        },
        include: {
          wallet: true,
          projects: { where: { active: true } },
        },
      });

      this.logger.log(`Found ${proUsers.length} users with staked balance`);

      let totalYieldDistributed = 0;
      let usersProcessed = 0;

      for (const user of proUsers) {
        if (!user.wallet) continue;

        try {
          const result = await this.processUserYield(user);
          if (result.processed) {
            totalYieldDistributed += result.yieldCredits;
            usersProcessed++;
          }
        } catch (error) {
          this.logger.error(
            `Error processing yield for user ${user.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Daily yield completed: ${usersProcessed} users, ${totalYieldDistributed.toFixed(2)} total credits distributed`,
      );
    } catch (error) {
      this.logger.error(`Daily yield calculation failed: ${error.message}`);
    }
  }

  private async processUserYield(user: any): Promise<{
    processed: boolean;
    yieldCredits: number;
  }> {
    const walletAddress = user.wallet.address;

    // Get locked collateral from blockchain
    const lockedAmount = await this.getLockedCollateral(walletAddress);
    if (lockedAmount <= 0) {
      return { processed: false, yieldCredits: 0 };
    }

    // Calculate daily yield
    const dailyYield = lockedAmount * this.DAILY_YIELD_RATE;
    const creditsEarned = dailyYield * this.YIELD_TO_CREDIT_RATIO;

    // Calculate daily compute cost for all active projects
    const dailyComputeCost = user.projects.reduce(
      (sum: number, p: any) => sum + Number(p.dailyCreditCost),
      0,
    );

    const netYield = creditsEarned - dailyComputeCost;

    this.logger.log(
      `User ${walletAddress}: Locked=${lockedAmount.toFixed(4)} MUSD, ` +
        `Yield=${creditsEarned.toFixed(2)} credits, ` +
        `Compute=${dailyComputeCost.toFixed(2)} credits, ` +
        `Net=${netYield.toFixed(2)} credits`,
    );

    // Record the yield transaction
    await this.recordYieldTransaction(
      user.id,
      lockedAmount,
      creditsEarned,
      dailyComputeCost,
    );

    // Update staked balance with yield earnings
    const currentStaked = Number(user.wallet.stakedBalance);
    const newStakedBalance = Math.max(0, currentStaked + netYield);

    await this.prisma.wallet.update({
      where: { id: user.wallet.id },
      data: { stakedBalance: newStakedBalance.toString() },
    });

    // Warn if yield doesn't cover compute costs
    if (netYield < 0) {
      this.logger.warn(
        `User ${walletAddress} yield shortfall: ${Math.abs(netYield).toFixed(2)} credits/day. ` +
          `Consider locking more collateral.`,
      );
    }

    return { processed: true, yieldCredits: creditsEarned };
  }

  /**
   * Get locked collateral amount from the V2 contract
   */
  async getLockedCollateral(walletAddress: string): Promise<number> {
    try {
      const vault = await this.contract.lockedVaults(walletAddress);
      if (!vault.isActive) return 0;

      return parseFloat(ethers.formatUnits(vault.amount, 18));
    } catch (error) {
      this.logger.error(
        `Failed to get locked collateral for ${walletAddress}: ${error.message}`,
      );
      return 0;
    }
  }

  /**
   * Get yield statistics from the V2 contract
   */
  async getYieldStatsFromChain(walletAddress: string): Promise<{
    totalYield: string;
    lastCreditTime: number;
    lockedAmount: string;
    lockDurationRemaining: number;
  }> {
    try {
      const stats = await this.contract.getYieldStats(walletAddress);
      return {
        totalYield: ethers.formatUnits(stats.totalYield, 18),
        lastCreditTime: Number(stats.lastCreditTime),
        lockedAmount: ethers.formatUnits(stats.lockedAmount, 18),
        lockDurationRemaining: Number(stats.lockDurationRemaining),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get yield stats for ${walletAddress}: ${error.message}`,
      );
      return {
        totalYield: '0',
        lastCreditTime: 0,
        lockedAmount: '0',
        lockDurationRemaining: 0,
      };
    }
  }

  /**
   * Record yield transaction in database
   */
  private async recordYieldTransaction(
    userId: string,
    lockedAmount: number,
    creditsEarned: number,
    computeCost: number,
  ) {
    const netCredits = creditsEarned - computeCost;

    // Create yield record
    await this.prisma.yieldRecord.create({
      data: {
        userId,
        lockedAmount: lockedAmount.toString(),
        yieldEarned: (lockedAmount * this.DAILY_YIELD_RATE).toString(),
        creditsAwarded: creditsEarned.toString(),
        computeCharged: computeCost.toString(),
        netCredits: netCredits.toString(),
        periodStart: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        periodEnd: new Date(),
      },
    });

    // Create transactions for transparency
    await this.prisma.$transaction([
      // Yield credit transaction
      this.prisma.transaction.create({
        data: {
          userId,
          amount: creditsEarned.toString(),
          type: TransactionType.CREDIT,
          action: TransactionAction.Transfer,
          title: `Daily yield: ${creditsEarned.toFixed(2)} credits (${this.ANNUAL_YIELD_RATE * 100}% APY)`,
        },
      }),
      // Compute debit transaction (if any)
      ...(computeCost > 0
        ? [
            this.prisma.transaction.create({
              data: {
                userId,
                amount: computeCost.toString(),
                type: TransactionType.DEBIT,
                action: TransactionAction.Billing,
                title: `Daily compute: ${computeCost.toFixed(2)} credits`,
              },
            }),
          ]
        : []),
    ]);
  }

  /**
   * Get yield coverage information for a user
   */
  async getYieldCoverage(userId: string): Promise<{
    lockedAmount: number;
    dailyYield: number;
    dailyComputeCost: number;
    coverageRatio: number;
    isCovered: boolean;
    estimatedMonthlyYield: number;
    recommendedLock: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        projects: { where: { active: true } },
      },
    });

    if (!user?.wallet) {
      return {
        lockedAmount: 0,
        dailyYield: 0,
        dailyComputeCost: 0,
        coverageRatio: 0,
        isCovered: false,
        estimatedMonthlyYield: 0,
        recommendedLock: 0,
      };
    }

    const lockedAmount = await this.getLockedCollateral(user.wallet.address);
    const dailyYield = lockedAmount * this.DAILY_YIELD_RATE * this.YIELD_TO_CREDIT_RATIO;
    const dailyComputeCost = user.projects.reduce(
      (sum, p) => sum + Number(p.dailyCreditCost),
      0,
    );

    // Calculate recommended lock amount to cover compute costs
    const recommendedLock =
      dailyComputeCost > 0
        ? dailyComputeCost / (this.DAILY_YIELD_RATE * this.YIELD_TO_CREDIT_RATIO)
        : 0;

    return {
      lockedAmount,
      dailyYield,
      dailyComputeCost,
      coverageRatio: dailyComputeCost > 0 ? dailyYield / dailyComputeCost : Infinity,
      isCovered: dailyYield >= dailyComputeCost,
      estimatedMonthlyYield: dailyYield * 30,
      recommendedLock,
    };
  }

  /**
   * Get yield history for a user
   */
  async getYieldHistory(
    userId: string,
    limit: number = 30,
  ): Promise<any[]> {
    return this.prisma.yieldRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get platform-wide yield statistics
   */
  async getPlatformYieldStats(): Promise<{
    totalLockedCollateral: string;
    totalInTreasury: string;
    contractBalance: string;
    reserveRatio: number;
    availableToMove: string;
    activeVaults: number;
  }> {
    try {
      const status = await this.contract.getContractStatus();
      const activeVaults = await this.prisma.wallet.count({
        where: { stakedBalance: { not: '0' } },
      });

      return {
        totalLockedCollateral: ethers.formatUnits(status._totalLocked, 18),
        totalInTreasury: ethers.formatUnits(status._totalInTreasury, 18),
        contractBalance: ethers.formatUnits(status._contractBalance, 18),
        reserveRatio: Number(status._reserveRatio) / 100, // Convert basis points to percentage
        availableToMove: ethers.formatUnits(status._availableToMove, 18),
        activeVaults,
      };
    } catch (error) {
      this.logger.error(`Failed to get platform stats: ${error.message}`);
      return {
        totalLockedCollateral: '0',
        totalInTreasury: '0',
        contractBalance: '0',
        reserveRatio: 20,
        availableToMove: '0',
        activeVaults: 0,
      };
    }
  }

  /**
   * Manual trigger for yield calculation (admin use)
   */
  async manualYieldCalculation(): Promise<{
    success: boolean;
    usersProcessed: number;
    totalYield: number;
  }> {
    this.logger.log('Manual yield calculation triggered');

    try {
      await this.calculateAndCreditYield();

      // Get stats from latest run
      const recentRecords = await this.prisma.yieldRecord.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 60000) }, // Last minute
        },
      });

      return {
        success: true,
        usersProcessed: recentRecords.length,
        totalYield: recentRecords.reduce(
          (sum, r) => sum + Number(r.creditsAwarded),
          0,
        ),
      };
    } catch (error) {
      this.logger.error(`Manual yield calculation failed: ${error.message}`);
      return {
        success: false,
        usersProcessed: 0,
        totalYield: 0,
      };
    }
  }
}
