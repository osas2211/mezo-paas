/**
 * Mezo network facts — single source of truth for the IDE.
 *
 * Every address below was taken from Mezo's documentation (or, for mainnet
 * MUSD, from the verified token used by the documented MUSD/BTC pool) and
 * checked on-chain on 2026-09-29: contract code exists and the explorer has a
 * verified ABI. Do not add entries without doing the same.
 *
 * Sources:
 *  - RPCs:     https://mezo.org/docs/developers/getting-started/configure-environment/
 *  - MUSD:     https://mezo.org/docs/developers/getting-started/musd-payments-x402/x402-quickstart/
 *  - Oracles:  https://mezo.org/docs/developers/architecture/oracles/read-oracle/
 *  - Pools/ve: https://mezo.org/docs/developers/features/mezo-pools/
 */

import { fallback, http } from "viem"
import { mezo, mezoTestnet } from "viem/chains"

export type MezoNetwork = "testnet" | "mainnet"

export const CHAIN_IDS: Record<MezoNetwork, number> = {
  testnet: 31611,
  mainnet: 31612,
}

export function networkForChainId(chainId: number): MezoNetwork | null {
  if (chainId === CHAIN_IDS.testnet) return "testnet"
  if (chainId === CHAIN_IDS.mainnet) return "mainnet"
  return null
}

/**
 * Public RPC endpoints, in order of preference.
 * Mainnet: Mezo's documented providers. (viem's built-in `mezo` chain points at
 * rpc.mezo.org, which is not in Mezo's documented list and was unreachable when
 * tested — so we always pass explicit transports.)
 */
export const MEZO_RPC_URLS: Record<MezoNetwork, string[]> = {
  testnet: ["https://rpc.test.mezo.org"],
  mainnet: [
    "https://mezo-mainnet.boar.network",
    "https://mainnet.mezo.public.validationcloud.io",
    "https://mezo.drpc.org",
    "https://rpc_evm-mezo.imperator.co",
  ],
}

export const MEZO_EXPLORERS: Record<MezoNetwork, { url: string; api: string }> = {
  testnet: { url: "https://explorer.test.mezo.org", api: "https://api.explorer.test.mezo.org" },
  mainnet: { url: "https://explorer.mezo.org", api: "https://api.explorer.mezo.org" },
}

export const MEZO_FAUCET_URL = "https://faucet.test.mezo.org"

/** viem chain objects with Mezo's documented RPCs */
export const mezoChains = {
  testnet: {
    ...mezoTestnet,
    rpcUrls: { default: { http: MEZO_RPC_URLS.testnet } },
  },
  mainnet: {
    ...mezo,
    rpcUrls: { default: { http: MEZO_RPC_URLS.mainnet } },
  },
} as const

/** Transport that tries each documented RPC in turn */
export function mezoTransport(network: MezoNetwork) {
  return fallback(MEZO_RPC_URLS[network].map((url) => http(url)))
}

/* ------------------------------------------------------------------ */
/* Verified contract addresses                                          */
/* ------------------------------------------------------------------ */

type Address = `0x${string}`

export const MEZO_CONTRACTS = {
  BTC: {
    testnet: "0x7b7C000000000000000000000000000000000000",
    mainnet: "0x7b7C000000000000000000000000000000000000",
  },
  MEZO: {
    testnet: "0x7B7c000000000000000000000000000000000001",
    mainnet: "0x7B7c000000000000000000000000000000000001",
  },
  MUSD: {
    testnet: "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
    mainnet: "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186",
  },
  BTC_USD_ORACLE: {
    testnet: "0x7b7c000000000000000000000000000000000015",
    mainnet: "0x7b7c000000000000000000000000000000000015",
  },
  PYTH: {
    testnet: "0x2880aB155794e7179c9eE2e38200202908C17B43",
    mainnet: "0x2880aB155794e7179c9eE2e38200202908C17B43",
  },
  POOLS_ROUTER: {
    testnet: "0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9",
    mainnet: "0x16A76d3cd3C1e3CE843C6680d6B37E9116b5C706",
  },
  POOL_FACTORY: {
    testnet: "0x4947243CC818b627A5D06d14C4eCe7398A23Ce1A",
    mainnet: "0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248",
  },
  CL_SWAP_ROUTER: {
    testnet: "0x3112908bB72ce9c26a321Eeb22EC8e051F3b6E6a",
    mainnet: "0x37cDd11919ec3860eaD9efB8673d7476E5326225",
  },
  CL_POSITION_MANAGER: {
    testnet: "0x9B753e11bFEd0D88F6e1D2777E3c7dac42F96062",
    mainnet: "0x509Bc221df2B83927c695FA0bb0f5B21053C874c",
  },
  VEBTC: {
    testnet: "0xB63fcCd03521Cf21907627bd7fA465C129479231",
    mainnet: "0x7D807e9CE1ef73048FEe9A4214e75e894ea25914",
  },
  VEBTC_VOTER: {
    testnet: "0x72F8dd7F44fFa19E45955aa20A5486E8EB255738",
    mainnet: "0x3A4a6919F70e5b0aA32401747C471eCfe2322C1b",
  },
} as const satisfies Record<string, Record<MezoNetwork, Address>>

export type MezoContractKey = keyof typeof MEZO_CONTRACTS
