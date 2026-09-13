"use client"

import { useState, useEffect, useCallback } from "react"

interface BTCPriceData {
  price: number
  change24h: number
  lastUpdated: number
}

const CACHE_DURATION = 60000 // 1 minute cache
let cachedPrice: BTCPriceData | null = null
let fetchPromise: Promise<BTCPriceData> | null = null

async function fetchBTCPrice(): Promise<BTCPriceData> {
  // Use CoinGecko API (free, no API key required)
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch BTC price")
    }

    const data = await response.json()

    return {
      price: data.bitcoin.usd,
      change24h: data.bitcoin.usd_24h_change || 0,
      lastUpdated: Date.now(),
    }
  } catch (error) {
    // Fallback to a reasonable estimate if API fails
    console.warn("BTC price fetch failed, using fallback")
    return {
      price: 70000, // Fallback price
      change24h: 0,
      lastUpdated: Date.now(),
    }
  }
}

export function useBTCPrice() {
  const [priceData, setPriceData] = useState<BTCPriceData | null>(cachedPrice)
  const [isLoading, setIsLoading] = useState(!cachedPrice)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    // If there's already a fetch in progress, wait for it
    if (fetchPromise) {
      const data = await fetchPromise
      setPriceData(data)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      fetchPromise = fetchBTCPrice()
      const data = await fetchPromise
      cachedPrice = data
      setPriceData(data)
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
    price: priceData?.price ?? 0,
    change24h: priceData?.change24h ?? 0,
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
