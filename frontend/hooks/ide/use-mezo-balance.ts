"use client"

import { useCallback, useEffect, useState } from "react"
import { createPublicClient, type Address } from "viem"
import { mezoChains, mezoTransport, type MezoNetwork } from "@/lib/ide/mezo-network"

/**
 * Native BTC balance of an address on a Mezo network — read from that network
 * directly, not from whatever chain the wallet happens to be on.
 * Polls every 15s while `poll` is true and refreshes when the tab regains focus
 * (e.g. after the user comes back from the faucet).
 */
export function useMezoBalance(address: string | undefined, network: MezoNetwork, poll = false) {
  const [balance, setBalance] = useState<bigint | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!address) {
      setBalance(null)
      return
    }
    setIsLoading(true)
    try {
      const client = createPublicClient({ chain: mezoChains[network], transport: mezoTransport(network) })
      setBalance(await client.getBalance({ address: address as Address }))
      setError(null)
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Couldn't read balance")
    } finally {
      setIsLoading(false)
    }
  }, [address, network])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onFocus = () => void refresh()
    window.addEventListener("focus", onFocus)
    const interval = poll ? setInterval(() => void refresh(), 15000) : undefined
    return () => {
      window.removeEventListener("focus", onFocus)
      if (interval) clearInterval(interval)
    }
  }, [refresh, poll])

  return { balance, isLoading, error, refresh }
}
