"use client"

import { useState, useCallback } from "react"
import { usePublicClient, useAccount, useChainId } from "wagmi"
import type {
  SimulationRequest,
  SimulationResult,
  SimulationStatus,
} from "@/types/ide"
import { simulateTransaction, formatValue } from "@/lib/ide/transaction-simulator"
import { useBTCPrice } from "./use-btc-price"

export interface TransactionSimulatorResult {
  // State
  status: SimulationStatus
  result: SimulationResult | null
  error: string | null
  history: SimulationResult[]

  // BTC price info
  btcPrice: number

  // Actions
  simulate: (request: Omit<SimulationRequest, "chainId">) => Promise<SimulationResult | null>
  simulateWithOverrides: (
    request: Omit<SimulationRequest, "chainId">,
    overrides: {
      from?: string
      value?: bigint
      gasLimit?: bigint
    }
  ) => Promise<SimulationResult | null>
  reset: () => void
  clearHistory: () => void
}

export function useTransactionSimulator(): TransactionSimulatorResult {
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const chainId = useChainId()
  const { price: btcPrice } = useBTCPrice()

  const [status, setStatus] = useState<SimulationStatus>("idle")
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<SimulationResult[]>([])

  const simulate = useCallback(
    async (
      request: Omit<SimulationRequest, "chainId">
    ): Promise<SimulationResult | null> => {
      if (!publicClient) {
        setError("No RPC client available. Connect to a network first.")
        return null
      }

      setStatus("simulating")
      setError(null)

      try {
        const fullRequest: SimulationRequest = {
          ...request,
          from: request.from || address,
          chainId,
        }

        const simResult = await simulateTransaction(
          publicClient,
          fullRequest,
          btcPrice
        )

        setResult(simResult)
        setStatus(simResult.success ? "success" : "failed")

        // Add to history
        setHistory((prev) => [simResult, ...prev].slice(0, 10))

        if (!simResult.success && simResult.error) {
          setError(simResult.error.reason || simResult.error.message)
        }

        return simResult
      } catch (err: any) {
        const errorMsg = err.message || "Simulation failed"
        setError(errorMsg)
        setStatus("failed")
        return null
      }
    },
    [publicClient, address, chainId, btcPrice]
  )

  const simulateWithOverrides = useCallback(
    async (
      request: Omit<SimulationRequest, "chainId">,
      overrides: {
        from?: string
        value?: bigint
        gasLimit?: bigint
      }
    ): Promise<SimulationResult | null> => {
      return simulate({
        ...request,
        from: overrides.from || request.from,
        value: overrides.value ?? request.value,
      })
    },
    [simulate]
  )

  const reset = useCallback(() => {
    setStatus("idle")
    setResult(null)
    setError(null)
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    status,
    result,
    error,
    history,
    btcPrice,
    simulate,
    simulateWithOverrides,
    reset,
    clearHistory,
  }
}
