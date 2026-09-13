"use client"

import { useEffect } from "react"
import { Spin, Tooltip, Progress } from "antd"
import { Zap, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react"
import type { GasEstimate } from "@/hooks/ide/use-gas-estimator"
import { formatSats } from "@/hooks/ide/use-btc-price"

interface GasEstimatorPanelProps {
  estimate: GasEstimate | null
  isEstimating: boolean
  error: string | null
  btcPrice: number
  btcChange24h: number
  onRefresh?: () => void
  compact?: boolean
}

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
      <div className="p-3 bg-white/5 border border-white/10 rounded">
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <Spin size="small" />
          <span>Estimating deployment cost...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={14} />
          <span>Failed to estimate: {error}</span>
        </div>
      </div>
    )
  }

  if (!estimate) {
    return null
  }

  const priceChangePositive = btcChange24h >= 0

  if (compact) {
    return (
      <div className="p-2 bg-white/5 border border-white/10 rounded">
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

  return (
    <div className="bg-white/5 border border-white/10 rounded overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-primary" />
          <span className="text-white/80 text-xs font-medium">
            Deployment Cost Estimate
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Refresh estimate"
          >
            <RefreshCw size={12} className="text-white/40" />
          </button>
        )}
      </div>

      {/* Main Cost Display */}
      <div className="p-3">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-3 mb-3">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-primary mb-1">
              {estimate.satsFormatted}
            </div>
            <div className="text-white/60 text-sm">
              {estimate.btcFormatted} BTC ≈{" "}
              <span className="text-white/80">{estimate.usdFormatted}</span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mb-3">
          <div className="text-white/60 text-xs mb-2">Cost Breakdown</div>
          <div className="space-y-2">
            {/* Base Fee */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Base Fee</span>
              <div className="flex items-center gap-2">
                <Progress
                  percent={estimate.breakdownPercent.baseFee}
                  showInfo={false}
                  strokeColor="#b3ec11"
                  trailColor="rgba(255,255,255,0.1)"
                  size="small"
                  className="w-16"
                />
                <span className="text-white/80 font-mono w-20 text-right">
                  {formatSats(estimate.breakdown.baseFee)}
                </span>
              </div>
            </div>

            {/* Priority Fee */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Priority Fee</span>
              <div className="flex items-center gap-2">
                <Progress
                  percent={estimate.breakdownPercent.priorityFee}
                  showInfo={false}
                  strokeColor="#8b5cf6"
                  trailColor="rgba(255,255,255,0.1)"
                  size="small"
                  className="w-16"
                />
                <span className="text-white/80 font-mono w-20 text-right">
                  {formatSats(estimate.breakdown.priorityFee)}
                </span>
              </div>
            </div>

            {/* Size Premium */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Size Premium</span>
              <div className="flex items-center gap-2">
                <Progress
                  percent={estimate.breakdownPercent.sizePremium}
                  showInfo={false}
                  strokeColor="#f59e0b"
                  trailColor="rgba(255,255,255,0.1)"
                  size="small"
                  className="w-16"
                />
                <span className="text-white/80 font-mono w-20 text-right">
                  {formatSats(estimate.breakdown.sizePremium)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-black/30 rounded p-2">
            <div className="text-white/40 text-[10px] uppercase">Gas Units</div>
            <div className="text-white/80 font-mono text-xs">
              {estimate.gasUnits.toLocaleString()}
            </div>
          </div>
          <div className="bg-black/30 rounded p-2">
            <div className="text-white/40 text-[10px] uppercase">Gas Price</div>
            <div className="text-white/80 font-mono text-xs">
              {(Number(estimate.gasPrice) / 1e9).toFixed(2)} gwei
            </div>
          </div>
        </div>

        {/* BTC Price Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-1 text-white/40 text-[10px]">
            <span>BTC/USD:</span>
            <span className="text-white/60 font-mono">
              ${btcPrice.toLocaleString()}
            </span>
          </div>
          <div
            className={`flex items-center gap-1 text-[10px] ${
              priceChangePositive ? "text-green-400" : "text-red-400"
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
