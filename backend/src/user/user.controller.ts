import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getUserProfile(@Request() req: { user: { userId: string } }) {
    return this.user.getUserProfile(req.user.userId);
  }
}
