"use client"

import React, { useState } from "react"
import { Modal, Form } from "antd"
import { useAccount, useWriteContract, useReadContract, useDisconnect } from "wagmi"
import { MezoBillingABI } from "@/abis/BillingABI"
import { BILLING_CONTRACT_ADDRESS, TOKEN_ADDRESS } from "@/lib/constants"
import { TokenABI } from "@/abis/TokenABI"
import {MUSDTokenABI} from "@/abis/MUSDTokenABI"
import { parseUnits, formatUnits } from "ethers"
import { useToastify } from "@/hooks/use-toastify"
import { Lock } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { useQueryClient } from "@tanstack/react-query"

import { LockStep } from "./lock-collateral-views/constants"
import { ConnectWalletView } from "./top-up-views/connect-wallet-view"
import { InputView } from "./lock-collateral-views/input-view"
import { ProcessingView } from "./lock-collateral-views/processing-view"
import { SuccessView } from "./lock-collateral-views/success-view"
import { ActiveVaultView } from "./lock-collateral-views/active-vault-view"

export function LockCollateralButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [step, setStep] = useState<LockStep>("input")
    const { mutateAsync: disconnect } = useDisconnect()
    const [amount, setAmount] = useState<string>("")
    const [duration, setDuration] = useState<number>(2592000) // Default 30 days
    const [form] = Form.useForm()

    const { address, isConnected } = useAccount()
    const { successToast, errorToast } = useToastify()
    const { mutateAsync: writeApprove, isPending: isApproving } =
        useWriteContract()
    const { mutateAsync: writeLock, isPending: isLocking } = useWriteContract()
    const { data: userData } = useUser()
    const queryClient = useQueryClient()

    // Read lock status for the connected wallet
    const { data: lockStatus, refetch: refetchLockStatus } = useReadContract({
        address: BILLING_CONTRACT_ADDRESS as `0x${string}`,
        abi: MezoBillingABI.abi,
        functionName: "getLockStatus",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const isActiveVault = lockStatus ? (lockStatus as any)[0] : false
    const lockedAmountWei = lockStatus ? (lockStatus as any)[1] : BigInt(0)
    const lockedAmount = parseFloat(formatUnits(lockedAmountWei, 18)).toFixed(4)
    const unlockTimestamp = lockStatus ? Number((lockStatus as any)[2]) : 0

    // Read token balance for the connected wallet
    const { data: tokenBalance } = useReadContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: MUSDTokenABI.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const formattedBalance = tokenBalance
        ? parseFloat(formatUnits(tokenBalance as bigint, 18)).toFixed(4)
        : "0.0000"

    const showModal = () => {
        setIsModalOpen(true)
        setStep(isActiveVault ? "active" : "input")
        setAmount("")
        setDuration(2592000)
    }

    const handleCancel = () => {
        if (isApproving || isLocking || step === "withdrawing") return
        setIsModalOpen(false)
        setStep(isActiveVault ? "active" : "input")
    }

    const handleLock = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            errorToast("Please enter a valid amount", "bottom-right")
            return
        }

        try {
            const amountInWei = parseUnits(amount, 18)
            setStep("approving")

            // Step 1: Approve token spending
            await writeApprove({
                address: TOKEN_ADDRESS as `0x${string}`,
                abi: MUSDTokenABI.abi,
                functionName: "approve",
                args: [BILLING_CONTRACT_ADDRESS, amountInWei],
            })

            setStep("locking")

            // Step 2: Execute lock on the billing contract
            await writeLock({
                address: BILLING_CONTRACT_ADDRESS as `0x${string}`,
                abi: MezoBillingABI.abi,
                functionName: "lockCollateral",
                args: [userData?.user?.wallet?.address || address, amountInWei, duration],
            })

            await queryClient.invalidateQueries({ queryKey: ["user"] })
            await queryClient.invalidateQueries({ queryKey: ["tx-history", address] })
            await refetchLockStatus()
            setStep("success")
            successToast("Collateral locked successfully!", "bottom-right")

        } catch (error: any) {
            console.error("Lock collateral error:", error)
            errorToast(
                error?.shortMessage || error?.message || "Transaction failed",
                "bottom-right",
            )
            setStep("input")
        }
    }

    const { mutateAsync: writeWithdraw, isPending: isWithdrawing } = useWriteContract()

    const handleWithdraw = async () => {
        try {
            setStep("withdrawing")
            await writeWithdraw({
                address: BILLING_CONTRACT_ADDRESS as `0x${string}`,
                abi: MezoBillingABI.abi,
                functionName: "withdrawCollateral",
                args: [userData?.user?.wallet?.address]
            })
            await queryClient.invalidateQueries({ queryKey: ["user"] })
            await queryClient.invalidateQueries({ queryKey: ["tx-history", address] })
            await refetchLockStatus()
            setStep("success_withdraw")
            successToast("Collateral withdrawn successfully!", "bottom-right")
        } catch (error: any) {
            console.error("Withdraw collateral error:", error)
            errorToast(
                error?.shortMessage || error?.message || "Transaction failed",
                "bottom-right",
            )
            setStep("active")
        }
    }

    const handleDisconnect = async () => {
        await disconnect()
    }

    const renderModalContent = () => {
        if (!isConnected) return <ConnectWalletView />
        if (step === "input") {
            return (
                <InputView
                    formattedBalance={formattedBalance}
                    address={address}
                    amount={amount}
                    setAmount={setAmount}
                    duration={duration}
                    setDuration={setDuration}
                    form={form}
                    handleLock={handleLock}
                    isApproving={isApproving}
                    isLocking={isLocking}
                    handleDisconnect={handleDisconnect}
                />
            )
        }
        if (step === "active") {
            return (
                <ActiveVaultView
                    lockedAmount={lockedAmount}
                    unlockTimestamp={unlockTimestamp}
                    isWithdrawing={isWithdrawing}
                    handleWithdraw={handleWithdraw}
                    handleDisconnect={handleDisconnect}
                />
            )
        }
        if (step === "approving" || step === "locking" || step === "withdrawing") {
            return <ProcessingView step={step} />
        }
        if (step === "success") {
            return <SuccessView amount={amount} onDone={handleCancel} />
        }
        if (step === "success_withdraw") {
            return <SuccessView
                title="Collateral Withdrawn!"
                message="Your collateral has been successfully withdrawn to your wallet."
                onDone={handleCancel}
            />
        }
        return null
    }

    return (
        <>
            <button
                onClick={showModal}
                className="text-dark bg-primary px-6 py-2 text-[16px] cursor-pointer hover:bg-primary/90 transition-all font-medium duration-300"
            >
                Lock Collateral
            </button>

            <Modal
                title={
                    <span className="text-white text-lg font-medium flex items-center gap-2">
                        <Lock className="text-primary h-5 w-5" />
                        <span>Lock Collateral</span>
                    </span>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                centered
                width={480}
                styles={{
                    mask: {
                        backdropFilter: "blur(6px)",
                    },
                }}
                closable={step === "input" || step === "active" || step === "success" || step === "success_withdraw" || !isConnected}
            >
                {renderModalContent()}

                {/* Footer hint */}
                {isConnected && step === "input" && (
                    <p className="text-[11px] text-white/25 text-center mt-2 pb-2">
                        Powered by MezoHost Billing Contract on Mezo Testnet
                    </p>
                )}
            </Modal>
        </>
    )
}
