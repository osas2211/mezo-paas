import React from "react"
import { CheckCircle2 } from "lucide-react"

interface SuccessViewProps {
    amount: string
    onDone: () => void
}

export function SuccessView({ amount, onDone }: SuccessViewProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-white text-lg font-semibold">
                    Credits Purchased!
                </h3>
                <p className="text-white/50 text-sm max-w-[300px]">
                    Your account has been topped up with{" "}
                    <span className="text-primary font-semibold">{amount} mBTC</span>{" "}
                    worth of compute credits.
                </p>
            </div>
            <button
                onClick={onDone}
                className="px-8 py-2.5 text-sm font-medium bg-primary text-dark hover:bg-primary/90 rounded-lg cursor-pointer transition-all"
            >
                Done
            </button>
        </div>
    )
}
