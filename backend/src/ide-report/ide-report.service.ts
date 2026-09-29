import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  IdeReportCategory,
  IdeReportStatus,
} from '../../generated/prisma/enums';

export const REPORT_LIMITS = {
  minMessage: 10,
  maxMessage: 5000,
  maxDiagnosticsBytes: 64 * 1024,
  maxAdminNotes: 5000,
  perUserPerHour: 10,
};

export interface CreateIdeReportInput {
  category: string;
  message: string;
  diagnostics?: unknown;
}

export interface UpdateIdeReportInput {
  status?: string;
  adminNotes?: string;
}

const CATEGORIES = Object.values(IdeReportCategory) as string[];
const STATUSES = Object.values(IdeReportStatus) as string[];

@Injectable()
export class IdeReportService {
  private readonly logger = new Logger(IdeReportService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async create(
    user: { userId: string; email?: string },
    input: CreateIdeReportInput,
  ) {
    const category = String(input?.category ?? '').toUpperCase();
    if (!CATEGORIES.includes(category)) {
      throw new BadRequestException(
        `category must be one of: ${CATEGORIES.join(', ')}`,
      );
    }

    const message = String(input?.message ?? '').trim();
    if (message.length < REPORT_LIMITS.minMessage) {
      throw new BadRequestException(
        `Please describe the problem in at least ${REPORT_LIMITS.minMessage} characters`,
      );
    }
    if (message.length > REPORT_LIMITS.maxMessage) {
      throw new BadRequestException(
        `message must be at most ${REPORT_LIMITS.maxMessage} characters`,
      );
    }

    let diagnostics: object | undefined;
    if (input?.diagnostics !== undefined && input.diagnostics !== null) {
      if (typeof input.diagnostics !== 'object') {
        throw new BadRequestException('diagnostics must be an object');
      }
      const size = Buffer.byteLength(JSON.stringify(input.diagnostics));
      if (size > REPORT_LIMITS.maxDiagnosticsBytes) {
        throw new BadRequestException(
          `diagnostics too large (${size} bytes, max ${REPORT_LIMITS.maxDiagnosticsBytes})`,
        );
      }
      diagnostics = input.diagnostics as object;
    }

    const since = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await this.prisma.ideReport.count({
      where: { userId: user.userId, createdAt: { gte: since } },
    });
    if (recent >= REPORT_LIMITS.perUserPerHour) {
      throw new HttpException(
        'Too many reports in the last hour — please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const report = await this.prisma.ideReport.create({
      data: {
        userId: user.userId,
        email: user.email ?? null,
        category: category as IdeReportCategory,
        message,
        diagnostics: diagnostics as any,
      },
    });

    // Fire-and-forget: a webhook failure must never fail the report
    void this.notifyWebhook(report.id, category, message, user.email);

    return { id: report.id, createdAt: report.createdAt };
  }

  async list(status?: string) {
    if (status && !STATUSES.includes(status)) {
      throw new BadRequestException(
        `status must be one of: ${STATUSES.join(', ')}`,
      );
    }
    const [reports, counts] = await Promise.all([
      this.prisma.ideReport.findMany({
        where: status ? { status: status as IdeReportStatus } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.ideReport.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const row of counts) byStatus[row.status] = row._count._all;

    return { reports, counts: byStatus };
  }

  async update(id: string, input: UpdateIdeReportInput) {
    const data: { status?: IdeReportStatus; adminNotes?: string } = {};
    if (input?.status !== undefined) {
      if (!STATUSES.includes(input.status)) {
        throw new BadRequestException(
          `status must be one of: ${STATUSES.join(', ')}`,
        );
      }
      data.status = input.status as IdeReportStatus;
    }
    if (input?.adminNotes !== undefined) {
      const notes = String(input.adminNotes);
      if (notes.length > REPORT_LIMITS.maxAdminNotes) {
        throw new BadRequestException('adminNotes too long');
      }
      data.adminNotes = notes;
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nothing to update');
    }

    const existing = await this.prisma.ideReport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Report not found');

    return this.prisma.ideReport.update({ where: { id }, data });
  }

  /** Optional Discord/Slack-compatible webhook (IDE_REPORT_WEBHOOK_URL) */
  private async notifyWebhook(
    id: string,
    category: string,
    message: string,
    email?: string,
  ) {
    const url = this.config.get<string>('IDE_REPORT_WEBHOOK_URL');
    if (!url) return;
    const preview = message.length > 300 ? `${message.slice(0, 300)}…` : message;
    const text = `🐞 New IDE report (${category}) from ${email ?? 'unknown'}\n${preview}\nID: ${id}`;
    try {
      // Discord reads "content", Slack reads "text"
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, text }),
      });
    } catch (error) {
      this.logger.warn(`IDE report webhook failed: ${(error as Error).message}`);
    }
  }
}
