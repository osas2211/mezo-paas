import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WalletService } from './wallet/wallet.service';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './encryption/encryption.service';

import { WalletModule } from './wallet/wallet.module';
import { EncryptionModule } from './encryption/encryption.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    AuthModule,
    EncryptionModule,
    WalletModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WalletService,
    EncryptionService,
    PrismaService,
    AuthService,
    UserService,
  ],
})
export class AppModule {}
