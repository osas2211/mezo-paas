import React from "react"
import { Loader2, CheckCircle2, Coins } from "lucide-react"
import { TopUpStep } from "./constants"

interface ProcessingViewProps {
    step: TopUpStep
}

export function ProcessingView({ step }: ProcessingViewProps) {
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
                        : "Processing Top-Up..."}
                </h3>
                <p className="text-white/50 text-sm max-w-[300px]">
                    {step === "approving"
                        ? "Please confirm the approval transaction in your wallet."
                        : "Please confirm the top-up transaction in your wallet."}
                </p>
            </div>

            {/* Step Indicators */}
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${step === "topup"
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-white/5 text-white/30 border border-white/10"
                        }`}
                >
                    {step === "topup" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Coins className="h-3 w-3" />
                    )}
                    <span>Top Up</span>
                </div>
            </div>
        </div>
    )
}
