import React from "react"
import { Loader2, CheckCircle2, Lock } from "lucide-react"
import { LockStep } from "./constants"

interface ProcessingViewProps {
    step: LockStep
}

export function ProcessingView({ step }: ProcessingViewProps) {
    if (step === "withdrawing") {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 h-20 w-20 rounded-full border-2 border-red-500/20 animate-ping" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-white text-lg font-semibold">
                        Withdrawing Collateral...
                    </h3>
                    <p className="text-white/50 text-sm max-w-[300px]">
                        Please confirm the withdrawal transaction in your wallet.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <div className="absolute inset-0 h-20 w-20 rounded-full border-2 border-primary/20 animate-ping" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-white text-lg font-semibold">
                    {step === "approving"
                        ? "Approving Token Spend..."
                        : "Locking Collateral..."}
                </h3>
                <p className="text-white/50 text-sm max-w-[300px]">
                    {step === "approving"
                        ? "Please confirm the approval transaction in your wallet."
                        : "Please confirm the lock transaction in your wallet."}
                </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
                <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${step === "approving"
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                >
                    {step === "approving" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-3 w-3" />
                    )}
                    <span>Approve</span>
                </div>
                <div className="h-px w-4 bg-white/20" />
                <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${step === "locking"
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-white/5 text-white/30 border border-white/10"
                        }`}
                >
                    {step === "locking" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Lock className="h-3 w-3" />
                    )}
                    <span>Lock</span>
                </div>
            </div>
        </div>
    )
}
