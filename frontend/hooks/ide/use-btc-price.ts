"use client"

import { useState, useEffect, useCallback } from "react"

import { createPublicClient, parseAbi } from "viem"
import { MEZO_CONTRACTS, mezoChains, mezoTransport, type MezoNetwork } from "@/lib/ide/mezo-network"

interface BTCPriceData {
  price: number
  /** 24h change is only available from CoinGecko */
  change24h: number | null
  source: "Mezo BTC/USD oracle" | "CoinGecko"
  lastUpdated: number
}

const CACHE_DURATION = 60000 // 1 minute cache
let cachedPrice: BTCPriceData | null = null
let fetchPromise: Promise<BTCPriceData | null> | null = null

const ORACLE_ABI = parseAbi([
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)",
])
const MAX_ORACLE_AGE_SECONDS = 3600

/** Mezo's on-chain, Chainlink-compatible BTC/USD feed */
async function fetchOraclePrice(network: MezoNetwork): Promise<BTCPriceData> {
  const client = createPublicClient({ chain: mezoChains[network], transport: mezoTransport(network) })
  const address = MEZO_CONTRACTS.BTC_USD_ORACLE[network]
  const [decimals, round] = await Promise.all([
    client.readContract({ address, abi: ORACLE_ABI, functionName: "decimals" }),
    client.readContract({ address, abi: ORACLE_ABI, functionName: "latestRoundData" }),
  ])
  const [, answer, , updatedAt] = round
  if (answer <= BigInt(0)) throw new Error("Oracle returned no price")
  if (Date.now() / 1000 - Number(updatedAt) > MAX_ORACLE_AGE_SECONDS) throw new Error("Oracle price is stale")
  return {
    price: Number(answer) / 10 ** decimals,
    change24h: null,
    source: "Mezo BTC/USD oracle",
    lastUpdated: Date.now(),
  }
}

async function fetchCoinGeckoPrice(): Promise<BTCPriceData> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
  )
  if (!response.ok) throw new Error("Failed to fetch BTC price")
  const data = await response.json()
  return {
    price: data.bitcoin.usd,
    change24h: data.bitcoin.usd_24h_change ?? null,
    source: "CoinGecko",
    lastUpdated: Date.now(),
  }
}

/** Returns null when no source is reachable — never a made-up price */
async function fetchBTCPrice(): Promise<BTCPriceData | null> {
  for (const source of [() => fetchOraclePrice("mainnet"), () => fetchOraclePrice("testnet"), fetchCoinGeckoPrice]) {
    try {
      return await source()
    } catch {
      // try the next source
    }
  }
  console.warn("BTC price unavailable from Mezo oracle and CoinGecko")
  return null
}

export function useBTCPrice() {
  const [priceData, setPriceData] = useState<BTCPriceData | null>(cachedPrice)
  const [isLoading, setIsLoading] = useState(!cachedPrice)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    // If there's already a fetch in progress, wait for it
    if (fetchPromise) {
      const data = await fetchPromise
      if (data) setPriceData(data)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      fetchPromise = fetchBTCPrice()
      const data = await fetchPromise
      if (data) {
        cachedPrice = data
        setPriceData(data)
      } else {
        setError("BTC price unavailable")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      fetchPromise = null
    }
  }, [])

  useEffect(() => {
    // Check if cache is still valid
    if (cachedPrice && Date.now() - cachedPrice.lastUpdated < CACHE_DURATION) {
      setPriceData(cachedPrice)
      setIsLoading(false)
      return
    }

    refresh()

    // Refresh price every minute
    const interval = setInterval(refresh, CACHE_DURATION)
    return () => clearInterval(interval)
  }, [refresh])

  return {
    /** null when unavailable — callers must not substitute a guess */
    price: priceData?.price ?? null,
    change24h: priceData?.change24h ?? null,
    source: priceData?.source ?? null,
    lastUpdated: priceData?.lastUpdated ?? 0,
    isLoading,
    error,
    refresh,
  }
}

// Utility functions for conversions
export const SATS_PER_BTC = 100_000_000

export function weiToSats(weiAmount: bigint, gasPrice: bigint): bigint {
  // On Mezo, gas is paid in BTC (18 decimals like ETH)
  // 1 BTC = 10^18 wei equivalent = 100,000,000 sats
  // So 1 sat = 10^10 wei equivalent
  const totalWei = weiAmount * gasPrice
  const sats = totalWei / BigInt(10 ** 10)
  return sats
}

export function satsToUSD(sats: bigint, btcPrice: number): number {
  const btc = Number(sats) / SATS_PER_BTC
  return btc * btcPrice
}

export function satsToBTC(sats: bigint): number {
  return Number(sats) / SATS_PER_BTC
}

export function formatSats(sats: bigint): string {
  const num = Number(sats)
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M sats`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K sats`
  }
  return `${num.toLocaleString()} sats`
}

export function formatBTC(sats: bigint): string {
  const btc = satsToBTC(sats)
  if (btc < 0.00001) {
    return btc.toExponential(2)
  }
  return btc.toFixed(8).replace(/\.?0+$/, "")
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
