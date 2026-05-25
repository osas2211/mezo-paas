import React from "react"
import { Shield, ArrowRight, Wallet, Unlock } from "lucide-react"

interface ActiveVaultViewProps {
    lockedAmount: string
    unlockTimestamp: number
    isWithdrawing: boolean
    handleWithdraw: () => void
    handleDisconnect: () => void
}

export function ActiveVaultView({
    lockedAmount,
    unlockTimestamp,
    isWithdrawing,
    handleWithdraw,
    handleDisconnect,
}: ActiveVaultViewProps) {
    const isEarly = Date.now() / 1000 < unlockTimestamp
    const unlockDate = new Date(unlockTimestamp * 1000).toLocaleString()

    return (
        <div className="space-y-5 py-2">
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

            <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex gap-3 text-xs text-white/70 leading-normal">
                <Unlock className="h-4 w-4 text-white/50 shrink-0 mt-0.5" />
                <div>
                    Your vault is currently locked until <span className="font-semibold text-white">{unlockDate}</span>.
                </div>
            </div>

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
