# Treasury Operations Runbook

**Audience:** whoever operates the MezoHost treasury (holds the owner key, the treasury key, or the backend `ADMIN_KEY`).
**Contract:** `MezoHostBillingV2` (`contracts/contracts/BillingContractV2.sol`)
**Applies from:** the round 2 security fixes (2026-09-28). If you ran treasury operations before this, read **What changed** first.

---

## What changed

| Before | Now |
|--------|-----|
| `moveCollateralToTreasury(amount)` moved funds instantly | **Two steps:** propose, wait **48 hours**, then execute. The old function no longer exists. |
| Reserve ratio could be set as low as 10% | Minimum is **20%**; maximum is still 50% |
| `pause()` stopped users from withdrawing and claiming | Pause **never** blocks user exits. It blocks new deposits and treasury moves. |
| Early-withdrawal penalty went to treasury even when the user was only queued | The penalty is paid **only when the user's payout is delivered**. On the queued path both are paid out together at claim time. |
| New withdrawals could be paid from money owed to queued users | New withdrawals only use funds **not** already owed to the queue (see `WITHDRAWAL-QUEUE-PRIORITY.md`) |

---

## Keys and roles

| Role | Where it lives | What it can do |
|------|----------------|----------------|
| **Owner** | `PLATFORM_OPERATOR_PRIVATE_KEY` in the backend `.env` (must be the contract owner) | Propose, execute and cancel treasury moves; return funds; change the reserve ratio; pause/unpause; process queued withdrawals; emergency-withdraw **excess** funds; propose treasury address changes |
| **Treasury** | Separate wallet, `MEZO_TREASURY_PRIVATE_KEY` at deploy time | Receives moved collateral and penalties. Must **approve** the contract before funds can be returned. |
| **Admin API caller** | `ADMIN_KEY` in the backend `.env` | Calls the admin endpoints below via the `x-admin-key` header |

The owner and the treasury **must be different addresses**. The deploy script refuses to deploy if they match.

---

## Moving collateral to the treasury (two-step)

### How it works

```
 propose(amount) ──── 48h notice ────► executable ──── 7-day window ────► expired
      │                                      │                              │
      │  users can see the move              │  execute() moves funds       │  execute() reverts;
      │  and withdraw before it runs         │  (reserve re-checked)        │  cancel() to clear
```

1. **Propose.** The contract checks that `amount` fits within the reserve **right now**, stores it, and emits `TreasuryMoveProposed(amount, executeAfter, expiresAt)`. No tokens move.
2. **Notice period (48h).** The move is visible to everyone. The frontend shows a warning banner to users with the amount and the time it can execute. Users may withdraw during this window.
3. **Execute** (between `executeAfter` and `expiresAt`). The contract **re-checks the reserve against current liabilities**. If users withdrew or the ratio changed so the amount no longer fits, execution reverts. Cancel and propose a smaller amount.
4. **Expiry.** A proposal that isn't executed within 7 days after the notice period expires. Call cancel to clear it before proposing again.

Rules:
- Only **one** move can be pending at a time.
- Nothing can be proposed or executed while the contract is **paused**.
- The amount can never exceed `getContractStatus()._availableToMove`, which is balance minus `reserveRatioBps` × (locked + queued).

### Using the backend API

All admin endpoints need the header `x-admin-key: <ADMIN_KEY>`. Base path: `/api/v1/treasury`.

**1. Check how much can move**
```bash
curl -s https://<backend>/api/v1/treasury/status
# -> availableToMove, contractBalance, totalLockedCollateral, reserveRatioBps, ...
```

**2. Propose**
```bash
curl -s -X POST https://<backend>/api/v1/treasury/move-to-yield \
  -H "x-admin-key: $ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"amount": "800"}'
# -> { success: true, txHash }   (no funds moved yet, no DB operation recorded)
```

**3. Check the pending move (public, no key)**
```bash
curl -s https://<backend>/api/v1/treasury/pending-move
# -> { pendingMove: { amount, executeAfter, expiresAt, canExecute } }  or  { pendingMove: null }
```

**4. Execute once `canExecute` is `true`** (48h or more after proposing)
```bash
curl -s -X POST https://<backend>/api/v1/treasury/move-to-yield/execute \
  -H "x-admin-key: $ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"notes": "Q4 staking allocation"}'
# -> { success: true, txHash }   records a MOVE_TO_YIELD operation in the DB
```

**Cancel** a pending or expired move:
```bash
curl -s -X POST https://<backend>/api/v1/treasury/move-to-yield/cancel -H "x-admin-key: $ADMIN_KEY"
```

> **Note:** the `move-to-yield` endpoint used to move funds immediately. It now only **proposes**. Update any scripts, cron jobs or dashboards that relied on the old behaviour.

---

## Returning collateral from the treasury

This is needed whenever users are queued, or to top up liquidity before large unlocks.

1. **One-time: the treasury wallet approves the contract.** Send this from the treasury wallet, not the owner:
   `token.approve(<billing contract>, <amount or max>)`
2. **Owner returns funds:**
   ```bash
   curl -s -X POST https://<backend>/api/v1/treasury/return-from-yield \
     -H "x-admin-key: $ADMIN_KEY" -H "Content-Type: application/json" \
     -d '{"amount": "500", "notes": "cover queued withdrawals"}'
   ```
   The amount can't exceed `totalInTreasury`. Returns have **no timelock** because they only add liquidity.

---

## Queued withdrawals

A withdrawal is **queued** when the contract can't pay it from funds that aren't already owed to other queued users.

- **Users claim their own queued withdrawals** (`claimQueuedWithdrawal`). This works even while the contract is paused. You don't have to do anything except make funds available.
- To pay a user out yourself: `POST /api/v1/treasury/process-withdrawal` with `{ "whaleAddress", "userAppWallet" }`.
- **For early (penalised) withdrawals, the contract needs payout + penalty** before a claim succeeds. Example: a 1000 early withdrawal needs **1000** in the contract (950 to the user, 50 to treasury), not 950.
- Useful reads:
  - `getContractStatus()._totalPendingWithdrawals`: total owed to the queue (payouts plus deferred penalties)
  - `getQueuedWithdrawal(user)`: `amount`, `penalty`, `requestTimestamp`, `isPending`, `claimableNow`

**Rule of thumb:** keep contract balance ≥ `totalPendingWithdrawals`. While it's lower, every new withdrawal also gets queued.

---

## Reserve ratio

- The allowed range is **2000–5000 bps (20%–50%)**. Both the contract and the backend reject anything outside it.
- ```bash
  curl -s -X POST https://<backend>/api/v1/treasury/update-reserve-ratio \
    -H "x-admin-key: $ADMIN_KEY" -H "Content-Type: application/json" -d '{"newRatioBps": 3000}'
  ```
- Raising the ratio can make a pending move fail at execution. That's intended.

---

## Pause

| While paused | Status |
|--------------|--------|
| `lockCollateral`, `topUpAccount` | Blocked |
| `proposeTreasuryMove`, `executeTreasuryMove` | Blocked |
| `withdrawCollateral`, `claimQueuedWithdrawal` | **Still work** |
| `returnCollateralFromTreasury`, `processQueuedWithdrawal`, `cancelTreasuryMove` | Still work |

Use pause to stop new money coming in and stop funds going out to the treasury. It can't trap users, by design.

---

## Emergency withdraw

`POST /api/v1/treasury/emergency-withdraw` with `{ "confirm": true }` only sends **excess** funds to the treasury: balance minus (locked + queued). If there's no excess, it reverts with `No excess funds to withdraw`. It can't touch user collateral.

---

## Changing the treasury address

This is a separate 24-hour timelock: `proposeTreasuryChange(newAddress)`, wait 24h, then `executeTreasuryChange()`. `cancelTreasuryChange()` aborts it. The new treasury must also approve the contract before funds can be returned from it.

---

## Common errors

| Revert message | Meaning | Action |
|----------------|---------|--------|
| `Timelock not expired` | Executing before 48h have passed | Wait until `executeAfter` (`GET /pending-move`) |
| `Treasury move expired` | More than 7 days after `executeAfter` | Cancel, then propose again |
| `Treasury move already pending` | A proposal already exists | Execute or cancel it first |
| `Would breach reserve ratio` | Amount exceeds what can move, at propose or execute time | Check `/status` and propose less |
| `No pending treasury move` | Nothing to execute or cancel | None needed |
| `EnforcedPause` | Contract is paused | Unpause before moving funds |
| `Minimum reserve: 20%` | Ratio below 2000 bps | Use 2000–5000 |
| `Insufficient funds - return from treasury first` | Not enough to cover payout + penalty | Return funds from treasury |
| `Transfer from treasury failed` | Treasury hasn't approved the contract, or lacks balance | Approve from the treasury wallet |

---

## Routine checklist

**Daily**
- [ ] `GET /treasury/status`: balance vs. `totalPendingWithdrawals`. If balance is lower, return funds.
- [ ] `GET /treasury/pending-move`: is anything scheduled that you didn't expect?

**Before each move**
- [ ] No queued withdrawals are outstanding (`totalPendingWithdrawals == 0`)
- [ ] Check upcoming unlocks; don't move funds that will be needed within the notice window
- [ ] Propose, and note `executeAfter` / `expiresAt` in the ops log

**After each move**
- [ ] Execute within the window and confirm the `MOVE_TO_YIELD` record in `GET /treasury/operations`

---

## Disclosure to users

Users are told, in the lock and active-vault screens, that only the reserve ratio (20% minimum) is guaranteed to stay in the contract. They're also told the current on-demand liquidity and any scheduled move. Treasury funds held off-chain are **not** enforced on-chain: returning them is an operational commitment of whoever runs this runbook.
