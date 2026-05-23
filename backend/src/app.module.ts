import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { WalletService } from './wallet/wallet.service'
import { ConfigModule } from '@nestjs/config'
import { EncryptionService } from './encryption/encryption.service'

import { WalletModule } from './wallet/wallet.module'
import { EncryptionModule } from './encryption/encryption.module'
import { PrismaService } from './prisma/prisma.service'
import { AuthService } from './auth/auth.service'
import { UserModule } from './user/user.module'
import { UserService } from './user/user.service'
import { GithubModule } from './github/github.module'
import { UploadModule } from './upload/upload.module'
import { ProjectModule } from './project/project.module'
import { BillingModule } from './billing/billing.module';
import { ScheduleModule } from '@nestjs/schedule'
import { BlockchainListenerService } from './blockchain-listener/blockchain-listener.service';
import { LogsController } from './logs/logs.controller';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    AuthModule,
    EncryptionModule,
    WalletModule,
    UserModule,
    GithubModule,
    UploadModule,
    ProjectModule,
    BillingModule,
  ],
  controllers: [AppController, LogsController],
  providers: [
    AppService,
    WalletService,
    EncryptionService,
    PrismaService,
    AuthService,
    UserService,
    BlockchainListenerService,

  ],
})
export class AppModule { }
