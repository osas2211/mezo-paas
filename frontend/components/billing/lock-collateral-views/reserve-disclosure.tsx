import React from "react"
import { Info, AlertTriangle } from "lucide-react"
import { useReadContract } from "wagmi"
import { formatUnits } from "viem"
import { MezoBillingV2ABI } from "@/abis/BillingV2ABI"
import { BILLING_CONTRACT_V2_ADDRESS } from "@/lib/constants"

/**
 * Discloses the contract's reserve policy (audit 2026-09-28, finding 8):
 * only the reserve ratio is guaranteed redeemable on demand, and any
 * proposed treasury move is shown before its 48h timelock expires.
 */
export function ReserveDisclosure() {
    const { data } = useReadContract({
        address: BILLING_CONTRACT_V2_ADDRESS as `0x${string}`,
        abi: MezoBillingV2ABI.abi,
        functionName: "getLiquidityStatus",
    })

    // getLiquidityStatus returns: [contractBalance, totalLiabilities, liquidityBps, guaranteedReserveBps, pendingMove, pendingMoveExecuteAfter]
    const status = data as readonly bigint[] | undefined
    const liquidityPct = status ? Number(status[2]) / 100 : undefined
    const guaranteedPct = status ? Number(status[3]) / 100 : 20
    const pendingMove = status ? status[4] : BigInt(0)
    const pendingMoveExecuteAfter = status ? Number(status[5]) : 0

    return (
        <div className="space-y-2">
            <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex gap-3 text-[11px] text-white/60 leading-normal">
                <Info className="h-4 w-4 shrink-0 text-white/40 mt-0.5" />
                <span>
                    Only <span className="text-white font-medium">{guaranteedPct}%</span> of locked collateral is
                    guaranteed to stay in the contract. The rest may be moved to the treasury for off-chain yield.
                    If the contract cannot cover your withdrawal, it is queued until the treasury returns funds.
                    Early-withdrawal penalties are only charged when your payout is delivered.
                    {liquidityPct !== undefined && (
                        <> Currently <span className="text-white font-medium">{liquidityPct.toFixed(2)}%</span> of all deposits is redeemable on demand.</>
                    )}
                </span>
            </div>

            {pendingMove > BigInt(0) && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex gap-3 text-[11px] text-amber-200/80 leading-normal">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>
                        A move of <span className="font-semibold text-amber-300">{parseFloat(formatUnits(pendingMove, 18)).toFixed(4)} MUSD</span> to
                        the treasury is scheduled and can execute after{" "}
                        <span className="font-semibold text-amber-300">
                            {new Date(pendingMoveExecuteAfter * 1000).toLocaleString()}
                        </span>
                        . You can withdraw before then.
                    </span>
                </div>
            )}
        </div>
    )
}
