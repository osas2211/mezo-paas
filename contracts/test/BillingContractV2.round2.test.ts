import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { network } from "hardhat";
import {
  parseEther,
  parseEventLogs,
  type Address,
  type Hash,
  type WalletClient,
  type GetContractReturnType,
} from "viem";

/**
 * Round 2 security tests for MezoHostBillingV2 (audit 2026-09-28)
 *
 * - Finding 6: early-withdrawal penalty must not leave the contract on the queued path
 * - Finding 7: pause() must not block user exits
 * - Finding 8: 20% reserve floor, 48h timelock on treasury moves, liquidity disclosure
 * - Adjacent: immediate payouts must not consume funds owed to queued withdrawals
 */

describe("MezoHostBillingV2 Round 2 Security Tests", async () => {
  let networkConnection: Awaited<ReturnType<typeof network.create>>;
  let viem: typeof networkConnection.viem;
  let provider: typeof networkConnection.provider;
  let publicClient: Awaited<ReturnType<typeof viem.getPublicClient>>;
  let owner: WalletClient;
  let treasury: WalletClient;
  let user1: WalletClient;
  let user2: WalletClient;
  let billing: GetContractReturnType;
  let token: GetContractReturnType;
  let billingContract: Address;

  const SEVEN_DAYS = 7n * 24n * 60n * 60n;
  const TREASURY_MOVE_DELAY = 48n * 60n * 60n;
  const EXECUTION_WINDOW = 7n * 24n * 60n * 60n;

  beforeEach(async () => {
    networkConnection = await network.create();
    viem = networkConnection.viem;
    provider = networkConnection.provider;
    publicClient = await viem.getPublicClient();

    [owner, treasury, user1, user2] = await viem.getWalletClients();

    token = await viem.deployContract("MockBTC", [], { walletClient: owner });
    billing = await viem.deployContract(
      "MezoHostBillingV2",
      [token.address, treasury.account!.address],
      { walletClient: owner }
    );
    billingContract = billing.address;

    for (const user of [user1, user2]) {
      await token.write.transfer([user.account!.address, parseEther("1000")], {
        account: owner.account!,
      });
      await token.write.approve([billingContract, parseEther("1000")], {
        account: user.account!,
      });
    }

    // Treasury pre-approves returns so tests can call returnCollateralFromTreasury
    await token.write.approve([billingContract, parseEther("1000000")], {
      account: treasury.account!,
    });
  });

  // ---------- helpers ----------

  async function advanceTime(seconds: bigint) {
    await provider.send("evm_increaseTime", [Number(seconds)]);
    await provider.send("evm_mine", []);
  }

  async function lockAs(user: WalletClient, amount: bigint, duration = SEVEN_DAYS) {
    return billing.write.lockCollateral(
      [user.account!.address, amount, duration],
      { account: user.account! }
    );
  }

  async function withdrawAs(user: WalletClient): Promise<Hash> {
    return billing.write.withdrawCollateral([user.account!.address], {
      account: user.account!,
    });
  }

  async function claimAs(user: WalletClient): Promise<Hash> {
    return billing.write.claimQueuedWithdrawal({ account: user.account! });
  }

  async function moveToTreasury(amount: bigint) {
    await billing.write.proposeTreasuryMove([amount], { account: owner.account! });
    await advanceTime(TREASURY_MOVE_DELAY);
    await billing.write.executeTreasuryMove({ account: owner.account! });
  }

  async function returnFromTreasury(amount: bigint) {
    await billing.write.returnCollateralFromTreasury([amount], {
      account: owner.account!,
    });
  }

  async function balanceOf(addr: Address): Promise<bigint> {
    return (await token.read.balanceOf([addr])) as bigint;
  }

  async function eventsIn(hash: Hash, eventName: string) {
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return parseEventLogs({
      abi: billing.abi,
      logs: receipt.logs,
      eventName: eventName as any,
    }) as any[];
  }

  async function totalPending(): Promise<bigint> {
    return (await billing.read.totalPendingWithdrawals()) as bigint;
  }

  // =========================================
  // Finding 6: Penalty on queued path
  // =========================================

  describe("Finding 6: penalty is never taken for an undelivered payout", async () => {
    it("auditor PoC: queued early withdrawal moves nothing to treasury", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("1000"));
      await moveToTreasury(parseEther("1600")); // contract holds 400

      const treasuryBefore = await balanceOf(treasury.account!.address);
      const userBefore = await balanceOf(user1.account!.address);
      const contractBefore = await balanceOf(billingContract);

      // Still inside the 7-day lock (only 48h elapsed) => early
      const hash = await withdrawAs(user1);

      assert.strictEqual(await balanceOf(treasury.account!.address), treasuryBefore, "treasury gained nothing");
      assert.strictEqual(await balanceOf(user1.account!.address), userBefore, "user received nothing");
      assert.strictEqual(await balanceOf(billingContract), contractBefore, "no tokens left the contract");
      assert.strictEqual((await eventsIn(hash, "EarlyWithdrawalPenaltyPaid")).length, 0);

      const [amount, penalty, , isPending, claimableNow] =
        (await billing.read.getQueuedWithdrawal([user1.account!.address])) as any[];
      assert.strictEqual(amount, parseEther("950"));
      assert.strictEqual(penalty, parseEther("50"));
      assert.strictEqual(isPending, true);
      assert.strictEqual(claimableNow, false);

      // Gross liability (payout + penalty) is tracked; no shortfall created by the withdrawal itself
      assert.strictEqual(await totalPending(), parseEther("1000"));
      assert.strictEqual(
        (await billing.read.totalLockedCollateral()) as bigint,
        parseEther("1000")
      );
    });

    it("control: fully funded early withdrawal pays user and penalty together", async () => {
      await lockAs(user1, parseEther("1000"));

      const treasuryBefore = await balanceOf(treasury.account!.address);
      const userBefore = await balanceOf(user1.account!.address);

      const hash = await withdrawAs(user1);

      assert.strictEqual(await balanceOf(user1.account!.address) - userBefore, parseEther("950"));
      assert.strictEqual(await balanceOf(treasury.account!.address) - treasuryBefore, parseEther("50"));
      assert.strictEqual(await balanceOf(billingContract), 0n);

      const penaltyEvents = await eventsIn(hash, "EarlyWithdrawalPenaltyPaid");
      assert.strictEqual(penaltyEvents.length, 1);
      assert.strictEqual(penaltyEvents[0].args.penalty, parseEther("50"));

      const withdrawn = await eventsIn(hash, "CollateralWithdrawn");
      assert.strictEqual(withdrawn[0].args.wasSlashed, true);

      const request = (await billing.read.getWithdrawalRequest([user1.account!.address])) as any[];
      assert.strictEqual(request[2], false, "not queued");
    });

    it("matured queued withdrawal records zero penalty", async () => {
      await lockAs(user1, parseEther("100"));
      await moveToTreasury(parseEther("80"));
      await advanceTime(SEVEN_DAYS);

      await withdrawAs(user1);

      const [amount, penalty, , isPending] =
        (await billing.read.getQueuedWithdrawal([user1.account!.address])) as any[];
      assert.strictEqual(amount, parseEther("100"));
      assert.strictEqual(penalty, 0n);
      assert.strictEqual(isPending, true);
    });

    it("claim settles payout and penalty together", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("1000"));
      await moveToTreasury(parseEther("1600"));
      await withdrawAs(user1); // queued: 950 payout + 50 penalty

      await returnFromTreasury(parseEther("600")); // contract 1000 >= 950 + 50

      const treasuryBefore = await balanceOf(treasury.account!.address);
      const userBefore = await balanceOf(user1.account!.address);

      const hash = await claimAs(user1);

      assert.strictEqual(await balanceOf(user1.account!.address) - userBefore, parseEther("950"));
      assert.strictEqual(await balanceOf(treasury.account!.address) - treasuryBefore, parseEther("50"));
      assert.strictEqual(await totalPending(), 0n);

      const penaltyEvents = await eventsIn(hash, "EarlyWithdrawalPenaltyPaid");
      assert.strictEqual(penaltyEvents.length, 1);
      const processed = await eventsIn(hash, "WithdrawalProcessed");
      assert.strictEqual(processed[0].args.amount, parseEther("950"));

      const [amount, penalty, , isPending] =
        (await billing.read.getQueuedWithdrawal([user1.account!.address])) as any[];
      assert.strictEqual(amount, 0n);
      assert.strictEqual(penalty, 0n);
      assert.strictEqual(isPending, false);
    });

    it("claim reverts when balance covers the payout but not payout + penalty", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("1000"));
      await moveToTreasury(parseEther("1600")); // 400 left
      await withdrawAs(user1);

      await returnFromTreasury(parseEther("560")); // 960: >= 950 but < 1000

      const q = (await billing.read.getQueuedWithdrawal([user1.account!.address])) as any[];
      assert.strictEqual(q[4], false, "claimableNow reflects the gross requirement");

      await assert.rejects(claimAs(user1), { message: /Insufficient contract balance/ });

      await returnFromTreasury(parseEther("40"));
      const q2 = (await billing.read.getQueuedWithdrawal([user1.account!.address])) as any[];
      assert.strictEqual(q2[4], true);
      await claimAs(user1);
    });

    it("owner processQueuedWithdrawal also settles the penalty and flags wasSlashed", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("1000"));
      await moveToTreasury(parseEther("1600"));
      await withdrawAs(user1);
      await returnFromTreasury(parseEther("600"));

      const treasuryBefore = await balanceOf(treasury.account!.address);
      const hash = await billing.write.processQueuedWithdrawal(
        [user1.account!.address, user1.account!.address],
        { account: owner.account! }
      );

      assert.strictEqual(await balanceOf(treasury.account!.address) - treasuryBefore, parseEther("50"));
      const withdrawn = await eventsIn(hash, "CollateralWithdrawn");
      assert.strictEqual(withdrawn[0].args.amount, parseEther("950"));
      assert.strictEqual(withdrawn[0].args.wasSlashed, true);
      assert.strictEqual(await totalPending(), 0n);
    });

    it("queued liabilities are unchanged by the queue, so no reserve can be moved against them", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("1000"));
      await moveToTreasury(parseEther("1600"));
      await withdrawAs(user1);

      const status = (await billing.read.getContractStatus()) as any[];
      // liabilities = 1000 locked + 1000 pending = 2000; reserve 400; balance 400
      assert.strictEqual(status[4], 0n, "nothing available to move");
      await assert.rejects(
        billing.write.proposeTreasuryMove([1n], { account: owner.account! }),
        { message: /Would breach reserve ratio/ }
      );
    });
  });

  // =========================================
  // Adjacent: queue priority
  // =========================================

  describe("Immediate payouts cannot jump ahead of queued withdrawals", async () => {
    it("new withdrawal is queued when free balance is owed to an existing queue entry", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("1000"));
      await moveToTreasury(parseEther("1600"));
      await advanceTime(SEVEN_DAYS);

      await withdrawAs(user1); // queued 1000
      await returnFromTreasury(parseEther("1000")); // balance 1400, 1000 owed to user1

      // Without the fix user2 would drain 1000 of the 1400 and strand user1 again
      await withdrawAs(user2);
      const req2 = (await billing.read.getWithdrawalRequest([user2.account!.address])) as any[];
      assert.strictEqual(req2[2], true, "user2 queued behind user1");

      const userBefore = await balanceOf(user1.account!.address);
      await claimAs(user1);
      assert.strictEqual(await balanceOf(user1.account!.address) - userBefore, parseEther("1000"));
    });

    it("totalPendingWithdrawals equals the sum of queued payouts + penalties", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("500"));
      await moveToTreasury(parseEther("1200")); // 300 left

      await withdrawAs(user1); // early: 950 + 50
      await withdrawAs(user2); // early: 475 + 25

      const q1 = (await billing.read.getQueuedWithdrawal([user1.account!.address])) as any[];
      const q2 = (await billing.read.getQueuedWithdrawal([user2.account!.address])) as any[];
      assert.strictEqual(await totalPending(), q1[0] + q1[1] + q2[0] + q2[1]);
      assert.strictEqual(await totalPending(), parseEther("1500"));
    });
  });

  // =========================================
  // Finding 7: Pause cannot block exits
  // =========================================

  describe("Finding 7: pause() does not block user exits", async () => {
    it("auditor PoC: claimQueuedWithdrawal succeeds while paused", async () => {
      await lockAs(user1, parseEther("100"));
      await moveToTreasury(parseEther("80"));
      await advanceTime(SEVEN_DAYS);
      await withdrawAs(user1);
      await returnFromTreasury(parseEther("80"));

      await billing.write.pause({ account: owner.account! });

      const before = await balanceOf(user1.account!.address);
      await claimAs(user1);
      assert.strictEqual(await balanceOf(user1.account!.address) - before, parseEther("100"));
    });

    it("withdrawCollateral succeeds while paused", async () => {
      await lockAs(user1, parseEther("100"));
      await advanceTime(SEVEN_DAYS);
      await billing.write.pause({ account: owner.account! });

      const before = await balanceOf(user1.account!.address);
      await withdrawAs(user1);
      assert.strictEqual(await balanceOf(user1.account!.address) - before, parseEther("100"));
    });

    it("early withdrawal while paused still applies penalty correctly", async () => {
      await lockAs(user1, parseEther("100"));
      await billing.write.pause({ account: owner.account! });

      const before = await balanceOf(user1.account!.address);
      await withdrawAs(user1);
      assert.strictEqual(await balanceOf(user1.account!.address) - before, parseEther("95"));
    });

    it("pause still blocks new deposits", async () => {
      await billing.write.pause({ account: owner.account! });

      await assert.rejects(lockAs(user1, parseEther("100")), { message: /EnforcedPause/ });
      await assert.rejects(
        billing.write.topUpAccount([user1.account!.address, parseEther("1")], {
          account: user1.account!,
        }),
        { message: /EnforcedPause/ }
      );
    });

    it("pause blocks treasury moves (owner outflows), not just users", async () => {
      await lockAs(user1, parseEther("100"));
      await billing.write.proposeTreasuryMove([parseEther("50")], { account: owner.account! });
      await billing.write.pause({ account: owner.account! });
      await advanceTime(TREASURY_MOVE_DELAY);

      await assert.rejects(
        billing.write.executeTreasuryMove({ account: owner.account! }),
        { message: /EnforcedPause/ }
      );
      await assert.rejects(
        billing.write.proposeTreasuryMove([parseEther("1")], { account: owner.account! }),
        { message: /EnforcedPause/ }
      );

      const pending = (await billing.read.getPendingTreasuryMove()) as any[];
      assert.strictEqual(pending[3], false, "canExecute is false while paused");
    });
  });

  // =========================================
  // Finding 8: Reserve policy
  // =========================================

  describe("Finding 8: reserve floor", async () => {
    it("rejects reserve ratios below 20%", async () => {
      for (const bps of [1000n, 1999n]) {
        await assert.rejects(
          billing.write.updateReserveRatio([bps], { account: owner.account! }),
          { message: /Minimum reserve: 20%/ }
        );
      }
    });

    it("accepts 20%..50% and rejects above 50%", async () => {
      await billing.write.updateReserveRatio([2000n], { account: owner.account! });
      await billing.write.updateReserveRatio([5000n], { account: owner.account! });
      assert.strictEqual(await billing.read.reserveRatioBps(), 5000n);
      await assert.rejects(
        billing.write.updateReserveRatio([5001n], { account: owner.account! }),
        { message: /Maximum reserve: 50%/ }
      );
    });

    it("exposes the policy constants", async () => {
      assert.strictEqual(await billing.read.MIN_RESERVE_RATIO_BPS(), 2000n);
      assert.strictEqual(await billing.read.MAX_RESERVE_RATIO_BPS(), 5000n);
      assert.strictEqual(await billing.read.TREASURY_MOVE_DELAY(), TREASURY_MOVE_DELAY);
    });
  });

  describe("Finding 8: timelocked treasury moves", async () => {
    it("immediate moveCollateralToTreasury no longer exists", async () => {
      const names = (billing.abi as any[]).map((f) => f.name);
      assert.ok(!names.includes("moveCollateralToTreasury"));
      assert.ok(names.includes("proposeTreasuryMove"));
      assert.ok(names.includes("executeTreasuryMove"));
    });

    it("cannot execute before 48h; executes after", async () => {
      await lockAs(user1, parseEther("100"));
      const hash = await billing.write.proposeTreasuryMove([parseEther("80")], {
        account: owner.account!,
      });
      const proposed = await eventsIn(hash, "TreasuryMoveProposed");
      assert.strictEqual(proposed[0].args.amount, parseEther("80"));

      await assert.rejects(
        billing.write.executeTreasuryMove({ account: owner.account! }),
        { message: /Timelock not expired/ }
      );

      await advanceTime(TREASURY_MOVE_DELAY - 10n);
      await assert.rejects(
        billing.write.executeTreasuryMove({ account: owner.account! }),
        { message: /Timelock not expired/ }
      );

      await advanceTime(10n);
      const before = await balanceOf(treasury.account!.address);
      await billing.write.executeTreasuryMove({ account: owner.account! });
      assert.strictEqual(await balanceOf(treasury.account!.address) - before, parseEther("80"));
      assert.strictEqual(await billing.read.pendingMoveAmount(), 0n);
      assert.strictEqual(await billing.read.totalInTreasury(), parseEther("80"));
    });

    it("proposal beyond the reserve is rejected up front", async () => {
      await lockAs(user1, parseEther("100"));
      await assert.rejects(
        billing.write.proposeTreasuryMove([parseEther("81")], { account: owner.account! }),
        { message: /Would breach reserve ratio/ }
      );
      await assert.rejects(
        billing.write.proposeTreasuryMove([0n], { account: owner.account! }),
        { message: /Amount must be greater than 0/ }
      );
    });

    it("only one move may be pending", async () => {
      await lockAs(user1, parseEther("100"));
      await billing.write.proposeTreasuryMove([parseEther("10")], { account: owner.account! });
      await assert.rejects(
        billing.write.proposeTreasuryMove([parseEther("10")], { account: owner.account! }),
        { message: /Treasury move already pending/ }
      );
    });

    it("users can exit during the notice window; execution re-checks the reserve", async () => {
      await lockAs(user1, parseEther("100"));
      await lockAs(user2, parseEther("100"));
      await advanceTime(SEVEN_DAYS);

      await billing.write.proposeTreasuryMove([parseEther("160")], { account: owner.account! });

      // user1 sees the proposal and exits in full before it executes
      const before = await balanceOf(user1.account!.address);
      await withdrawAs(user1);
      assert.strictEqual(await balanceOf(user1.account!.address) - before, parseEther("100"));

      await advanceTime(TREASURY_MOVE_DELAY);
      // Remaining: 100 balance, 100 liabilities, 20 reserve => only 80 movable
      await assert.rejects(
        billing.write.executeTreasuryMove({ account: owner.account! }),
        { message: /Would breach reserve ratio/ }
      );
    });

    it("proposal expires after the execution window and can be cleared", async () => {
      await lockAs(user1, parseEther("100"));
      await billing.write.proposeTreasuryMove([parseEther("50")], { account: owner.account! });
      await advanceTime(TREASURY_MOVE_DELAY + EXECUTION_WINDOW + 1n);

      await assert.rejects(
        billing.write.executeTreasuryMove({ account: owner.account! }),
        { message: /Treasury move expired/ }
      );

      const hash = await billing.write.cancelTreasuryMove({ account: owner.account! });
      const cancelled = await eventsIn(hash, "TreasuryMoveCancelled");
      assert.strictEqual(cancelled[0].args.amount, parseEther("50"));
      assert.strictEqual(await billing.read.pendingMoveAmount(), 0n);

      await assert.rejects(
        billing.write.executeTreasuryMove({ account: owner.account! }),
        { message: /No pending treasury move/ }
      );
    });

    it("treasury move functions are owner-only", async () => {
      await lockAs(user1, parseEther("100"));
      await assert.rejects(
        billing.write.proposeTreasuryMove([parseEther("10")], { account: user1.account! }),
        { message: /OwnableUnauthorizedAccount/ }
      );
      await billing.write.proposeTreasuryMove([parseEther("10")], { account: owner.account! });
      await advanceTime(TREASURY_MOVE_DELAY);
      await assert.rejects(
        billing.write.executeTreasuryMove({ account: user1.account! }),
        { message: /OwnableUnauthorizedAccount/ }
      );
      await assert.rejects(
        billing.write.cancelTreasuryMove({ account: user1.account! }),
        { message: /OwnableUnauthorizedAccount/ }
      );
    });

    it("getPendingTreasuryMove reports timing and executability", async () => {
      const empty = (await billing.read.getPendingTreasuryMove()) as any[];
      assert.deepStrictEqual(empty, [0n, 0n, 0n, false]);

      await lockAs(user1, parseEther("100"));
      await billing.write.proposeTreasuryMove([parseEther("80")], { account: owner.account! });

      const p = (await billing.read.getPendingTreasuryMove()) as any[];
      assert.strictEqual(p[0], parseEther("80"));
      assert.strictEqual(p[2] - p[1], EXECUTION_WINDOW);
      assert.strictEqual(p[3], false);

      await advanceTime(TREASURY_MOVE_DELAY);
      const p2 = (await billing.read.getPendingTreasuryMove()) as any[];
      assert.strictEqual(p2[3], true);
    });
  });

  describe("Finding 8: liquidity disclosure", async () => {
    it("reports 100% liquidity with no liabilities", async () => {
      const s = (await billing.read.getLiquidityStatus()) as any[];
      assert.strictEqual(s[1], 0n);
      assert.strictEqual(s[2], 10000n);
      assert.strictEqual(s[3], 2000n);
    });

    it("reports on-demand liquidity and pending move", async () => {
      await lockAs(user1, parseEther("1000"));
      await billing.write.proposeTreasuryMove([parseEther("800")], { account: owner.account! });

      let s = (await billing.read.getLiquidityStatus()) as any[];
      assert.strictEqual(s[2], 10000n, "fully liquid before execution");
      assert.strictEqual(s[4], parseEther("800"));
      assert.ok(s[5] > 0n);

      await advanceTime(TREASURY_MOVE_DELAY);
      await billing.write.executeTreasuryMove({ account: owner.account! });

      s = (await billing.read.getLiquidityStatus()) as any[];
      assert.strictEqual(s[0], parseEther("200"));
      assert.strictEqual(s[1], parseEther("1000"));
      assert.strictEqual(s[2], 2000n, "20% redeemable on demand");
      assert.strictEqual(s[4], 0n);
      assert.strictEqual(s[5], 0n);
    });
  });

  // =========================================
  // Regression: round 1 guarantees still hold
  // =========================================

  describe("Round 1 regressions", async () => {
    it("emergencyWithdraw cannot touch queued penalty funds", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("1000"));
      await moveToTreasury(parseEther("1600"));
      await withdrawAs(user1);
      await returnFromTreasury(parseEther("1600")); // balance 2000 == liabilities

      await assert.rejects(
        billing.write.emergencyWithdraw({ account: owner.account! }),
        { message: /No excess funds to withdraw/ }
      );
    });

    it("cannot re-lock or re-withdraw while a penalised withdrawal is queued", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("1000"));
      await moveToTreasury(parseEther("1600"));
      await withdrawAs(user1);

      await assert.rejects(lockAs(user1, parseEther("1")), { message: /Pending withdrawal exists/ });
      await assert.rejects(withdrawAs(user1), { message: /No active vault/ });
    });

    it("double claim reverts after a penalised claim", async () => {
      await lockAs(user1, parseEther("1000"));
      await lockAs(user2, parseEther("1000"));
      await moveToTreasury(parseEther("1600"));
      await withdrawAs(user1);
      await returnFromTreasury(parseEther("600"));
      await claimAs(user1);

      await assert.rejects(claimAs(user1), { message: /No pending withdrawal/ });
    });
  });
});
