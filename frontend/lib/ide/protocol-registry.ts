/**
 * Mezo Protocol Registry
 *
 * Only documented, on-chain-verified contracts (see ./mezo-network.ts).
 * ABIs are loaded from the Mezo explorer's verified source at runtime, so
 * signatures are never hand-written or out of date.
 */

import { MEZO_CONTRACTS, MEZO_EXPLORERS, type MezoContractKey, type MezoNetwork } from "./mezo-network"
import { PYTH_ABI } from "./abis/pyth"

export type ProtocolCategory = "token" | "oracle" | "dex" | "governance"

export interface Protocol {
  id: string
  name: string
  category: ProtocolCategory
  description: string
  contract: MezoContractKey
  docsUrl: string
  /** Bundled ABI (with provenance) for contracts whose source isn't verified on the explorer */
  staticAbi?: { abi: readonly any[]; source: string }
  /** Short, factual integration notes */
  notes?: string[]
}

export const CATEGORY_LABELS: Record<ProtocolCategory, string> = {
  token: "Tokens",
  oracle: "Oracles",
  dex: "Mezo Pools",
  governance: "Governance",
}

const DOCS = {
  musd: "https://mezo.org/docs/developers/musd/",
  oracles: "https://mezo.org/docs/developers/architecture/oracles/read-oracle/",
  pools: "https://mezo.org/docs/developers/features/mezo-pools/",
  env: "https://mezo.org/docs/developers/getting-started/configure-environment/",
}

export const PROTOCOLS: Protocol[] = [
  {
    id: "btc",
    name: "BTC",
    category: "token",
    description: "Native BTC exposed as an ERC-20 (18 decimals). BTC is also Mezo's gas token.",
    contract: "BTC",
    docsUrl: DOCS.env,
    notes: ["Supports EIP-2612 permit.", "Same address on testnet and mainnet."],
  },
  {
    id: "musd",
    name: "MUSD",
    category: "token",
    description: "Mezo USD — the BTC-backed stablecoin (Liquity-style troves). ERC-20 with permit.",
    contract: "MUSD",
    docsUrl: DOCS.musd,
    notes: ["Minting and burning are restricted to the MUSD system contracts."],
  },
  {
    id: "mezo",
    name: "MEZO",
    category: "token",
    description: "The MEZO token as an ERC-20 (18 decimals).",
    contract: "MEZO",
    docsUrl: DOCS.env,
    notes: ["Same address on testnet and mainnet."],
  },
  {
    id: "btc-usd-oracle",
    name: "BTC/USD Price Feed",
    category: "oracle",
    description: "Chainlink-compatible BTC/USD feed — read it with latestRoundData() and decimals().",
    contract: "BTC_USD_ORACLE",
    docsUrl: DOCS.oracles,
  },
  {
    id: "pyth",
    name: "Pyth",
    category: "oracle",
    description: "Pyth pull oracle for other price feeds (MUSD/USD, USDC/USD, MEZO/USD and more).",
    contract: "PYTH",
    docsUrl: DOCS.oracles,
    staticAbi: { abi: PYTH_ABI, source: "Pyth SDK (@pythnetwork/pyth-sdk-solidity 4.3.1)" },
    notes: [
      "Pull oracle: push a fresh update (updatePriceFeeds) before relying on a price — getPriceUnsafe can be stale.",
      "Feed IDs are listed in the Mezo oracle docs.",
    ],
  },
  {
    id: "pools-router",
    name: "Pools Router",
    category: "dex",
    description: "Router for Mezo's basic (volatile and stable) pools: swaps and liquidity.",
    contract: "POOLS_ROUTER",
    docsUrl: DOCS.pools,
  },
  {
    id: "pool-factory",
    name: "Pool Factory",
    category: "dex",
    description: "Creates basic pools and looks up existing pools (getPool).",
    contract: "POOL_FACTORY",
    docsUrl: DOCS.pools,
  },
  {
    id: "cl-swap-router",
    name: "CL Swap Router",
    category: "dex",
    description: "Swap router for concentrated-liquidity pools.",
    contract: "CL_SWAP_ROUTER",
    docsUrl: DOCS.pools,
  },
  {
    id: "cl-position-manager",
    name: "CL Position Manager",
    category: "dex",
    description: "Mints and manages concentrated-liquidity positions as NFTs.",
    contract: "CL_POSITION_MANAGER",
    docsUrl: DOCS.pools,
  },
  {
    id: "vebtc",
    name: "veBTC",
    category: "governance",
    description: "Vote-escrowed BTC: lock BTC as an NFT (createLock) for voting power.",
    contract: "VEBTC",
    docsUrl: DOCS.pools,
  },
  {
    id: "vebtc-voter",
    name: "veBTC Voter",
    category: "governance",
    description: "Directs veBTC voting power to gauges.",
    contract: "VEBTC_VOTER",
    docsUrl: DOCS.pools,
  },
]

export function protocolAddress(protocol: Protocol, network: MezoNetwork): string {
  return MEZO_CONTRACTS[protocol.contract][network]
}

export function explorerAddressUrl(address: string, network: MezoNetwork): string {
  return `${MEZO_EXPLORERS[network].url}/address/${address}`
}

export function searchProtocols(query: string, protocols: Protocol[] = PROTOCOLS): Protocol[] {
  const q = query.trim().toLowerCase()
  if (!q) return protocols
  return protocols.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      CATEGORY_LABELS[p.category].toLowerCase().includes(q)
  )
}

/* ------------------------------------------------------------------ */
/* ABI loading                                                          */
/* ------------------------------------------------------------------ */

export interface LoadedAbi {
  abi: any[]
  contractName: string
  proxy: boolean
  /** Where the ABI came from */
  source: string
}

const abiCache = new Map<string, Promise<LoadedAbi>>()

async function fetchAbi(network: MezoNetwork, address: string): Promise<LoadedAbi> {
  const response = await fetch(`/api/explorer/abi?network=${network}&address=${address}`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.verified) {
    throw new Error(data.error || `Could not load ABI (HTTP ${response.status})`)
  }
  return {
    abi: data.abi,
    contractName: data.name,
    proxy: !!data.proxy,
    source: data.proxy ? "Verified implementation on Mezo explorer" : "Verified source on Mezo explorer",
  }
}

export function loadProtocolAbi(protocol: Protocol, network: MezoNetwork): Promise<LoadedAbi> {
  const key = `${protocol.id}:${network}`
  if (protocol.staticAbi) {
    return Promise.resolve({
      abi: [...protocol.staticAbi.abi],
      contractName: protocol.name,
      proxy: false,
      source: protocol.staticAbi.source,
    })
  }
  if (!abiCache.has(key)) {
    const promise = fetchAbi(network, protocolAddress(protocol, network))
    // Don't cache failures
    abiCache.set(key, promise.catch((e) => { abiCache.delete(key); throw e }))
  }
  return abiCache.get(key)!
}

/* ------------------------------------------------------------------ */
/* ABI helpers                                                          */
/* ------------------------------------------------------------------ */

export interface AbiSummary {
  reads: any[]
  writes: any[]
  events: any[]
}

export function summarizeAbi(abi: any[]): AbiSummary {
  const functions = abi.filter((x) => x.type === "function")
  return {
    reads: functions.filter((f) => f.stateMutability === "view" || f.stateMutability === "pure"),
    writes: functions.filter((f) => f.stateMutability !== "view" && f.stateMutability !== "pure"),
    events: abi.filter((x) => x.type === "event"),
  }
}

export function formatSignature(item: any): string {
  const params = (item.inputs ?? [])
    .map((p: any) => `${displayType(p)}${p.indexed ? " indexed" : ""}${p.name ? " " + p.name : ""}`)
    .join(", ")
  const outputs = item.type === "function" && item.outputs?.length
    ? ` → ${item.outputs.map((o: any) => displayType(o)).join(", ")}`
    : ""
  return `${item.name}(${params})${outputs}`
}

function displayType(param: any): string {
  if (param.type.startsWith("tuple")) return structName(param) + param.type.slice("tuple".length)
  return param.type
}

/* ------------------------------------------------------------------ */
/* Solidity interface generation from a real ABI                        */
/* ------------------------------------------------------------------ */

function structName(param: any): string {
  // internalType looks like "struct IPyth.Price" or "struct Foo[]"
  const match = /struct\s+(?:[\w]+\.)?(\w+)/.exec(param.internalType ?? "")
  return match?.[1] ?? "Tuple"
}

function isDynamic(param: any): boolean {
  return (
    param.type === "string" ||
    param.type === "bytes" ||
    param.type.endsWith("]") ||
    param.type.startsWith("tuple")
  )
}

export function generateInterface(name: string, abi: any[]): string {
  const interfaceName = "I" + name.replace(/[^a-zA-Z0-9]/g, "")
  const structs = new Map<string, string>()

  const solType = (param: any): string => {
    if (!param.type.startsWith("tuple")) return param.type
    const sName = structName(param)
    if (!structs.has(sName)) {
      structs.set(sName, "") // reserve (handles recursion)
      const fields = (param.components ?? [])
        .map((c: any, i: number) => `        ${solType(c)} ${c.name || `field${i}`};`)
        .join("\n")
      structs.set(sName, `    struct ${sName} {\n${fields}\n    }`)
    }
    return sName + param.type.slice("tuple".length)
  }

  const paramList = (params: any[], location: "calldata" | "memory", withNames: boolean) =>
    params
      .map((p, i) => {
        const t = solType(p)
        const loc = isDynamic(p) ? ` ${location}` : ""
        const n = withNames ? ` ${p.name || `arg${i}`}` : p.name ? ` ${p.name}` : ""
        return `${t}${loc}${n}`
      })
      .join(", ")

  const functions = abi
    .filter((x) => x.type === "function")
    .map((f) => {
      const mutability =
        f.stateMutability === "view" || f.stateMutability === "pure" || f.stateMutability === "payable"
          ? ` ${f.stateMutability}`
          : ""
      const returns = f.outputs?.length ? ` returns (${paramList(f.outputs, "memory", false)})` : ""
      return `    function ${f.name}(${paramList(f.inputs ?? [], "calldata", true)}) external${mutability}${returns};`
    })

  const events = abi
    .filter((x) => x.type === "event")
    .map((e) => {
      const params = (e.inputs ?? [])
        .map((p: any) => `${solType(p)}${p.indexed ? " indexed" : ""}${p.name ? " " + p.name : ""}`)
        .join(", ")
      return `    event ${e.name}(${params});`
    })

  const sections = [
    structs.size ? [...structs.values()].join("\n\n") : "",
    events.join("\n"),
    functions.join("\n"),
  ].filter(Boolean)

  return [
    "// SPDX-License-Identifier: MIT",
    "pragma solidity ^0.8.20;",
    "",
    `/// @notice Generated by Mezo IDE from the verified ${name} ABI on the Mezo explorer.`,
    `interface ${interfaceName} {`,
    sections.join("\n\n"),
    "}",
    "",
  ].join("\n")
}
