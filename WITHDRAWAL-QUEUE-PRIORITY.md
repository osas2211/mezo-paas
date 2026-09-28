# Withdrawal Queue Priority Fix

**Date:** 2026-09-28
**Contract:** `MezoHostBillingV2.withdrawCollateral` (`contracts/contracts/BillingContractV2.sol`)
**Found during:** round 2 remediation. This was **not** one of the auditor's findings; it sits next to Finding 6.
**Tests:** `contracts/test/BillingContractV2.round2.test.ts` → *"Immediate payouts cannot jump ahead of queued withdrawals"*

---

## The problem

When a user withdraws, the contract either pays them now or, if it doesn't have enough tokens, queues them to claim later. Before this fix, "enough tokens" meant the **whole contract balance**:

```solidity
uint256 contractBalance = token.balanceOf(address(this));
if (contractBalance < amountToReturn) { /* queue */ }
else { /* pay now */ }
```

But part of that balance may already be **owed to users who were queued earlier**. The contract counted those tokens as available, so a newcomer could take them.

### Concrete example

| Step | Contract balance | Owed to queue |
|------|-----------------:|--------------:|
| Alice and Bob each lock 1000; owner moves 1600 to treasury | 400 | 0 |
| Alice withdraws; 400 < 1000, so **Alice is queued** | 400 | 1000 (Alice) |
| Treasury returns 1000 so Alice can be paid | 1400 | 1000 (Alice) |
| **Old behaviour:** Bob withdraws; 1400 ≥ 1000, so **Bob is paid immediately** | 400 | 1000 (Alice) |
| Alice tries to claim; 400 < 1000, so **reverts** | 400 | 1000 (Alice) |

The treasury returned funds for Alice, and Bob took them. Alice is stranded again even though the operator did the right thing. With enough users this can repeat indefinitely: whoever is queued first can be overtaken by every later withdrawer.

---

## The fix

New withdrawals may only use the balance that is **not already owed to the queue**:

```solidity
uint256 freeBalance = contractBalance > totalPendingWithdrawals
    ? contractBalance - totalPendingWithdrawals
    : 0;

if (freeBalance < originalAmount) { /* queue */ }
else { /* pay now */ }
```

In the example, when Bob withdraws, free balance = 1400 − 1000 = 400, which is less than 1000, so **Bob is queued behind Alice**. Alice then claims her 1000 successfully.

---

## Why it was done

1. **It's the same kind of bug the auditor flagged.** Findings 2 and 6 both came down to users losing access to money the contract already owed them. Leaving this path open would have undone part of the Finding 2 fix: a permissionless claim doesn't help if other users can always drain the funds first.
2. **It respects the operator's intent.** When the treasury returns funds to cover the queue, those funds now actually reach the queue.
3. **The auditor asked for it in spirit.** The round 2 report says: *"Findings 6 and 7 both live one step to the side of code that is already well covered, which is the usual place for defects to survive a fix round."* This is the next step to the side.
4. **It fit naturally with the Finding 6 fix.** Finding 6 already required rewriting the solvency check in `withdrawCollateral`. Getting it right once cost less than a later redeploy.

---

## What makes it a good fix

- **Very small.** It's one subtraction in one function. There's no new storage, no new external calls and no change to any function signature or event.
- **It reuses an existing, audited number.** `totalPendingWithdrawals` was already tracked (round 1 fix) and already used for reserve and emergency-withdraw checks. Now the payout path uses the same definition of what's owed.
- **Consistent accounting.** After Finding 6, `totalPendingWithdrawals` holds payout + penalty for every queued request. The free-balance check therefore sets aside exactly what claims will need, penalties included.
- **Safe in edge cases.** The saturating subtraction (`> ? - : 0`) means a balance below the queue total can never underflow. In that state every new withdrawal is queued, which is correct.
- **Fair without a costly FIFO.** A strict first-in-first-out queue would need an on-chain list and loops, which cost gas and are hard to bound. This check gets the fairness that matters (earlier queue entries can't be overtaken by new withdrawals) with constant gas.
- **No new trust in the owner.** The fix removes a failure mode without adding any admin power.
- **Tested.** Two tests cover it:
  - *"new withdrawal is queued when free balance is owed to an existing queue entry"* reproduces the Alice and Bob scenario and asserts that Alice's claim succeeds.
  - *"totalPendingWithdrawals equals the sum of queued payouts + penalties"* checks the number the fix relies on.

---

## Trade-offs and limits

- **New withdrawers may be queued slightly more often.** While any queue exists, new withdrawals are paid only from surplus above it. That's intended: the queue is paid first.
- **No ordering among already-queued users.** Once queued, anyone whose own amount is covered by the balance can claim. When the treasury returns enough to cover the whole queue, which is what the runbook says to do, this doesn't matter.
- **It doesn't create liquidity.** Queued users still depend on the treasury returning funds. That trust assumption is Finding 8 and is covered by the 48h timelock, the 20% reserve floor and user-facing disclosure.
