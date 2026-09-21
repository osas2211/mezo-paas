import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { network } from "hardhat";
import {
  getAddress,
  parseEther,
  type Address,
  type WalletClient,
  type GetContractReturnType,
} from "viem";

/**
 * Security Fix Tests for MezoHostBillingV2
 *
 * These tests verify all security fixes from the 2026-09-15 audit:
 * - Finding 1: Emergency withdraw restricted to excess funds
 * - Finding 1: Two-step treasury change with timelock
 * - Finding 2: Permissionless claimQueuedWithdrawal
 * - Finding 2: Cannot lock while withdrawal pending
 * - Finding 2: totalPendingWithdrawals tracking
 * - Finding 3: Reserve ratio includes pending withdrawals
 */

describe("MezoHostBillingV2 Security Tests", async () => {
  let networkConnection: Awaited<ReturnType<typeof network.create>>;
  let viem: typeof networkConnection.viem;
  let provider: typeof networkConnection.provider;
  let owner: WalletClient;
  let treasury: WalletClient;
  let user1: WalletClient;
  let user2: WalletClient;
  let billing: GetContractReturnType;
  let token: GetContractReturnType;
  let billingContract: Address;
  let tokenContract: Address;

  const SEVEN_DAYS = 7n * 24n * 60n * 60n;
  const TWENTY_FOUR_HOURS = 24n * 60n * 60n;

  beforeEach(async () => {
    // Create fresh network connection for each test
    networkConnection = await network.create();
    viem = networkConnection.viem;
    provider = networkConnection.provider;

    // Get wallet clients
    const walletClients = await viem.getWalletClients();
    [owner, treasury, user1, user2] = walletClients;

    // Deploy MockBTC token
    token = await viem.deployContract("MockBTC", [], {
      walletClient: owner,
    });
    tokenContract = token.address;

    // Deploy BillingContractV2
    billing = await viem.deployContract(
      "MezoHostBillingV2",
      [tokenContract, treasury.account!.address],
      { walletClient: owner }
    );
    billingContract = billing.address;

    // Transfer tokens to users for testing
    await token.write.transfer([user1.account!.address, parseEther("1000")], {
      account: owner.account!,
    });
    await token.write.transfer([user2.account!.address, parseEther("1000")], {
      account: owner.account!,
    });

    // Approve billing contract for user1
    await token.write.approve([billingContract, parseEther("1000")], {
      account: user1.account!,
    });

    // Approve billing contract for user2
    await token.write.approve([billingContract, parseEther("1000")], {
      account: user2.account!,
    });
  });

  // Helper to lock collateral as a specific user
  async function lockAs(
    user: WalletClient,
    amount: bigint,
    duration: bigint = SEVEN_DAYS
  ) {
    await billing.write.lockCollateral(
      [user.account!.address, amount, duration],
      { account: user.account! }
    );
  }

  // Helper to withdraw collateral as a specific user
  async function withdrawAs(user: WalletClient) {
    await billing.write.withdrawCollateral([user.account!.address], {
      account: user.account!,
    });
  }

  // Helper to claim queued withdrawal as a specific user
  async function claimAs(user: WalletClient) {
    await billing.write.claimQueuedWithdrawal({ account: user.account! });
  }

  // Helper to advance time
  async function advanceTime(seconds: number) {
    await provider.send("evm_increaseTime", [seconds]);
    await provider.send("evm_mine", []);
  }

  // =========================================
  // Finding 1: Emergency Withdraw Tests
  // =========================================

  describe("Finding 1: Emergency Withdraw Restrictions", async () => {
    it("should revert emergencyWithdraw when no excess funds", async () => {
      // User locks collateral
      await lockAs(user1, parseEther("100"));

      // Try emergency withdraw - should fail
      await assert.rejects(
        async () => {
          await billing.write.emergencyWithdraw({ account: owner.account! });
        },
        { message: /No excess funds to withdraw/ }
      );
    });

    it("should only withdraw excess funds beyond liabilities", async () => {
      // User locks 100 tokens
      await lockAs(user1, parseEther("100"));

      // Send extra 50 tokens directly to contract (simulating excess)
      await token.write.transfer([billingContract, parseEther("50")], {
        account: owner.account!,
      });

      // Contract now has 150, but only 100 is locked
      const balanceBefore = await token.read.balanceOf([billingContract]);
      assert.strictEqual(balanceBefore, parseEther("150"));

      // Emergency withdraw should only take 50 (excess)
      await billing.write.emergencyWithdraw({ account: owner.account! });

      const balanceAfter = await token.read.balanceOf([billingContract]);
      assert.strictEqual(balanceAfter, parseEther("100"));
    });

    it("should include pending withdrawals in liability calculation", async () => {
      // User locks 100 tokens
      await lockAs(user1, parseEther("100"));

      // Move 80 to treasury (within reserve ratio)
      await billing.write.moveCollateralToTreasury([parseEther("80")], {
        account: owner.account!,
      });

      // Advance time past lock
      await advanceTime(Number(SEVEN_DAYS) + 1);

      // User withdraws - will be queued since only 20 in contract
      await withdrawAs(user1);

      // Check totalPendingWithdrawals
      const status = await billing.read.getContractStatus();
      assert.ok(status[5] > 0n, "totalPendingWithdrawals should be > 0");

      // Emergency withdraw should fail - pending withdrawal is a liability
      await assert.rejects(
        async () => {
          await billing.write.emergencyWithdraw({ account: owner.account! });
        },
        { message: /No excess funds to withdraw/ }
      );
    });
  });

  // =========================================
  // Finding 1: Two-Step Treasury Change
  // =========================================

  describe("Finding 1: Two-Step Treasury Change", async () => {
    it("should require 24-hour timelock for treasury change", async () => {
      const newTreasury = user2.account!.address;

      // Propose treasury change
      await billing.write.proposeTreasuryChange([newTreasury], {
        account: owner.account!,
      });

      // Try to execute immediately - should fail
      await assert.rejects(
        async () => {
          await billing.write.executeTreasuryChange({ account: owner.account! });
        },
        { message: /Timelock not expired/ }
      );
    });

    it("should execute treasury change after timelock", async () => {
      const newTreasury = user2.account!.address;

      // Propose treasury change
      await billing.write.proposeTreasuryChange([newTreasury], {
        account: owner.account!,
      });

      // Advance time past 24 hours
      await advanceTime(Number(TWENTY_FOUR_HOURS) + 1);

      // Execute should succeed
      await billing.write.executeTreasuryChange({ account: owner.account! });

      // Verify treasury changed
      const currentTreasury = await billing.read.treasury();
      assert.strictEqual(
        getAddress(currentTreasury),
        getAddress(newTreasury)
      );
    });

    it("should allow cancellation of pending treasury change", async () => {
      const newTreasury = user2.account!.address;
      const originalTreasury = treasury.account!.address;

      // Propose treasury change
      await billing.write.proposeTreasuryChange([newTreasury], {
        account: owner.account!,
      });

      // Cancel it
      await billing.write.cancelTreasuryChange({ account: owner.account! });

      // Advance time and try to execute - should fail
      await advanceTime(Number(TWENTY_FOUR_HOURS) + 1);

      await assert.rejects(
        async () => {
          await billing.write.executeTreasuryChange({ account: owner.account! });
        },
        { message: /No pending treasury change/ }
      );

      // Treasury should be unchanged
      const currentTreasury = await billing.read.treasury();
      assert.strictEqual(
        getAddress(currentTreasury),
        getAddress(originalTreasury)
      );
    });

    it("should return pending treasury info via getPendingTreasuryChange", async () => {
      const newTreasury = user2.account!.address;

      // Propose treasury change
      await billing.write.proposeTreasuryChange([newTreasury], {
        account: owner.account!,
      });

      // Check pending info
      const pending = await billing.read.getPendingTreasuryChange();
      assert.strictEqual(getAddress(pending[0]), getAddress(newTreasury));
      assert.ok(pending[1] > 0n, "effectiveTime should be set");
      assert.strictEqual(pending[2], false, "canExecute should be false");

      // Advance time
      await advanceTime(Number(TWENTY_FOUR_HOURS) + 1);

      // Check again
      const pendingAfter = await billing.read.getPendingTreasuryChange();
      assert.strictEqual(pendingAfter[2], true, "canExecute should be true");
    });
  });

  // =========================================
  // Finding 2: Permissionless Withdrawal Claims
  // =========================================

  describe("Finding 2: Permissionless Withdrawal Claims", async () => {
    it("should allow user to claim their own queued withdrawal", async () => {
      // User locks 100 tokens
      await lockAs(user1, parseEther("100"));

      // Move 80 to treasury
      await billing.write.moveCollateralToTreasury([parseEther("80")], {
        account: owner.account!,
      });

      // Advance time past lock
      await advanceTime(Number(SEVEN_DAYS) + 1);

      // User withdraws - gets queued
      await withdrawAs(user1);

      // Check withdrawal is pending
      const request = await billing.read.getWithdrawalRequest([
        user1.account!.address,
      ]);
      assert.strictEqual(request[2], true, "isPending should be true");

      // Return funds from treasury - treasury must approve billing contract first
      await token.write.approve([billingContract, parseEther("100")], {
        account: treasury.account!,
      });
      await billing.write.returnCollateralFromTreasury([parseEther("80")], {
        account: owner.account!,
      });

      // User claims their withdrawal (permissionless!)
      const balanceBefore = await token.read.balanceOf([user1.account!.address]);
      await claimAs(user1);
      const balanceAfter = await token.read.balanceOf([user1.account!.address]);

      // User should have received their funds
      assert.ok(balanceAfter > balanceBefore, "User should have received funds");

      // Request should no longer be pending
      const requestAfter = await billing.read.getWithdrawalRequest([
        user1.account!.address,
      ]);
      assert.strictEqual(requestAfter[2], false, "isPending should be false");
    });

    it("should revert claimQueuedWithdrawal when insufficient balance", async () => {
      // User locks 100 tokens
      await lockAs(user1, parseEther("100"));

      // Move 80 to treasury
      await billing.write.moveCollateralToTreasury([parseEther("80")], {
        account: owner.account!,
      });

      // Advance time
      await advanceTime(Number(SEVEN_DAYS) + 1);

      // User withdraws - gets queued
      await withdrawAs(user1);

      // Try to claim without returning funds - should fail
      await assert.rejects(
        async () => {
          await claimAs(user1);
        },
        { message: /Insufficient contract balance/ }
      );
    });
  });

  // =========================================
  // Finding 2: Cannot Lock While Pending
  // =========================================

  describe("Finding 2: Cannot Lock While Withdrawal Pending", async () => {
    it("should revert lockCollateral when withdrawal is pending", async () => {
      // User locks 100 tokens
      await lockAs(user1, parseEther("100"));

      // Move to treasury to force queue
      await billing.write.moveCollateralToTreasury([parseEther("80")], {
        account: owner.account!,
      });

      // Advance time
      await advanceTime(Number(SEVEN_DAYS) + 1);

      // User withdraws - gets queued
      await withdrawAs(user1);

      // Try to lock again - should fail
      await assert.rejects(
        async () => {
          await lockAs(user1, parseEther("50"));
        },
        { message: /Pending withdrawal exists/ }
      );
    });

    it("should allow lock after claiming pending withdrawal", async () => {
      // User locks 100 tokens
      await lockAs(user1, parseEther("100"));

      // Move to treasury
      await billing.write.moveCollateralToTreasury([parseEther("80")], {
        account: owner.account!,
      });

      // Advance time
      await advanceTime(Number(SEVEN_DAYS) + 1);

      // User withdraws - gets queued
      await withdrawAs(user1);

      // Return funds and claim
      await token.write.approve([billingContract, parseEther("100")], {
        account: treasury.account!,
      });
      await billing.write.returnCollateralFromTreasury([parseEther("80")], {
        account: owner.account!,
      });
      await claimAs(user1);

      // Now user can lock again - need to re-approve since tokens were returned
      await token.write.approve([billingContract, parseEther("100")], {
        account: user1.account!,
      });

      // This should succeed
      await lockAs(user1, parseEther("50"));

      const lockStatus = await billing.read.getLockStatus([
        user1.account!.address,
      ]);
      assert.strictEqual(lockStatus[0], true, "isActive should be true");
    });
  });

  // =========================================
  // Finding 2: totalPendingWithdrawals Tracking
  // =========================================

  describe("Finding 2: totalPendingWithdrawals Tracking", async () => {
    it("should increment totalPendingWithdrawals on queue", async () => {
      // Initial state
      const statusBefore = await billing.read.getContractStatus();
      assert.strictEqual(statusBefore[5], 0n, "Initial pending should be 0");

      // User locks
      await lockAs(user1, parseEther("100"));

      // Move to treasury
      await billing.write.moveCollateralToTreasury([parseEther("80")], {
        account: owner.account!,
      });

      // Advance time
      await advanceTime(Number(SEVEN_DAYS) + 1);

      // Withdraw - queued
      await withdrawAs(user1);

      // Check totalPendingWithdrawals increased
      const statusAfter = await billing.read.getContractStatus();
      assert.ok(statusAfter[5] > 0n, "Pending should be > 0 after queue");
    });

    it("should decrement totalPendingWithdrawals on claim", async () => {
      // Setup queued withdrawal
      await lockAs(user1, parseEther("100"));
      await billing.write.moveCollateralToTreasury([parseEther("80")], {
        account: owner.account!,
      });

      await advanceTime(Number(SEVEN_DAYS) + 1);

      await withdrawAs(user1);

      const pendingBefore = (await billing.read.getContractStatus())[5];

      // Return funds and claim
      await token.write.approve([billingContract, parseEther("100")], {
        account: treasury.account!,
      });
      await billing.write.returnCollateralFromTreasury([parseEther("80")], {
        account: owner.account!,
      });
      await claimAs(user1);

      const pendingAfter = (await billing.read.getContractStatus())[5];
      assert.strictEqual(pendingAfter, 0n, "Pending should be 0 after claim");
      assert.ok(pendingBefore > pendingAfter, "Pending should decrease");
    });
  });

  // =========================================
  // Finding 3: Reserve Ratio Calculation
  // =========================================

  describe("Finding 3: Reserve Ratio Includes Pending Withdrawals", async () => {
    it("should include pending withdrawals in reserve calculation", async () => {
      // User1 locks 100, User2 locks 100
      await lockAs(user1, parseEther("100"));
      await lockAs(user2, parseEther("100"));

      // Move 160 to treasury (200 * 80% = 160 available with 20% reserve)
      await billing.write.moveCollateralToTreasury([parseEther("160")], {
        account: owner.account!,
      });

      // Advance time
      await advanceTime(Number(SEVEN_DAYS) + 1);

      // User1 withdraws - queued (100 tokens pending)
      await withdrawAs(user1);

      // Now liabilities = 100 (user2 locked) + 100 (user1 pending) = 200
      // Contract has 40 tokens
      // Required reserve = 200 * 20% = 40
      // Available to move = 40 - 40 = 0

      const status = await billing.read.getContractStatus();
      assert.strictEqual(status[4], 0n, "Available to move should be 0");

      // Try to move more - should fail
      await assert.rejects(
        async () => {
          await billing.write.moveCollateralToTreasury([parseEther("1")], {
            account: owner.account!,
          });
        },
        { message: /Would breach reserve ratio/ }
      );
    });
  });

  // =========================================
  // Accounting Invariants
  // =========================================

  describe("Accounting Invariants", async () => {
    it("should maintain invariant: locked + pending tracks all liabilities", async () => {
      // User locks 100
      await lockAs(user1, parseEther("100"));

      // Check: totalLocked = 100, pending = 0
      let status = await billing.read.getContractStatus();
      assert.strictEqual(status[0], parseEther("100")); // totalLocked
      assert.strictEqual(status[5], 0n); // pending

      // Move to treasury and queue withdrawal
      await billing.write.moveCollateralToTreasury([parseEther("80")], {
        account: owner.account!,
      });

      await advanceTime(Number(SEVEN_DAYS) + 1);

      await withdrawAs(user1);

      // Check: totalLocked = 0, pending > 0
      status = await billing.read.getContractStatus();
      assert.strictEqual(status[0], 0n); // totalLocked
      assert.ok(status[5] > 0n); // pending > 0

      // Total liabilities still tracked
      const totalLiabilities = status[0] + status[5];
      assert.ok(totalLiabilities > 0n, "Total liabilities should be tracked");
    });

    it("should not allow double withdrawal from queue", async () => {
      // Setup queued withdrawal
      await lockAs(user1, parseEther("100"));
      await billing.write.moveCollateralToTreasury([parseEther("80")], {
        account: owner.account!,
      });

      await advanceTime(Number(SEVEN_DAYS) + 1);

      await withdrawAs(user1);

      // Return funds and claim
      await token.write.approve([billingContract, parseEther("100")], {
        account: treasury.account!,
      });
      await billing.write.returnCollateralFromTreasury([parseEther("80")], {
        account: owner.account!,
      });
      await claimAs(user1);

      // Try to claim again - should fail
      await assert.rejects(
        async () => {
          await claimAs(user1);
        },
        { message: /No pending withdrawal/ }
      );
    });
  });

  // =========================================
  // Standard ERC-20 Only (Finding 4)
  // =========================================

  describe("Finding 4: Standard ERC-20 Only", async () => {
    it("should use exact amount for lockCollateral (no fee-on-transfer)", async () => {
      const lockAmount = parseEther("100");

      // User locks exact amount
      await lockAs(user1, lockAmount);

      // Verify exact amount was recorded
      const lockStatus = await billing.read.getLockStatus([
        user1.account!.address,
      ]);
      assert.strictEqual(
        lockStatus[1],
        lockAmount,
        "Locked amount should match exactly"
      );

      // Contract balance should match exactly
      const balance = await token.read.balanceOf([billingContract]);
      assert.strictEqual(balance, lockAmount, "Contract balance should match");
    });
  });
});
