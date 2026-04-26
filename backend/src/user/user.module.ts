import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { WalletService } from 'src/wallet/wallet.service'

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, WalletService],
})
export class UserModule { }
