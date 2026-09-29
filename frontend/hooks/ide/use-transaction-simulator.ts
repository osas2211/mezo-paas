"use client"

import { useState, useCallback } from "react"
import { useAccount } from "wagmi"
import {
  simulateTransaction,
  type SimulationRequest,
  type SimulationResult,
} from "@/lib/ide/transaction-simulator"
import { useBTCPrice } from "./use-btc-price"

export type SimulationStatus = "idle" | "simulating" | "done"

export function useTransactionSimulator() {
  const { address } = useAccount()
  const { price: btcPrice, source: priceSource } = useBTCPrice()

  const [status, setStatus] = useState<SimulationStatus>("idle")
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [history, setHistory] = useState<SimulationResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const simulate = useCallback(
    async (request: SimulationRequest): Promise<SimulationResult | null> => {
      setStatus("simulating")
      setError(null)
      try {
        const simResult = await simulateTransaction({ ...request, from: request.from || address })
        setResult(simResult)
        setHistory((prev) => [simResult, ...prev].slice(0, 10))
        return simResult
      } catch (err: any) {
        // Network-level failure (RPC unreachable etc.)
        setError(err?.shortMessage || err?.message || "Simulation failed")
        return null
      } finally {
        setStatus("done")
      }
    },
    [address]
  )

  return {
    status,
    result,
    history,
    error,
    connectedAddress: address,
    btcPrice,
    priceSource,
    simulate,
    select: setResult,
    clearHistory: () => setHistory([]),
  }
}
