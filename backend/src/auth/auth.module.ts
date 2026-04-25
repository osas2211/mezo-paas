import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptionService } from 'src/encryption/encryption.service';
import { WalletService } from 'src/wallet/wallet.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '6h' },
      secret: jwtConstants.secret,
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    EncryptionService,
    WalletService,
    // JwtService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
