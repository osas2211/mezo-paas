import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { YieldService } from './yield.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('yield')
export class YieldController {
  constructor(private readonly yieldService: YieldService) {}

  /**
   * Get yield coverage information for the authenticated user
   */
  @UseGuards(AuthGuard)
  @Get('coverage')
  async getYieldCoverage(@Request() req: any) {
    return this.yieldService.getYieldCoverage(req.user.sub);
  }

  /**
   * Get yield history for the authenticated user
   */
  @UseGuards(AuthGuard)
  @Get('history')
  async getYieldHistory(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 30;
    return this.yieldService.getYieldHistory(req.user.sub, parsedLimit);
  }

  /**
   * Get on-chain yield statistics for a specific wallet
   */
  @UseGuards(AuthGuard)
  @Get('stats/:walletAddress')
  async getYieldStats(@Param('walletAddress') walletAddress: string) {
    return this.yieldService.getYieldStatsFromChain(walletAddress);
  }

  /**
   * Get locked collateral amount for a wallet
   */
  @UseGuards(AuthGuard)
  @Get('locked/:walletAddress')
  async getLockedCollateral(@Param('walletAddress') walletAddress: string) {
    const amount = await this.yieldService.getLockedCollateral(walletAddress);
    return { walletAddress, lockedAmount: amount };
  }

  /**
   * Get platform-wide yield statistics (public endpoint)
   */
  @Get('platform-stats')
  async getPlatformStats() {
    return this.yieldService.getPlatformYieldStats();
  }

  /**
   * Manually trigger yield calculation (admin only)
   * In production, this should have additional admin guard
   */
  @UseGuards(AuthGuard)
  @Post('calculate')
  async triggerYieldCalculation() {
    return this.yieldService.manualYieldCalculation();
  }
}
