"use client"

import { formatGwei } from "viem"
import { RefreshCw, Zap } from "lucide-react"
import type { GasEstimate } from "@/hooks/ide/use-gas-estimator"
import { formatUSD } from "@/hooks/ide/use-btc-price"
import { IconButton, Notice, PanelHeader, Spinner, ide } from "./ui"

interface GasEstimatorPanelProps {
  estimate: GasEstimate | null
  isEstimating: boolean
  error: string | null
  btcPrice: number | null
  priceSource: string | null
  /** Shown instead of an estimate, e.g. while constructor args are incomplete */
  hint?: string | null
  onRefresh?: () => void
}

export default function GasEstimatorPanel({
  estimate,
  isEstimating,
  error,
  btcPrice,
  priceSource,
  hint,
  onRefresh,
}: GasEstimatorPanelProps) {
  return (
    <div className={ide.card}>
      <PanelHeader
        icon={<Zap size={13} className="text-primary" />}
        title="Estimated deployment cost"
        actions={
          onRefresh && (
            <IconButton onClick={onRefresh} disabled={isEstimating} title="Re-estimate" aria-label="Re-estimate">
              <RefreshCw size={12} className={isEstimating ? "animate-spin" : ""} />
            </IconButton>
          )
        }
      />

      <div className="p-3">
        {isEstimating ? (
          <div className="flex items-center gap-2 text-xs text-white/50 py-2">
            <Spinner size={13} /> Asking the network…
          </div>
        ) : error ? (
          <Notice tone="error">{error}</Notice>
        ) : hint && !estimate ? (
          <p className="text-xs text-white/50 py-1">{hint}</p>
        ) : estimate ? (
          <div className="space-y-3">
            <div>
              <p className="font-mono text-lg text-white leading-tight">{estimate.btcFormatted} BTC</p>
              <p className="text-xs text-white/50 mt-0.5">
                {estimate.satsFormatted}
                {estimate.usdFormatted ? ` · ≈ ${estimate.usdFormatted}` : " · USD price unavailable"}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 text-xs">
              <div className="bg-dark p-2">
                <dt className={ide.label}>Gas limit</dt>
                <dd className="font-mono text-white/80 mt-0.5">{estimate.gasUnits.toLocaleString()}</dd>
              </div>
              <div className="bg-dark p-2">
                <dt className={ide.label}>Gas price</dt>
                <dd className="font-mono text-white/80 mt-0.5">{formatGwei(estimate.gasPrice)} gwei</dd>
              </div>
            </dl>

            <p className="text-[10px] text-white/30 leading-relaxed">
              eth_estimateGas on Mezo {estimate.network} + 10% headroom.
              {btcPrice !== null && priceSource && ` BTC ${formatUSD(btcPrice)} via ${priceSource}.`}
            </p>
          </div>
        ) : (
          <p className="text-xs text-white/50 py-1">No estimate yet.</p>
        )}
      </div>
    </div>
  )
}
