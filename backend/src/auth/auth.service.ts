/* eslint-disable */

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, SignUpDto } from './dto/auth-dto';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { WalletService } from 'src/wallet/wallet.service';
import { EncryptionService } from 'src/encryption/encryption.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly encryption: EncryptionService,
    private jwt: JwtService,
  ) {}
  async signup(body: SignUpDto) {
    try {
      const { password, ...rest } = body;
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const user = await this.prisma.user.create({
        data: { ...rest, password: hashedPassword },
      });
      const generatedWallet = this.wallet.generateWallet();
      await this.prisma.wallet.create({
        data: {
          encryptedMnemonic: this.encryption.encrypt(generatedWallet.mnemonic!),
          encryptedPK: this.encryption.encrypt(generatedWallet.privateKey),
          address: generatedWallet.address,
          userId: user.id,
        },
      });

      return {
        message: 'User created succesfully',
        user,
      };
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new BadRequestException('User with same email already exists');
      throw new BadRequestException('Something went wrong');
    }
  }

  async login(body: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      include: { wallet: true },
    });
    if (user) {
      const { password, ...rest } = user;
      const result = await bcrypt.compare(body.password, user.password);
      const payload = {
        userId: user.id,
        address: user.wallet?.address,
        email: user.email,
      };
      const access_token = await this.jwt.signAsync(payload);

      if (result) {
        return {
          message: 'Login successfully',
          user: rest,
          access_token,
        };
      }
      throw new UnauthorizedException('Incorrect password');
    }
    throw new UnauthorizedException('Incorrect email address');
  }
}
