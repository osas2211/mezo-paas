export type LockStep =
  | "input"
  | "approving"
  | "locking"
  | "success"
  | "active"
  | "withdrawing"
  | "withdrawal_queued"
  | "success_withdraw"

// Duration options for locking collateral
export const LOCK_DURATION_OPTIONS = [
  { label: "7 Days", value: 7 * 24 * 60 * 60, description: "Minimum lock period" },
  { label: "30 Days", value: 30 * 24 * 60 * 60, description: "Standard period" },
  { label: "90 Days", value: 90 * 24 * 60 * 60, description: "Higher yield potential" },
  { label: "180 Days", value: 180 * 24 * 60 * 60, description: "Maximum yield" },
  { label: "1 Year", value: 365 * 24 * 60 * 60, description: "Long-term commitment" },
]
