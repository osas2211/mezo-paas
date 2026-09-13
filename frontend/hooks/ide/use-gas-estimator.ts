"use client"

import { useState, useCallback } from "react"
import { usePublicClient } from "wagmi"
import { encodeFunctionData } from "viem"
import {
  useBTCPrice,
  weiToSats,
  satsToUSD,
  satsToBTC,
  formatSats,
  formatBTC,
  formatUSD,
  SATS_PER_BTC,
} from "./use-btc-price"

export interface GasEstimate {
  // Raw values
  gasUnits: bigint
  gasPrice: bigint
  totalWei: bigint
  totalSats: bigint

  // Formatted values
  satsFormatted: string
  btcFormatted: string
  usdFormatted: string
  btcAmount: number
  usdAmount: number

  // Breakdown
  breakdown: {
    baseFee: bigint
    priorityFee: bigint
    sizePremium: bigint
  }

  // Breakdown percentages
  breakdownPercent: {
    baseFee: number
    priorityFee: number
    sizePremium: number
  }
}

export interface GasEstimatorResult {
  estimate: GasEstimate | null
  isEstimating: boolean
  error: string | null
  btcPrice: number
  btcChange24h: number
  estimateDeployment: (bytecode: string, abi: any[], args?: any[]) => Promise<GasEstimate | null>
  estimateCall: (address: string, abi: any[], functionName: string, args?: any[]) => Promise<GasEstimate | null>
}

export function useGasEstimator(): GasEstimatorResult {
  const publicClient = usePublicClient()
  const { price: btcPrice, change24h: btcChange24h } = useBTCPrice()

  const [estimate, setEstimate] = useState<GasEstimate | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateEstimate = useCallback(
    (gasUnits: bigint, gasPrice: bigint, bytecodeSize: number = 0): GasEstimate => {
      const totalWei = gasUnits * gasPrice
      const totalSats = weiToSats(gasUnits, gasPrice)

      // Calculate breakdown (approximate)
      // Base fee: ~70% of gas
      // Priority fee: ~20% of gas
      // Size premium: ~10% based on bytecode size
      const baseFeePercent = 0.7
      const priorityPercent = 0.2
      const sizePercent = 0.1

      const baseFee = BigInt(Math.floor(Number(totalSats) * baseFeePercent))
      const priorityFee = BigInt(Math.floor(Number(totalSats) * priorityPercent))
      const sizePremium = BigInt(Math.floor(Number(totalSats) * sizePercent))

      const btcAmount = satsToBTC(totalSats)
      const usdAmount = satsToUSD(totalSats, btcPrice)

      return {
        gasUnits,
        gasPrice,
        totalWei,
        totalSats,
        satsFormatted: formatSats(totalSats),
        btcFormatted: formatBTC(totalSats),
        usdFormatted: formatUSD(usdAmount),
        btcAmount,
        usdAmount,
        breakdown: {
          baseFee,
          priorityFee,
          sizePremium,
        },
        breakdownPercent: {
          baseFee: baseFeePercent * 100,
          priorityFee: priorityPercent * 100,
          sizePremium: sizePercent * 100,
        },
      }
    },
    [btcPrice]
  )

  const estimateDeployment = useCallback(
    async (
      bytecode: string,
      abi: any[],
      args: any[] = []
    ): Promise<GasEstimate | null> => {
      if (!publicClient) {
        setError("No public client available")
        return null
      }

      setIsEstimating(true)
      setError(null)

      try {
        // Get current gas price
        const gasPrice = await publicClient.getGasPrice()

        // Estimate gas for deployment
        // For deployment, we estimate based on bytecode size
        // Approximate: 21000 base + 200 per byte + 32000 per non-zero byte
        const bytecodeBytes = bytecode.startsWith("0x")
          ? bytecode.slice(2)
          : bytecode
        const byteLength = bytecodeBytes.length / 2

        // Rough estimation formula for contract deployment
        // Base: 21,000
        // Per byte: ~68 gas for zero bytes, ~200 for non-zero
        // Creation overhead: ~32,000
        const baseGas = BigInt(21000)
        const creationOverhead = BigInt(32000)
        const perByteGas = BigInt(Math.ceil(byteLength * 150)) // Average estimate

        // Add some buffer for constructor execution if there are args
        const constructorBuffer = args.length > 0 ? BigInt(50000 * args.length) : BigInt(0)

        const estimatedGas = baseGas + creationOverhead + perByteGas + constructorBuffer

        // Add 20% buffer for safety
        const gasWithBuffer = (estimatedGas * BigInt(120)) / BigInt(100)

        const result = calculateEstimate(gasWithBuffer, gasPrice, byteLength)
        setEstimate(result)
        return result
      } catch (err: any) {
        console.error("Gas estimation error:", err)
        setError(err.message || "Failed to estimate gas")
        return null
      } finally {
        setIsEstimating(false)
      }
    },
    [publicClient, calculateEstimate]
  )

  const estimateCall = useCallback(
    async (
      address: string,
      abi: any[],
      functionName: string,
      args: any[] = []
    ): Promise<GasEstimate | null> => {
      if (!publicClient) {
        setError("No public client available")
        return null
      }

      setIsEstimating(true)
      setError(null)

      try {
        // Get current gas price
        const gasPrice = await publicClient.getGasPrice()

        // Encode function data
        const data = encodeFunctionData({
          abi,
          functionName,
          args,
        })

        // Estimate gas for the call
        const gasUnits = await publicClient.estimateGas({
          to: address as `0x${string}`,
          data,
        })

        // Add 10% buffer
        const gasWithBuffer = (gasUnits * BigInt(110)) / BigInt(100)

        const result = calculateEstimate(gasWithBuffer, gasPrice)
        setEstimate(result)
        return result
      } catch (err: any) {
        console.error("Gas estimation error:", err)
        setError(err.message || "Failed to estimate gas")
        return null
      } finally {
        setIsEstimating(false)
      }
    },
    [publicClient, calculateEstimate]
  )

  return {
    estimate,
    isEstimating,
    error,
    btcPrice,
    btcChange24h,
    estimateDeployment,
    estimateCall,
  }
}
