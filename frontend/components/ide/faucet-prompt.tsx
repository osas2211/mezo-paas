"use client"

import { useState } from "react"
import { formatEther } from "viem"
import { Check, Droplets, ExternalLink, RefreshCw, Wallet } from "lucide-react"
import { MEZO_FAUCET_URL, type MezoNetwork } from "@/lib/ide/mezo-network"
import { useMezoBalance } from "@/hooks/ide/use-mezo-balance"
import { IconButton, IdeButton, Notice } from "./ui"

interface FaucetPromptProps {
  address?: string
  network: MezoNetwork
  /** Estimated deploy cost in wei; when known, "enough" means balance >= cost */
  requiredWei?: bigint | null
}

function formatBtc(wei: bigint): string {
  const value = Number(formatEther(wei))
  if (value === 0) return "0"
  if (value < 0.000001) return value.toExponential(2)
  return value.toFixed(6).replace(/\.?0+$/, "")
}

/**
 * Shows the wallet's BTC balance on the deploy network and, on testnet,
 * guides the user to the Mezo faucet when they can't cover gas.
 * The faucet uses a captcha, so we can't request funds for the user —
 * we copy their address and open the faucet in a new tab.
 */
export default function FaucetPrompt({ address, network, requiredWei }: FaucetPromptProps) {
  const [copied, setCopied] = useState(false)
  const { balance, isLoading, error, refresh } = useMezoBalance(address, network, true)

  if (!address) return null

  const needsFunds =
    balance !== null && (balance === BigInt(0) || (requiredWei != null && balance < requiredWei))

  const openFaucet = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 4000)
    } catch {
      // Clipboard can be blocked; the faucet still opens
    }
    window.open(MEZO_FAUCET_URL, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 text-white/50">
          <Wallet size={12} />
          Balance on {network}
        </span>
        <span className="flex items-center gap-1">
          <span className={`font-mono ${needsFunds ? "text-amber-500" : "text-white/80"}`}>
            {balance === null ? (error ? "unavailable" : "…") : `${formatBtc(balance)} BTC`}
          </span>
          <IconButton onClick={() => void refresh()} title="Refresh balance" aria-label="Refresh balance" className="h-6! w-6!">
            <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
          </IconButton>
        </span>
      </div>

      {needsFunds && network === "testnet" && (
        <Notice tone="warning" icon={<Droplets size={14} />} title="You need testnet BTC to deploy">
          <p>
            Gas on Mezo is paid in BTC. Get free testnet BTC from the Mezo faucet — paste your address there
            (we&apos;ll copy it for you). This updates automatically once it arrives.
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <IdeButton
              variant="primary"
              size="xs"
              icon={copied ? <Check size={12} /> : <ExternalLink size={12} />}
              onClick={openFaucet}
            >
              {copied ? "Address copied — faucet opened" : "Copy address & open faucet"}
            </IdeButton>
          </div>
        </Notice>
      )}

      {needsFunds && network === "mainnet" && (
        <Notice tone="warning" icon={<Wallet size={14} />} title="Not enough BTC for gas">
          Add BTC to this wallet on Mezo Mainnet to cover the estimated deployment cost.
        </Notice>
      )}
    </div>
  )
}
