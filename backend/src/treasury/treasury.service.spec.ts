import { HttpException } from '@nestjs/common';
import { ethers } from 'ethers';
import { TreasuryService } from './treasury.service';
import { TreasuryController } from './treasury.controller';
import { BillingV2Abi } from '../abis/BillingV2Abi';
import { TreasuryOpType } from '../../generated/prisma/enums';

// The generated Prisma client uses ESM `.js` specifiers jest can't resolve;
// the service only needs PrismaService as an injected type here.
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));

/**
 * Covers the backend side of audit 2026-09-28 finding 8:
 * treasury moves are a propose -> execute (48h timelock) flow, and the
 * reserve ratio floor is 20%.
 */
describe('TreasuryService (timelocked treasury moves)', () => {
  const receipt = { hash: '0xabc' };
  const tx = { wait: jest.fn().mockResolvedValue(receipt) };

  let prisma: { treasuryOperation: { create: jest.Mock } };
  let contract: { getPendingTreasuryMove: jest.Mock };
  let signer: {
    proposeTreasuryMove: jest.Mock;
    executeTreasuryMove: jest.Mock;
    cancelTreasuryMove: jest.Mock;
  };
  let service: TreasuryService;

  beforeEach(() => {
    prisma = { treasuryOperation: { create: jest.fn() } };
    contract = { getPendingTreasuryMove: jest.fn() };
    signer = {
      proposeTreasuryMove: jest.fn().mockResolvedValue(tx),
      executeTreasuryMove: jest.fn().mockResolvedValue(tx),
      cancelTreasuryMove: jest.fn().mockResolvedValue(tx),
    };

    // No operator key => constructor leaves signer unset; inject mocks instead
    const config = {
      get: jest.fn((key: string) =>
        key === 'CONTRACT_ADDRESS_V2' ? ethers.ZeroAddress : undefined,
      ),
    };
    service = new TreasuryService(prisma as any, config as any);
    (service as any).contract = contract;
    (service as any).contractWithSigner = signer;
  });

  it('proposes a move in wei and does not record an operation yet', async () => {
    const result = await service.proposeTreasuryMove('80.5');

    expect(result).toEqual({ success: true, txHash: '0xabc' });
    expect(signer.proposeTreasuryMove).toHaveBeenCalledWith(
      ethers.parseUnits('80.5', 18),
    );
    expect(prisma.treasuryOperation.create).not.toHaveBeenCalled();
  });

  it('executes the pending move and records the on-chain amount', async () => {
    contract.getPendingTreasuryMove.mockResolvedValue({
      _amount: ethers.parseUnits('80', 18),
      _executeAfter: 0n,
      _expiresAt: 0n,
      _canExecute: true,
    });

    const result = await service.executeTreasuryMove('note');

    expect(result.success).toBe(true);
    expect(signer.executeTreasuryMove).toHaveBeenCalled();
    expect(prisma.treasuryOperation.create).toHaveBeenCalledWith({
      data: {
        type: TreasuryOpType.MOVE_TO_YIELD,
        amount: '80.0',
        txHash: '0xabc',
        notes: 'note',
      },
    });
  });

  it('surfaces a timelock revert without recording an operation', async () => {
    contract.getPendingTreasuryMove.mockResolvedValue({
      _amount: ethers.parseUnits('80', 18),
      _executeAfter: 0n,
      _expiresAt: 0n,
      _canExecute: false,
    });
    signer.executeTreasuryMove.mockRejectedValue(
      new Error('execution reverted: Timelock not expired'),
    );

    const result = await service.executeTreasuryMove();

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Timelock not expired/);
    expect(prisma.treasuryOperation.create).not.toHaveBeenCalled();
  });

  it('cancels a pending move', async () => {
    const result = await service.cancelTreasuryMove();
    expect(result.success).toBe(true);
    expect(signer.cancelTreasuryMove).toHaveBeenCalled();
  });

  it('returns null when no move is pending', async () => {
    contract.getPendingTreasuryMove.mockResolvedValue({
      _amount: 0n,
      _executeAfter: 0n,
      _expiresAt: 0n,
      _canExecute: false,
    });
    expect(await service.getPendingTreasuryMove()).toBeNull();
  });

  it('formats a pending move with ISO timestamps', async () => {
    contract.getPendingTreasuryMove.mockResolvedValue({
      _amount: ethers.parseUnits('25', 18),
      _executeAfter: 1_800_000_000n,
      _expiresAt: 1_800_604_800n,
      _canExecute: false,
    });

    expect(await service.getPendingTreasuryMove()).toEqual({
      amount: '25.0',
      executeAfter: new Date(1_800_000_000 * 1000).toISOString(),
      expiresAt: new Date(1_800_604_800 * 1000).toISOString(),
      canExecute: false,
    });
  });

  it('refuses writes when no operator is configured', async () => {
    (service as any).contractWithSigner = undefined;
    for (const result of [
      await service.proposeTreasuryMove('1'),
      await service.executeTreasuryMove(),
      await service.cancelTreasuryMove(),
    ]) {
      expect(result).toEqual({
        success: false,
        error: 'Platform operator not configured',
      });
    }
  });
});

describe('TreasuryController reserve ratio validation', () => {
  const treasuryService = {
    updateReserveRatio: jest.fn().mockResolvedValue({ success: true }),
  };
  const controller = new TreasuryController(treasuryService as any);

  it.each([1000, 1999, 5001])('rejects %i bps', async (bps) => {
    await expect(
      controller.updateReserveRatio({ newRatioBps: bps }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it.each([2000, 5000])('accepts %i bps', async (bps) => {
    await expect(
      controller.updateReserveRatio({ newRatioBps: bps }),
    ).resolves.toEqual({ success: true });
  });
});

describe('BillingV2Abi', () => {
  const names = (BillingV2Abi.abi as any[]).map((e) => e.name);

  it('no longer exposes the immediate moveCollateralToTreasury', () => {
    expect(names).not.toContain('moveCollateralToTreasury');
  });

  it.each([
    'proposeTreasuryMove',
    'executeTreasuryMove',
    'cancelTreasuryMove',
    'getPendingTreasuryMove',
    'getLiquidityStatus',
    'getQueuedWithdrawal',
    'EarlyWithdrawalPenaltyPaid',
    'TreasuryMoveProposed',
    'TreasuryMoveCancelled',
  ])('exposes %s', (name) => {
    expect(names).toContain(name);
  });

  it('matches the compiled contract ABI for every entry it declares', () => {
    // Guards against the hand-maintained backend ABI drifting from the contract
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const artifact = require('../../../contracts/artifacts/contracts/BillingContractV2.sol/MezoHostBillingV2.json');
    const iface = new ethers.Interface(artifact.abi);
    const backendIface = new ethers.Interface(BillingV2Abi.abi as any);
    backendIface.forEachFunction((fn) => {
      expect(iface.getFunction(fn.selector)?.format()).toBe(fn.format());
    });
    backendIface.forEachEvent((ev) => {
      expect(iface.getEvent(ev.topicHash)?.format()).toBe(ev.format());
    });
  });
});
