import React, { useState } from "react"
import { Clock, ArrowRight, CheckCircle, Wallet, Loader2 } from "lucide-react"
import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from "wagmi"
import { formatUnits } from "viem"
import { MezoBillingV2ABI } from "@/abis/BillingV2ABI"
import { BILLING_CONTRACT_V2_ADDRESS } from "@/lib/constants"

interface WithdrawalQueuedViewProps {
    amount: string
    onDone: () => void
}

export function WithdrawalQueuedView({
    amount,
    onDone,
}: WithdrawalQueuedViewProps) {
    const { address } = useAccount()
    const [claimState, setClaimState] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState<string>('')

    // Read contract balance to check if claim is possible
    const { data: contractStatus, refetch: refetchStatus } = useReadContract({
        address: BILLING_CONTRACT_V2_ADDRESS as `0x${string}`,
        abi: MezoBillingV2ABI.abi,
        functionName: 'getContractStatus',
    })

    // contractStatus returns: [totalLocked, totalInTreasury, contractBalance, reserveRatio, availableToMove, totalPendingWithdrawals]
    const statusArray = contractStatus as readonly bigint[] | undefined
    const contractBalance = statusArray ? parseFloat(formatUnits(statusArray[2], 18)) : 0
    const pendingAmount = parseFloat(amount)
    const canClaim = contractBalance >= pendingAmount

    const { writeContract, data: hash } = useWriteContract()

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    React.useEffect(() => {
        if (isConfirming) {
            setClaimState('claiming')
        }
        if (isConfirmed) {
            setClaimState('success')
            // Auto-close after success
            setTimeout(() => {
                onDone()
            }, 2000)
        }
    }, [isConfirming, isConfirmed, onDone])

    const handleClaimWithdrawal = async () => {
        try {
            setClaimState('claiming')
            setErrorMessage('')

            writeContract({
                address: BILLING_CONTRACT_V2_ADDRESS as `0x${string}`,
                abi: MezoBillingV2ABI.abi,
                functionName: 'claimQueuedWithdrawal',
            }, {
                onError: (error) => {
                    setClaimState('error')
                    setErrorMessage(error.message.includes('Insufficient')
                        ? 'Contract balance still insufficient. Try again later.'
                        : 'Failed to claim withdrawal. Please try again.')
                }
            })
        } catch (error: any) {
            setClaimState('error')
            setErrorMessage('Failed to claim withdrawal. Please try again.')
        }
    }

    const handleRefresh = () => {
        refetchStatus()
    }

    if (claimState === 'success') {
        return (
            <div className="space-y-5 py-2">
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">
                        Withdrawal Complete!
                    </h3>
                    <p className="text-white/60 text-sm text-center max-w-xs">
                        Your <span className="font-semibold text-white">{parseFloat(amount).toFixed(4)} MUSD</span> has been sent to your wallet.
                    </p>
                </div>
            </div>
        )
    }

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

            {/* Contract Balance Status */}
            <div className={`p-4 rounded-lg border ${canClaim ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Contract Balance</span>
                    <button
                        onClick={handleRefresh}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <span className={`text-lg font-semibold ${canClaim ? 'text-green-400' : 'text-amber-400'}`}>
                        {contractBalance.toFixed(4)} MUSD
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${canClaim ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {canClaim ? 'Ready to claim' : 'Insufficient'}
                    </span>
                </div>
                <p className="text-xs text-white/50 mt-2">
                    Need: {pendingAmount.toFixed(4)} MUSD
                </p>
            </div>

            {canClaim ? (
                <button
                    onClick={handleClaimWithdrawal}
                    disabled={claimState === 'claiming'}
                    className="w-full py-3.5 text-sm font-semibold bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                    {claimState === 'claiming' ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Claiming...</span>
                        </>
                    ) : (
                        <>
                            <Wallet className="h-4 w-4" />
                            <span>Claim Withdrawal</span>
                        </>
                    )}
                </button>
            ) : (
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
                            <span>Check back periodically and click "Refresh" to check availability</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-amber-400/60 shrink-0 mt-0.5" />
                            <span>Once funds are available, click "Claim Withdrawal" to receive your MUSD</span>
                        </li>
                    </ul>
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-sm">
                    {errorMessage}
                </div>
            )}

            <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex gap-3 text-[11px] text-white/50 leading-normal">
                <span>
                    This queue happens when contract reserves are low due to active yield generation.
                    Your funds are secure and you can claim them once the balance is restored.
                </span>
            </div>

            <button
                onClick={onDone}
                className="w-full py-3.5 text-sm font-semibold bg-white/10 text-white hover:bg-white/20 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2"
            >
                <span>Close</span>
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}
