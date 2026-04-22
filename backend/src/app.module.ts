import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { WalletService } from './wallet/wallet.service'
import { ConfigModule } from '@nestjs/config'
import { EncryptionService } from './encryption/encryption.service';

@Module({
  imports: [ConfigModule.forRoot(
    {
      isGlobal: true,
      envFilePath: '.env.local',
    }
  ), AuthModule],
  controllers: [AppController],
  providers: [AppService, WalletService, EncryptionService],
})
export class AppModule { }
