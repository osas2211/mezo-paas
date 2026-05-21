import React from "react"
import { Wallet } from "lucide-react"
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit"

export function ConnectWalletView() {
    const { openConnectModal } = useConnectModal()
    return (
        <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-white text-lg font-semibold">
                    Connect Your Wallet
                </h3>
                <p className="text-white/50 text-sm max-w-[300px]">
                    Connect your Mezo wallet to purchase compute credits and power your
                    deployments.
                </p>
            </div>
            {/* <ConnectButton /> */}
            <button
                className="text-dark bg-primary px-6 py-2 text-sm cursor-pointer hover:bg-primary/90 transition-all font-medium duration-300"
                onClick={() => openConnectModal?.()}>
                Connect Wallet
            </button>

            <p className="text-[11px] text-white/30 text-center max-w-[280px]">
                We recommend using the Mezo Wallet for the best experience on the Mezo
                network.
            </p>
        </div>
    )
}
