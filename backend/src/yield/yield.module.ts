import { Module } from '@nestjs/common';
import { YieldService } from './yield.service';
import { YieldController } from './yield.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [YieldController],
  providers: [YieldService, PrismaService],
  exports: [YieldService],
})
export class YieldModule {}
