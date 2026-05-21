import React from "react"
import { Form, InputNumber } from "antd"
import { Zap, Shield, ArrowRight, Coins } from "lucide-react"
import { CREDIT_PACKAGES } from "./constants"

interface InputViewProps {
    formattedBalance: string
    address?: string
    selectedPackage: number | null
    setSelectedPackage: (idx: number | null) => void
    customAmount: string
    setCustomAmount: (val: string) => void
    form: any
    amount: string
    handleTopUp: () => void
    isApproving: boolean
    isTopping: boolean
    handleDisconnect: () => void
}

export function InputView({
    formattedBalance,
    address,
    selectedPackage,
    setSelectedPackage,
    customAmount,
    setCustomAmount,
    form,
    amount,
    handleTopUp,
    isApproving,
    isTopping,
    handleDisconnect,
}: InputViewProps) {
    return (
        <div className="space-y-5 py-2">
            {/* Wallet Info Bar */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3.5 rounded-xl group hover:border-primary/20 transition-all duration-300">
                <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">
                        Token Balance
                    </p>
                    <p className="text-white font-semibold text-base font-mono">
                        {formattedBalance} mBTC
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400/80 text-xs font-medium">
                        {address
                            ? `${address.slice(0, 6)}...${address.slice(-4)}`
                            : "Connected"}
                    </span>
                </div>
            </div>

            {/* Credit Packages */}
            <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                    Select a Credit Package
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                    {CREDIT_PACKAGES.map((pkg, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => {
                                setSelectedPackage(index)
                                setCustomAmount("")
                            }}
                            className={`relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 group ${selectedPackage === index
                                ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(179,236,17,0.08)]"
                                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
                                }`}
                        >
                            {pkg.popular && (
                                <span className="absolute -top-2 right-3 text-[9px] font-bold uppercase tracking-wider bg-primary text-dark px-2 py-0.5 rounded-full">
                                    Popular
                                </span>
                            )}
                            <p
                                className={`text-sm font-semibold mb-1 ${selectedPackage === index ? "text-primary" : "text-white"}`}
                            >
                                {pkg.label}
                            </p>
                            <p className="text-white/80 text-xs font-mono">
                                {pkg.amount} mBTC
                            </p>
                            <p className="text-white/40 text-[10px] mt-1">
                                ~{pkg.credits} credits
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Amount */}
            <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                    Or Enter Custom Amount
                </p>
                <Form form={form}>
                    <Form.Item className="mb-0">
                        <InputNumber
                            prefix={<Coins className="text-white/30 h-4 w-4 mr-2" />}
                            placeholder="0.00"
                            min={0.0001}
                            step={0.001}
                            value={customAmount ? Number(customAmount) : undefined}
                            onChange={(val: string | number | null) => {
                                if (val !== null && val !== undefined) {
                                    setCustomAmount(String(val))
                                    setSelectedPackage(null)
                                } else {
                                    setCustomAmount("")
                                }
                            }}
                            className="w-full! h-[45px] flex items-center bg-white/5 border-white/10 text-white! rounded-lg hover:border-primary/50 focus:border-primary/50! transition-all"
                            suffix={
                                <span className="text-white/30 text-xs font-mono">mBTC</span>
                            }
                        />
                    </Form.Item>
                </Form>
            </div>

            {/* Conversion Info */}
            <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg flex gap-3 text-xs text-primary/80 leading-normal">
                <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                    <span className="font-semibold text-primary">
                        {amount} mBTC
                    </span>{" "}
                    will be converted to compute credits. Credits are used automatically
                    for hosting and deployments.
                </div>
            </div>

            {/* Security Note */}
            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex gap-3 text-[11px] text-white/40 leading-normal">
                <Shield className="h-3.5 w-3.5 text-white/30 shrink-0 mt-0.5" />
                <div>
                    Transactions are processed on-chain via the MezoHost Billing smart
                    contract. You will be asked to approve the token spend first, then
                    confirm the top-up.
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleTopUp}
                disabled={
                    !amount || parseFloat(amount) <= 0 || isApproving || isTopping
                }
                className="w-full py-3.5 text-sm font-semibold bg-primary text-dark hover:bg-primary/90 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Zap className="h-4 w-4" />
                <span>Purchase {amount} mBTC in Credits</span>
                <ArrowRight className="h-4 w-4" />
            </button>
            <button
                onClick={handleDisconnect}
                className="w-full py-3.5 text-sm font-semibold bg-primary text-dark hover:bg-primary/90 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <span>Disconnect Wallet</span>
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}
