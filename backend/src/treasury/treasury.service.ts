import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { BillingV2Abi } from '../abis/BillingV2Abi';
import { TreasuryOpType } from '../../generated/prisma/enums';

export interface TreasuryStatus {
  totalLockedCollateral: string;
  totalInTreasury: string;
  contractBalance: string;
  reserveRatioBps: number;
  availableToMove: string;
  activeVaults: number;
}

export interface TreasuryOperationResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

@Injectable()
export class TreasuryService {
  private readonly logger = new Logger(TreasuryService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private contractWithSigner: ethers.Contract;
  private platformWallet: ethers.Wallet;

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

      const contractAddress = this.config.get<string>('CONTRACT_ADDRESS_V2') || '';

      // Read-only contract for queries
      this.contract = new ethers.Contract(
        contractAddress,
        BillingV2Abi.abi,
        this.provider,
      );

      // Initialize platform wallet for write operations
      const platformPrivateKey = this.config.get<string>('PLATFORM_OPERATOR_PRIVATE_KEY');
      if (platformPrivateKey) {
        this.platformWallet = new ethers.Wallet(platformPrivateKey, this.provider);
        this.contractWithSigner = new ethers.Contract(
          contractAddress,
          BillingV2Abi.abi,
          this.platformWallet,
        );
        this.logger.log(`Treasury service initialized with operator: ${this.platformWallet.address}`);
      } else {
        this.logger.warn('PLATFORM_OPERATOR_PRIVATE_KEY not set - treasury operations disabled');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize treasury service: ${error.message}`);
    }
  }

  /**
   * Get current treasury status from the contract
   */
  async getTreasuryStatus(): Promise<TreasuryStatus> {
    try {
      const status = await this.contract.getContractStatus();
      const activeVaults = await this.prisma.wallet.count({
        where: { stakedBalance: { not: '0' } },
      });

      return {
        totalLockedCollateral: ethers.formatUnits(status._totalLocked, 18),
        totalInTreasury: ethers.formatUnits(status._totalInTreasury, 18),
        contractBalance: ethers.formatUnits(status._contractBalance, 18),
        reserveRatioBps: Number(status._reserveRatio),
        availableToMove: ethers.formatUnits(status._availableToMove, 18),
        activeVaults,
      };
    } catch (error) {
      this.logger.error(`Failed to get treasury status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Move collateral from contract to treasury for yield generation
   */
  async moveCollateralToTreasury(
    amount: string,
    notes?: string,
  ): Promise<TreasuryOperationResult> {
    if (!this.contractWithSigner) {
      return { success: false, error: 'Platform operator not configured' };
    }

    try {
      const amountWei = ethers.parseUnits(amount, 18);

      this.logger.log(`Moving ${amount} tokens to treasury for yield generation`);

      const tx = await this.contractWithSigner.moveCollateralToTreasury(amountWei);
      const receipt = await tx.wait();

      // Record the operation
      await this.prisma.treasuryOperation.create({
        data: {
          type: TreasuryOpType.MOVE_TO_YIELD,
          amount,
          txHash: receipt.hash,
          notes: notes || 'Moved to treasury for yield generation',
        },
      });

      this.logger.log(`Successfully moved ${amount} to treasury. TX: ${receipt.hash}`);

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      this.logger.error(`Failed to move collateral to treasury: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Return collateral from treasury to contract (for withdrawals)
   */
  async returnCollateralFromTreasury(
    amount: string,
    notes?: string,
  ): Promise<TreasuryOperationResult> {
    if (!this.contractWithSigner) {
      return { success: false, error: 'Platform operator not configured' };
    }

    try {
      const amountWei = ethers.parseUnits(amount, 18);

      this.logger.log(`Returning ${amount} tokens from treasury to contract`);

      const tx = await this.contractWithSigner.returnCollateralFromTreasury(amountWei);
      const receipt = await tx.wait();

      // Record the operation
      await this.prisma.treasuryOperation.create({
        data: {
          type: TreasuryOpType.RETURN_FROM_YIELD,
          amount,
          txHash: receipt.hash,
          notes: notes || 'Returned from treasury for withdrawal',
        },
      });

      this.logger.log(`Successfully returned ${amount} from treasury. TX: ${receipt.hash}`);

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      this.logger.error(`Failed to return collateral from treasury: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Record a yield harvest operation (manual off-chain yield collection)
   */
  async recordYieldHarvest(
    amount: string,
    yieldSource: string,
    txHash?: string,
    notes?: string,
  ): Promise<TreasuryOperationResult> {
    try {
      await this.prisma.treasuryOperation.create({
        data: {
          type: TreasuryOpType.HARVEST_YIELD,
          amount,
          yieldSource,
          txHash,
          notes: notes || `Yield harvested from ${yieldSource}`,
        },
      });

      this.logger.log(`Recorded yield harvest: ${amount} from ${yieldSource}`);

      return { success: true, txHash };
    } catch (error) {
      this.logger.error(`Failed to record yield harvest: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get treasury operation history
   */
  async getOperationHistory(limit: number = 50): Promise<any[]> {
    return this.prisma.treasuryOperation.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get treasury analytics
   */
  async getTreasuryAnalytics(): Promise<{
    totalMoved: string;
    totalReturned: string;
    totalHarvested: string;
    operationCount: number;
  }> {
    const operations = await this.prisma.treasuryOperation.findMany();

    let totalMoved = 0;
    let totalReturned = 0;
    let totalHarvested = 0;

    for (const op of operations) {
      const amount = parseFloat(op.amount);
      switch (op.type) {
        case TreasuryOpType.MOVE_TO_YIELD:
          totalMoved += amount;
          break;
        case TreasuryOpType.RETURN_FROM_YIELD:
          totalReturned += amount;
          break;
        case TreasuryOpType.HARVEST_YIELD:
          totalHarvested += amount;
          break;
      }
    }

    return {
      totalMoved: totalMoved.toFixed(6),
      totalReturned: totalReturned.toFixed(6),
      totalHarvested: totalHarvested.toFixed(6),
      operationCount: operations.length,
    };
  }

  /**
   * Process a queued withdrawal (admin function)
   */
  async processQueuedWithdrawal(
    whaleAddress: string,
    userAppWallet: string,
  ): Promise<TreasuryOperationResult> {
    if (!this.contractWithSigner) {
      return { success: false, error: 'Platform operator not configured' };
    }

    try {
      this.logger.log(`Processing queued withdrawal for ${whaleAddress}`);

      const tx = await this.contractWithSigner.processQueuedWithdrawal(
        whaleAddress,
        userAppWallet,
      );
      const receipt = await tx.wait();

      this.logger.log(`Successfully processed withdrawal for ${whaleAddress}. TX: ${receipt.hash}`);

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      this.logger.error(`Failed to process queued withdrawal: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Emergency withdraw all funds to treasury
   */
  async emergencyWithdraw(notes?: string): Promise<TreasuryOperationResult> {
    if (!this.contractWithSigner) {
      return { success: false, error: 'Platform operator not configured' };
    }

    try {
      this.logger.warn('EMERGENCY WITHDRAW initiated!');

      const tx = await this.contractWithSigner.emergencyWithdraw();
      const receipt = await tx.wait();

      // Get balance that was withdrawn
      const status = await this.contract.getContractStatus();
      const amount = ethers.formatUnits(status._totalInTreasury, 18);

      await this.prisma.treasuryOperation.create({
        data: {
          type: TreasuryOpType.EMERGENCY_WITHDRAW,
          amount,
          txHash: receipt.hash,
          notes: notes || 'Emergency withdrawal to treasury',
        },
      });

      this.logger.warn(`Emergency withdraw completed. TX: ${receipt.hash}`);

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      this.logger.error(`Failed to emergency withdraw: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update reserve ratio
   */
  async updateReserveRatio(newRatioBps: number): Promise<TreasuryOperationResult> {
    if (!this.contractWithSigner) {
      return { success: false, error: 'Platform operator not configured' };
    }

    try {
      this.logger.log(`Updating reserve ratio to ${newRatioBps} bps (${newRatioBps / 100}%)`);

      const tx = await this.contractWithSigner.updateReserveRatio(newRatioBps);
      const receipt = await tx.wait();

      this.logger.log(`Reserve ratio updated. TX: ${receipt.hash}`);

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      this.logger.error(`Failed to update reserve ratio: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
