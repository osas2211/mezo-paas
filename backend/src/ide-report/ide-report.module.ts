import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { IdeReportController } from './ide-report.controller';
import { IdeReportService } from './ide-report.service';

@Module({
  imports: [ConfigModule],
  controllers: [IdeReportController],
  providers: [IdeReportService, PrismaService],
})
export class IdeReportModule {}
