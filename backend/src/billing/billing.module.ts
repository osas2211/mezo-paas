import { Module } from '@nestjs/common'
import { BillingMeterService } from './billing.service'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  providers: [BillingMeterService, ConfigModule, PrismaService],
})
export class BillingModule { }
