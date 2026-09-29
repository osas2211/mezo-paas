"use client"

import { useState, useCallback } from "react"
import { createPublicClient, encodeDeployData, encodeFunctionData, type Address } from "viem"
import { mezoChains, mezoTransport, type MezoNetwork } from "@/lib/ide/mezo-network"
import { useBTCPrice, satsToUSD, satsToBTC, formatSats, formatBTC, formatUSD } from "./use-btc-price"

export interface GasEstimate {
  network: MezoNetwork
  gasUnits: bigint
  gasPrice: bigint
  totalWei: bigint
  totalSats: bigint

  satsFormatted: string
  btcFormatted: string
  btcAmount: number
  /** null when no BTC price is available */
  usdFormatted: string | null
  usdAmount: number | null
}

export interface GasEstimatorResult {
  estimate: GasEstimate | null
  isEstimating: boolean
  error: string | null
  btcPrice: number | null
  btcChange24h: number | null
  priceSource: string | null
  estimateDeployment: (
    bytecode: string,
    abi: any[],
    args?: any[],
    network?: MezoNetwork,
    from?: string
  ) => Promise<GasEstimate | null>
  estimateCall: (
    address: string,
    abi: any[],
    functionName: string,
    args?: any[],
    network?: MezoNetwork,
    from?: string
  ) => Promise<GasEstimate | null>
}

// Headroom added on top of eth_estimateGas, matching what wallets typically do
const BUFFER_PERCENT = BigInt(110)

function clientFor(network: MezoNetwork) {
  return createPublicClient({ chain: mezoChains[network], transport: mezoTransport(network) })
}

function shortError(err: any): string {
  return (err?.shortMessage || err?.message || "Failed to estimate gas").split("\n")[0]
}

export function useGasEstimator(): GasEstimatorResult {
  const { price: btcPrice, change24h: btcChange24h, source: priceSource } = useBTCPrice()

  const [estimate, setEstimate] = useState<GasEstimate | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buildEstimate = useCallback(
    (network: MezoNetwork, gasUnits: bigint, gasPrice: bigint): GasEstimate => {
      const totalWei = gasUnits * gasPrice
      // Gas is paid in BTC with 18 decimals: 1 sat = 10^10 wei
      const totalSats = totalWei / BigInt(10 ** 10)
      const usdAmount = btcPrice !== null ? satsToUSD(totalSats, btcPrice) : null
      return {
        network,
        gasUnits,
        gasPrice,
        totalWei,
        totalSats,
        satsFormatted: formatSats(totalSats),
        btcFormatted: formatBTC(totalSats),
        btcAmount: satsToBTC(totalSats),
        usdFormatted: usdAmount !== null ? formatUSD(usdAmount) : null,
        usdAmount,
      }
    },
    [btcPrice]
  )

  const run = useCallback(
    async (network: MezoNetwork, estimateGas: (client: ReturnType<typeof clientFor>) => Promise<bigint>) => {
      setIsEstimating(true)
      setError(null)
      try {
        const client = clientFor(network)
        const [gasUnits, gasPrice] = await Promise.all([estimateGas(client), client.getGasPrice()])
        const result = buildEstimate(network, (gasUnits * BUFFER_PERCENT) / BigInt(100), gasPrice)
        setEstimate(result)
        return result
      } catch (err: any) {
        setEstimate(null)
        setError(shortError(err))
        return null
      } finally {
        setIsEstimating(false)
      }
    },
    [buildEstimate]
  )

  /** Real eth_estimateGas for the contract creation (runs the constructor) */
  const estimateDeployment = useCallback(
    (bytecode: string, abi: any[], args: any[] = [], network: MezoNetwork = "testnet", from?: string) =>
      run(network, (client) =>
        client.estimateGas({
          account: from as Address | undefined,
          data: encodeDeployData({ abi, bytecode: bytecode as `0x${string}`, args }),
        })
      ),
    [run]
  )

  const estimateCall = useCallback(
    (address: string, abi: any[], functionName: string, args: any[] = [], network: MezoNetwork = "testnet", from?: string) =>
      run(network, (client) =>
        client.estimateGas({
          account: from as Address | undefined,
          to: address as Address,
          data: encodeFunctionData({ abi, functionName, args }),
        })
      ),
    [run]
  )

  return {
    estimate,
    isEstimating,
    error,
    btcPrice,
    btcChange24h,
    priceSource,
    estimateDeployment,
    estimateCall,
  }
}
