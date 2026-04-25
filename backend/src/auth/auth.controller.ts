import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto/auth-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async createUser(@Body() body: SignUpDto) {
    return await this.auth.signup(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.auth.login(body);
  }
}
