import { NextRequest, NextResponse } from "next/server"
import { MEZO_EXPLORERS, type MezoNetwork } from "@/lib/ide/mezo-network"

/**
 * GET /api/explorer/abi?network=testnet|mainnet&address=0x...
 * Returns the verified ABI from the Mezo Blockscout explorer. For proxies,
 * returns the implementation's ABI (what callers actually interact with).
 */

const REAL_PROXY_TYPES = new Set([
  "eip1967",
  "eip1822",
  "eip1167",
  "eip897",
  "eip2535",
  "master_copy",
  "clone_with_immutable_arguments",
])

interface ContractInfo {
  is_verified?: boolean
  name?: string
  proxy_type?: string | null
  abi?: any[]
  implementations?: { address?: string; address_hash?: string; name?: string }[]
}

async function fetchContract(api: string, address: string): Promise<ContractInfo | null> {
  const response = await fetch(`${api}/api/v2/smart-contracts/${address}`, {
    next: { revalidate: 3600 },
  })
  if (!response.ok) return null
  return response.json()
}

export async function GET(request: NextRequest) {
  const network = request.nextUrl.searchParams.get("network") as MezoNetwork | null
  const address = request.nextUrl.searchParams.get("address")

  if (!network || !(network in MEZO_EXPLORERS) || !address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "network and a valid address are required" }, { status: 400 })
  }

  const { api } = MEZO_EXPLORERS[network]

  try {
    const contract = await fetchContract(api, address)
    if (!contract?.is_verified) {
      return NextResponse.json({ verified: false, error: "Contract is not verified on the explorer" }, { status: 404 })
    }

    // Only follow real proxy standards. Blockscout's "basic_implementation" is a
    // heuristic that also matches factories exposing implementation() (e.g. Mezo's
    // PoolFactory), where the contract's own ABI is the right one.
    const ownFunctions = (contract.abi ?? []).filter((x) => x.type === "function").length
    const isRealProxy =
      (contract.proxy_type && REAL_PROXY_TYPES.has(contract.proxy_type)) || ownFunctions === 0
    const implementation = contract.implementations?.[0]
    const implementationAddress = implementation?.address_hash || implementation?.address
    if (isRealProxy && implementationAddress) {
      const impl = await fetchContract(api, implementationAddress)
      if (impl?.is_verified && impl.abi?.length) {
        return NextResponse.json({
          verified: true,
          name: impl.name || contract.name,
          abi: impl.abi,
          proxy: true,
          implementation: implementationAddress,
        })
      }
    }

    if (isRealProxy && ownFunctions === 0) {
      return NextResponse.json(
        { verified: false, error: "This is a proxy and its implementation isn't verified on the explorer" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      verified: true,
      name: contract.name,
      abi: contract.abi ?? [],
      proxy: false,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Explorer request failed" }, { status: 502 })
  }
}
