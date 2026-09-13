import { Module } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { TreasuryController } from './treasury.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [TreasuryController],
  providers: [TreasuryService, PrismaService],
  exports: [TreasuryService],
})
export class TreasuryModule {}
