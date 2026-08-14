import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UserService } from './user.service';
import { TransferCreditsDTO } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getUserProfile(@Request() req: { user: { userId: string } }) {
    return this.user.getUserProfile(req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Get('tx-history')
  async getTransactionHistory(@Request() req: { user: { userId: string } }) {
    return this.user.getTransactionHistory(req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Post('transfer-credits')
  async transferCredit(
    @Request() req: { user: { userId: string } },
    @Body() body: TransferCreditsDTO,
  ) {
    return this.user.transferCredit(req.user.userId, body.email, body.amount);
  }

  @UseGuards(AdminGuard)
  @Get('admin/analytics')
  async getAdminAnalytics() {
    return this.user.getAdminAnalytics();
  }
}
