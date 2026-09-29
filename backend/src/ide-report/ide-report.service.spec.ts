import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { IdeReportService, REPORT_LIMITS } from './ide-report.service';
import { IdeReportController } from './ide-report.controller';

// The generated Prisma client uses ESM `.js` specifiers jest can't resolve;
// the service only needs PrismaService as an injected type here.
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));

const user = { userId: 'user-1', email: 'dev@example.com' };
const validInput = { category: 'bug', message: 'Deploy button does nothing on testnet' };

function makePrisma() {
  return {
    ideReport: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({ id: 'report-1', createdAt: new Date('2026-09-29T00:00:00Z'), ...data }),
      ),
      findMany: jest.fn().mockResolvedValue([]),
      groupBy: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'report-1', ...data })),
    },
  };
}

describe('IdeReportService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let config: { get: jest.Mock };
  let service: IdeReportService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    prisma = makePrisma();
    config = { get: jest.fn().mockReturnValue(undefined) };
    service = new IdeReportService(prisma as any, config as any);
    fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as any;
  });

  describe('create', () => {
    it('stores a normalised report and returns its id', async () => {
      const result = await service.create(user, {
        ...validInput,
        message: `  ${validInput.message}  `,
        diagnostics: { logs: ['a'] },
      });

      expect(result.id).toBe('report-1');
      expect(prisma.ideReport.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          email: 'dev@example.com',
          category: 'BUG',
          message: validInput.message,
          diagnostics: { logs: ['a'] },
        },
      });
    });

    it.each([
      [{ ...validInput, category: 'nonsense' }, /category must be one of/],
      [{ ...validInput, category: undefined }, /category must be one of/],
      [{ ...validInput, message: 'short' }, /at least 10 characters/],
      [{ ...validInput, message: 'x'.repeat(REPORT_LIMITS.maxMessage + 1) }, /at most/],
      [{ ...validInput, diagnostics: 'not-an-object' }, /diagnostics must be an object/],
      [
        { ...validInput, diagnostics: { blob: 'x'.repeat(REPORT_LIMITS.maxDiagnosticsBytes) } },
        /diagnostics too large/,
      ],
    ])('rejects invalid input %#', async (input, message) => {
      await expect(service.create(user, input as any)).rejects.toThrow(message);
      await expect(service.create(user, input as any)).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.ideReport.create).not.toHaveBeenCalled();
    });

    it('rate-limits a user to 10 reports per hour', async () => {
      prisma.ideReport.count.mockResolvedValue(REPORT_LIMITS.perUserPerHour);

      const error = await service.create(user, validInput).catch((e) => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(429);
      expect(prisma.ideReport.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', createdAt: { gte: expect.any(Date) } },
      });
      expect(prisma.ideReport.create).not.toHaveBeenCalled();
    });

    it('does not call a webhook when none is configured', async () => {
      await service.create(user, validInput);
      await new Promise((r) => setImmediate(r));
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('notifies a Discord/Slack-compatible webhook when configured', async () => {
      config.get.mockReturnValue('https://hooks.example/abc');

      await service.create(user, validInput);
      await new Promise((r) => setImmediate(r));

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://hooks.example/abc');
      const body = JSON.parse(init.body);
      expect(body.content).toContain('BUG');
      expect(body.content).toContain('dev@example.com');
      expect(body.text).toBe(body.content);
    });

    it('still succeeds when the webhook fails', async () => {
      config.get.mockReturnValue('https://hooks.example/abc');
      fetchMock.mockRejectedValue(new Error('network down'));

      await expect(service.create(user, validInput)).resolves.toMatchObject({ id: 'report-1' });
    });
  });

  describe('list', () => {
    it('returns reports and a count for every status', async () => {
      prisma.ideReport.groupBy.mockResolvedValue([
        { status: 'OPEN', _count: { _all: 3 } },
        { status: 'RESOLVED', _count: { _all: 1 } },
      ]);

      const result = await service.list();

      expect(result.counts).toEqual({ OPEN: 3, IN_PROGRESS: 0, RESOLVED: 1, WONT_FIX: 0 });
      expect(prisma.ideReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined, orderBy: { createdAt: 'desc' }, take: 200 }),
      );
    });

    it('filters by a valid status and rejects an invalid one', async () => {
      await service.list('OPEN');
      expect(prisma.ideReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'OPEN' } }),
      );
      await expect(service.list('DONE')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('updates status and notes', async () => {
      prisma.ideReport.findUnique.mockResolvedValue({ id: 'report-1' });

      await service.update('report-1', { status: 'RESOLVED', adminNotes: 'Fixed in v2' });

      expect(prisma.ideReport.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { status: 'RESOLVED', adminNotes: 'Fixed in v2' },
      });
    });

    it('rejects invalid status, empty updates and unknown ids', async () => {
      await expect(service.update('report-1', { status: 'DONE' })).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.update('report-1', {})).rejects.toThrow(/Nothing to update/);

      prisma.ideReport.findUnique.mockResolvedValue(null);
      await expect(service.update('missing', { status: 'OPEN' })).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

describe('IdeReportController', () => {
  it('passes the authenticated user to the service', async () => {
    const service = { create: jest.fn().mockResolvedValue({ id: 'r1' }) };
    const controller = new IdeReportController(service as any);
    const req = { user: { userId: 'u1', email: 'a@b.c' } } as any;

    await controller.create(req, validInput);

    expect(service.create).toHaveBeenCalledWith({ userId: 'u1', email: 'a@b.c' }, validInput);
  });
});
