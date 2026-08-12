import React from "react"
import { Clock, ArrowRight, CheckCircle } from "lucide-react"

interface WithdrawalQueuedViewProps {
    amount: string
    onDone: () => void
}

export function WithdrawalQueuedView({
    amount,
    onDone,
}: WithdrawalQueuedViewProps) {
    return (
        <div className="space-y-5 py-2">
            <div className="flex flex-col items-center justify-center py-6">
                <div className="h-16 w-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">
                    Withdrawal Queued
                </h3>
                <p className="text-white/60 text-sm text-center max-w-xs">
                    Your withdrawal of <span className="font-semibold text-white">{parseFloat(amount).toFixed(4)} MUSD</span> has been queued.
                </p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg space-y-3">
                <h4 className="text-amber-400 text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    What happens next?
                </h4>
                <ul className="space-y-2 text-xs text-white/70">
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-amber-400/60 shrink-0 mt-0.5" />
                        <span>Your collateral is being returned from the yield treasury</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-amber-400/60 shrink-0 mt-0.5" />
                        <span>The platform will process your withdrawal within 24-48 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-amber-400/60 shrink-0 mt-0.5" />
                        <span>You will be notified once funds are available</span>
                    </li>
                </ul>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex gap-3 text-[11px] text-white/50 leading-normal">
                <span>
                    This queue happens when contract reserves are low due to active yield generation.
                    Your funds are secure and will be available soon.
                </span>
            </div>

            <button
                onClick={onDone}
                className="w-full py-3.5 text-sm font-semibold bg-primary text-dark hover:bg-primary/90 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2"
            >
                <span>Got it</span>
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}
