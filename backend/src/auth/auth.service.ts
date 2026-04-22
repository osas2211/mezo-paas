import { Injectable } from '@nestjs/common'
import { LoginDto } from './dto/auth-dto'

@Injectable()
export class AuthService {
  async login(body: LoginDto) {
    return {
      message: 'Login successfully',
      email: body.email,
    }
  }
}
