"use client"

import { useEffect } from "react"
import { Tooltip, Progress } from "antd"
import { Zap, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react"
import type { GasEstimate } from "@/hooks/ide/use-gas-estimator"
import { formatSats } from "@/hooks/ide/use-btc-price"
import { ide, IconButton, Notice, PanelHeader, Spinner, toneText } from "./ui"

interface GasEstimatorPanelProps {
  estimate: GasEstimate | null
  isEstimating: boolean
  error: string | null
  btcPrice: number
  btcChange24h: number
  onRefresh?: () => void
  compact?: boolean
}

const PROGRESS_TRAIL = "rgba(255,255,255,0.1)"

export default function GasEstimatorPanel({
  estimate,
  isEstimating,
  error,
  btcPrice,
  btcChange24h,
  onRefresh,
  compact = false,
}: GasEstimatorPanelProps) {
  if (isEstimating) {
    return (
      <div className={`${ide.card} p-3`}>
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <Spinner size={14} />
          <span>Estimating deployment cost...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertCircle size={14} />}>
        Failed to estimate: {error}
      </Notice>
    )
  }

  if (!estimate) {
    return null
  }

  const priceChangePositive = btcChange24h >= 0

  if (compact) {
    return (
      <div className={`${ide.card} p-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-primary" />
            <span className="text-white/60 text-xs">Est. Cost:</span>
          </div>
          <div className="text-right">
            <span className="text-primary font-mono text-sm font-medium">
              {estimate.satsFormatted}
            </span>
            <span className="text-white/40 text-xs ml-2">
              ≈ {estimate.usdFormatted}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const breakdownRows = [
    {
      label: "Base Fee",
      percent: estimate.breakdownPercent.baseFee,
      value: estimate.breakdown.baseFee,
      color: "#b3ec11",
    },
    {
      label: "Priority Fee",
      percent: estimate.breakdownPercent.priorityFee,
      value: estimate.breakdown.priorityFee,
      color: "rgba(179,236,17,0.5)",
    },
    {
      label: "Size Premium",
      percent: estimate.breakdownPercent.sizePremium,
      value: estimate.breakdown.sizePremium,
      color: "#f59e0b",
    },
  ]

  return (
    <div className={`${ide.card} overflow-hidden`}>
      {/* Header */}
      <PanelHeader
        icon={<Zap size={14} className="text-primary" />}
        title="Deployment Cost Estimate"
        actions={
          onRefresh && (
            <IconButton onClick={onRefresh} title="Refresh estimate">
              <RefreshCw size={12} />
            </IconButton>
          )
        }
      />

      <div className="p-3 space-y-4">
        {/* Main Cost Display */}
        <div className="border border-primary/30 bg-primary/10 p-3 text-center">
          <div className="text-2xl font-mono font-bold text-primary mb-1">
            {estimate.satsFormatted}
          </div>
          <div className="text-white/60 text-sm">
            <span className="font-mono">{estimate.btcFormatted}</span> BTC ≈{" "}
            <span className="text-white font-medium">{estimate.usdFormatted}</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          <div className={ide.label}>Cost Breakdown</div>
          <div className="space-y-2">
            {breakdownRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{row.label}</span>
                <div className="flex items-center gap-2">
                  <Progress
                    percent={row.percent}
                    showInfo={false}
                    strokeColor={row.color}
                    trailColor={PROGRESS_TRAIL}
                    size="small"
                    className="w-16"
                  />
                  <span className="text-white font-mono w-20 text-right">
                    {formatSats(row.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-white/10 bg-dark p-2 space-y-0.5">
            <div className={ide.label}>Gas Units</div>
            <div className="text-white font-mono text-xs">
              {estimate.gasUnits.toLocaleString()}
            </div>
          </div>
          <div className="border border-white/10 bg-dark p-2 space-y-0.5">
            <div className={ide.label}>Gas Price</div>
            <div className="text-white font-mono text-xs">
              {(Number(estimate.gasPrice) / 1e9).toFixed(2)} gwei
            </div>
          </div>
        </div>

        {/* BTC Price Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-1 text-white/40 text-[10px]">
            <span>BTC/USD:</span>
            <span className="text-white/60 font-mono">
              ${btcPrice.toLocaleString()}
            </span>
          </div>
          <div
            className={`flex items-center gap-1 text-[10px] font-mono ${
              priceChangePositive ? toneText.success : toneText.error
            }`}
          >
            {priceChangePositive ? (
              <TrendingUp size={10} />
            ) : (
              <TrendingDown size={10} />
            )}
            <span>{Math.abs(btcChange24h).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
