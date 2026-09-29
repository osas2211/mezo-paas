"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Wallet } from "lucide-react"
import { IdeButton } from "./ui"

/**
 * Wallet control for the IDE page header. Same visual language as the
 * header's account chip: bordered, square, lime status dot.
 */
export default function IdeWalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <IdeButton
                    variant="primary"
                    size="md"
                    icon={<Wallet size={16} />}
                    onClick={openConnectModal}
                  >
                    Connect Wallet
                  </IdeButton>
                )
              }

              if (chain.unsupported) {
                return (
                  <IdeButton variant="danger" size="md" onClick={openChainModal}>
                    Wrong Network
                  </IdeButton>
                )
              }

              return (
                <div className="flex items-center border border-white/10 text-sm">
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 h-10 px-4 text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="h-2 w-2 bg-primary rounded-full" />
                    {chain.name}
                  </button>
                  <div className="w-px h-5 bg-white/10" />
                  <button
                    onClick={openAccountModal}
                    className="h-10 px-4 font-mono text-xs text-white/90 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {account.displayName}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
