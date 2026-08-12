import React from "react"
import { Shield, ArrowRight, Wallet, Unlock, TrendingUp, Clock, Sparkles } from "lucide-react"

interface ActiveVaultViewProps {
    lockedAmount: string
    unlockTimestamp: number
    lockTimestamp: number
    totalYieldCredited: string
    lastYieldCreditTime: number
    annualYieldBps: number
    isWithdrawing: boolean
    handleWithdraw: () => void
    handleDisconnect: () => void
}

export function ActiveVaultView({
    lockedAmount,
    unlockTimestamp,
    lockTimestamp,
    totalYieldCredited,
    lastYieldCreditTime,
    annualYieldBps,
    isWithdrawing,
    handleWithdraw,
    handleDisconnect,
}: ActiveVaultViewProps) {
    const isEarly = Date.now() / 1000 < unlockTimestamp
    const unlockDate = new Date(unlockTimestamp * 1000).toLocaleString()
    const lockDate = lockTimestamp > 0 ? new Date(lockTimestamp * 1000).toLocaleDateString() : "N/A"

    // Calculate estimated daily yield
    const lockedAmountNum = parseFloat(lockedAmount) || 0
    const dailyYieldRate = annualYieldBps / 10000 / 365
    const estimatedDailyYield = lockedAmountNum * dailyYieldRate

    // Calculate days locked
    const daysLocked = lockTimestamp > 0
        ? Math.floor((Date.now() / 1000 - lockTimestamp) / (24 * 60 * 60))
        : 0

    return (
        <div className="space-y-4 py-2">
            {/* Vault Balance */}
            <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-4 rounded-xl">
                <div>
                    <p className="text-primary/60 text-[10px] uppercase tracking-wider mb-0.5">
                        Active Vault Balance
                    </p>
                    <p className="text-primary font-bold text-xl font-mono">
                        {lockedAmount} MUSD
                    </p>
                </div>
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                </div>
            </div>

            {/* Yield Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                        <p className="text-emerald-400/70 text-[10px] uppercase tracking-wider">
                            Total Yield Earned
                        </p>
                    </div>
                    <p className="text-emerald-400 font-bold text-lg font-mono">
                        {parseFloat(totalYieldCredited).toFixed(4)}
                    </p>
                    <p className="text-emerald-400/50 text-[10px]">credits</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                        <p className="text-blue-400/70 text-[10px] uppercase tracking-wider">
                            Est. Daily Yield
                        </p>
                    </div>
                    <p className="text-blue-400 font-bold text-lg font-mono">
                        {estimatedDailyYield.toFixed(4)}
                    </p>
                    <p className="text-blue-400/50 text-[10px]">{annualYieldBps / 100}% APY</p>
                </div>
            </div>

            {/* Lock Info */}
            <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-white/60">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Locked since {lockDate}</span>
                    </div>
                    <span className="text-white/40">{daysLocked} days</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-white/70">
                    <Unlock className="h-3.5 w-3.5 text-white/50" />
                    <span>Unlocks <span className="font-semibold text-white">{unlockDate}</span></span>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex gap-3 text-[11px] text-red-400/80 leading-normal">
                <Shield className="h-3.5 w-3.5 text-red-400/60 shrink-0 mt-0.5" />
                <div>
                    {isEarly
                        ? "Warning: Withdrawing before the unlock date will incur a 5% penalty on your collateral."
                        : "Your lock period has ended. You can withdraw without penalty."}
                </div>
            </div>

            <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="w-full py-3.5 text-sm font-semibold bg-red-500 text-white hover:bg-red-600 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isWithdrawing ? (
                    <span>Withdrawing...</span>
                ) : (
                    <>
                        <Unlock className="h-4 w-4" />
                        <span>Withdraw Collateral {isEarly && "(5% Penalty)"}</span>
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </button>
            <button
                onClick={handleDisconnect}
                className="w-full py-3.5 text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <span>Disconnect Wallet</span>
            </button>
        </div>
    )
}
