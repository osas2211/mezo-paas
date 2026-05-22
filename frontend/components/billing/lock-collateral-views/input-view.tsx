import React from "react"
import { Form, InputNumber, Select } from "antd"
import { Shield, ArrowRight, Coins, Lock } from "lucide-react"

interface InputViewProps {
    formattedBalance: string
    address?: string
    amount: string
    setAmount: (val: string) => void
    duration: number
    setDuration: (val: number) => void
    form: any
    handleLock: () => void
    isApproving: boolean
    isLocking: boolean
    handleDisconnect: () => void
}

export function InputView({
    formattedBalance,
    address,
    amount,
    setAmount,
    duration,
    setDuration,
    form,
    handleLock,
    isApproving,
    isLocking,
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

            {/* Custom Amount */}
            <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                    Enter Amount to Lock
                </p>
                <Form form={form}>
                    <Form.Item className="mb-4">
                        <InputNumber
                            prefix={<Coins className="text-white/30 h-4 w-4 mr-2" />}
                            placeholder="0.00"
                            min={0.0001}
                            step={0.001}
                            value={amount ? Number(amount) : undefined}
                            onChange={(val: string | number | null) => {
                                if (val !== null && val !== undefined) {
                                    setAmount(String(val))
                                } else {
                                    setAmount("")
                                }
                            }}
                            className="w-full! h-[45px] flex items-center bg-white/5 border-white/10 text-white! rounded-lg hover:border-primary/50 focus:border-primary/50! transition-all"
                            suffix={
                                <span className="text-white/30 text-xs font-mono">mBTC</span>
                            }
                        />
                    </Form.Item>

                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                        Lock Duration
                    </p>
                    <Form.Item className="mb-0">
                        <Select
                            value={duration}
                            onChange={setDuration}
                            className="w-full! h-[45px]"
                            options={[
                                { value: 2592000, label: "30 Days" },
                                { value: 7776000, label: "90 Days" },
                                { value: 31536000, label: "365 Days" },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </div>

            {/* Conversion Info */}
            <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg flex gap-3 text-xs text-primary/80 leading-normal">
                <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                    <span className="font-semibold text-primary">
                        {amount || "0"} mBTC
                    </span>{" "}
                    will be locked as collateral. You will receive staked compute capacity permanently while locked.
                </div>
            </div>

            {/* Security Note */}
            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex gap-3 text-[11px] text-white/40 leading-normal">
                <Shield className="h-3.5 w-3.5 text-white/30 shrink-0 mt-0.5" />
                <div>
                    Transactions are processed on-chain. Early withdrawal carries a 5% penalty. You will be asked to approve the token spend first, then confirm the lock.
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleLock}
                disabled={
                    !amount || parseFloat(amount) <= 0 || isApproving || isLocking
                }
                className="w-full py-3.5 text-sm font-semibold bg-primary text-dark hover:bg-primary/90 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Lock className="h-4 w-4" />
                <span>Lock {amount || "0"} mBTC</span>
                <ArrowRight className="h-4 w-4" />
            </button>
            <button
                onClick={handleDisconnect}
                className="w-full py-3.5 text-sm font-semibold bg-red-500/10 border border-red-500/20 hover:border-red-500/80 text-red-500 hover:text-red-500/80 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <span>Disconnect Wallet</span>
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}
