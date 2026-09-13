import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { AdminGuard } from '../auth/admin.guard';

class MoveCollateralDto {
  amount: string;
  notes?: string;
}

class RecordYieldHarvestDto {
  amount: string;
  yieldSource: string;
  txHash?: string;
  notes?: string;
}

class ProcessWithdrawalDto {
  whaleAddress: string;
  userAppWallet: string;
}

class UpdateReserveRatioDto {
  newRatioBps: number;
}

@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  /**
   * Get current treasury status (public for dashboard)
   */
  @Get('status')
  async getStatus() {
    try {
      return await this.treasuryService.getTreasuryStatus();
    } catch (error) {
      throw new HttpException(
        `Failed to get treasury status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get treasury analytics
   */
  @Get('analytics')
  async getAnalytics() {
    try {
      return await this.treasuryService.getTreasuryAnalytics();
    } catch (error) {
      throw new HttpException(
        `Failed to get analytics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get operation history
   */
  @Get('operations')
  @UseGuards(AdminGuard)
  async getOperationHistory() {
    try {
      return await this.treasuryService.getOperationHistory();
    } catch (error) {
      throw new HttpException(
        `Failed to get operation history: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Move collateral to treasury for yield generation (Admin only)
   */
  @Post('move-to-yield')
  @UseGuards(AdminGuard)
  async moveToYield(@Body() dto: MoveCollateralDto) {
    const result = await this.treasuryService.moveCollateralToTreasury(
      dto.amount,
      dto.notes,
    );

    if (!result.success) {
      throw new HttpException(
        result.error || 'Failed to move collateral',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  /**
   * Return collateral from treasury (Admin only)
   */
  @Post('return-from-yield')
  @UseGuards(AdminGuard)
  async returnFromYield(@Body() dto: MoveCollateralDto) {
    const result = await this.treasuryService.returnCollateralFromTreasury(
      dto.amount,
      dto.notes,
    );

    if (!result.success) {
      throw new HttpException(
        result.error || 'Failed to return collateral',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  /**
   * Record a yield harvest operation (Admin only)
   */
  @Post('record-harvest')
  @UseGuards(AdminGuard)
  async recordHarvest(@Body() dto: RecordYieldHarvestDto) {
    const result = await this.treasuryService.recordYieldHarvest(
      dto.amount,
      dto.yieldSource,
      dto.txHash,
      dto.notes,
    );

    if (!result.success) {
      throw new HttpException(
        result.error || 'Failed to record harvest',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  /**
   * Process a queued withdrawal (Admin only)
   */
  @Post('process-withdrawal')
  @UseGuards(AdminGuard)
  async processWithdrawal(@Body() dto: ProcessWithdrawalDto) {
    const result = await this.treasuryService.processQueuedWithdrawal(
      dto.whaleAddress,
      dto.userAppWallet,
    );

    if (!result.success) {
      throw new HttpException(
        result.error || 'Failed to process withdrawal',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  /**
   * Update reserve ratio (Admin only)
   */
  @Post('update-reserve-ratio')
  @UseGuards(AdminGuard)
  async updateReserveRatio(@Body() dto: UpdateReserveRatioDto) {
    // Validate range (10% - 50%)
    if (dto.newRatioBps < 1000 || dto.newRatioBps > 5000) {
      throw new HttpException(
        'Reserve ratio must be between 1000 (10%) and 5000 (50%) basis points',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.treasuryService.updateReserveRatio(dto.newRatioBps);

    if (!result.success) {
      throw new HttpException(
        result.error || 'Failed to update reserve ratio',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  /**
   * Emergency withdraw (Admin only - use with extreme caution)
   */
  @Post('emergency-withdraw')
  @UseGuards(AdminGuard)
  async emergencyWithdraw(@Body() body: { notes?: string; confirm: boolean }) {
    if (!body.confirm) {
      throw new HttpException(
        'Emergency withdraw requires confirmation. Set confirm: true',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.treasuryService.emergencyWithdraw(body.notes);

    if (!result.success) {
      throw new HttpException(
        result.error || 'Failed to execute emergency withdraw',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }
}
