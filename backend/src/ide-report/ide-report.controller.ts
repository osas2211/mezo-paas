import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import {
  IdeReportService,
  type CreateIdeReportInput,
  type UpdateIdeReportInput,
} from './ide-report.service';

@Controller('ide-reports')
export class IdeReportController {
  constructor(private readonly ideReportService: IdeReportService) {}

  /** Submit a report from the IDE (logged-in users) */
  @Post()
  @UseGuards(AuthGuard)
  async create(@Req() req: express.Request, @Body() body: CreateIdeReportInput) {
    const user = (req as any).user as { userId: string; email?: string };
    return this.ideReportService.create(user, body);
  }

  /** List reports for triage (admin key) */
  @Get()
  @UseGuards(AdminGuard)
  async list(@Query('status') status?: string) {
    return this.ideReportService.list(status);
  }

  /** Update status / notes (admin key) */
  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() body: UpdateIdeReportInput) {
    return this.ideReportService.update(id, body);
  }
}
