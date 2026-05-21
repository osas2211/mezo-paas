"use client"

import React, { useState } from "react"
import { Modal, Form } from "antd"
import { useAccount, useWriteContract, useReadContract, useDisconnect } from "wagmi"
import { MezoBillingABI } from "@/abis/BillingABI"
import { BILLING_CONTRACT_ADDRESS, TOKEN_ADDRESS } from "@/lib/constants"
import { TokenABI } from "@/abis/TokenABI"
import { parseUnits, formatUnits } from "ethers"
import { useToastify } from "@/hooks/use-toastify"
import { Zap } from "lucide-react"

import { TopUpStep, CREDIT_PACKAGES } from "./top-up-views/constants"
import { ConnectWalletView } from "./top-up-views/connect-wallet-view"
import { InputView } from "./top-up-views/input-view"
import { ProcessingView } from "./top-up-views/processing-view"
import { SuccessView } from "./top-up-views/success-view"
import { useUser } from "@/hooks/use-user"
import { useQueryClient } from "@tanstack/react-query"

export function TopUpButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [step, setStep] = useState<TopUpStep>("input")
    const { mutateAsync: disconnect } = useDisconnect()
    const [selectedPackage, setSelectedPackage] = useState<number | null>(1) // Builder default
    const [customAmount, setCustomAmount] = useState<string>("")
    const [form] = Form.useForm()

    const { address, isConnected } = useAccount()
    const { successToast, errorToast } = useToastify()
    const { mutateAsync: writeApprove, isPending: isApproving } =
        useWriteContract()
    const { mutateAsync: writeTopUp, isPending: isTopping } = useWriteContract()
    const { data: userData } = useUser()
    const queryClient = useQueryClient()

    // Read token balance for the connected wallet
    const { data: tokenBalance } = useReadContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: TokenABI.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    })

    const formattedBalance = tokenBalance
        ? parseFloat(formatUnits(tokenBalance as bigint, 18)).toFixed(4)
        : "0.0000"

    const getAmount = (): string => {
        if (selectedPackage !== null) {
            return CREDIT_PACKAGES[selectedPackage].amount
        }
        return customAmount || "0"
    }

    const showModal = () => {
        setIsModalOpen(true)
        setStep("input")
        setSelectedPackage(1)
        setCustomAmount("")
    }

    const handleCancel = () => {
        if (isApproving || isTopping) return
        setIsModalOpen(false)
        setStep("input")
    }

    const handleTopUp = async () => {
        const amount = getAmount()
        if (!amount || parseFloat(amount) <= 0) {
            errorToast("Please select or enter a valid amount", "bottom-right")
            return
        }

        try {
            const amountInWei = parseUnits(amount, 18)
            setStep("approving")

            // Step 1: Approve token spending
            await writeApprove({
                address: TOKEN_ADDRESS as `0x${string}`,
                abi: TokenABI.abi,
                functionName: "approve",
                args: [BILLING_CONTRACT_ADDRESS, amountInWei],
            })

            setStep("topup")

            // Step 2: Execute top-up on the billing contract
            await writeTopUp({
                address: BILLING_CONTRACT_ADDRESS as `0x${string}`,
                abi: MezoBillingABI.abi,
                functionName: "topUpAccount",
                args: [userData?.user.wallet?.address, amountInWei],
            })

            await queryClient.invalidateQueries({ queryKey: ["user"] })
            await queryClient.invalidateQueries({ queryKey: ["tx-history", address] })
            setStep("success")
            successToast("Credits purchased successfully!", "bottom-right")

        } catch (error: any) {
            console.error("Top-up error:", error)
            errorToast(
                error?.shortMessage || error?.message || "Transaction failed",
                "bottom-right",
            )
            setStep("input")
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
                    selectedPackage={selectedPackage}
                    setSelectedPackage={setSelectedPackage}
                    customAmount={customAmount}
                    setCustomAmount={setCustomAmount}
                    form={form}
                    amount={getAmount()}
                    handleTopUp={handleTopUp}
                    isApproving={isApproving}
                    isTopping={isTopping}
                    handleDisconnect={handleDisconnect}
                />
            )
        }
        if (step === "approving" || step === "topup") {
            return <ProcessingView step={step} />
        }
        if (step === "success") {
            return <SuccessView amount={getAmount()} onDone={handleCancel} />
        }
        return null
    }

    return (
        <>
            <button
                onClick={showModal}
                className="text-dark bg-primary px-6 py-2 text-[16px] cursor-pointer hover:bg-primary/90 transition-all font-medium duration-300"
            >
                Buy Compute Credits
            </button>

            <Modal
                title={
                    <span className="text-white text-lg font-medium flex items-center gap-2">
                        <Zap className="text-primary h-5 w-5" />
                        <span>Buy Compute Credits</span>
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
                closable={step === "input" || step === "success" || !isConnected}
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
