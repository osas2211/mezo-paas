/**
 * Transaction Simulator
 *
 * Runs the call with eth_call (viem simulateContract) against the network the
 * contract lives on, and estimates gas with eth_estimateGas. Nothing is
 * broadcast. Mezo's public RPCs don't expose debug_traceCall, so we report only
 * what eth_call can prove: success/revert, the decoded return value or revert
 * reason, and gas — no guessed state changes or events.
 */

import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  type Abi,
  type Address,
} from "viem"
import { mezoChains, mezoTransport, networkForChainId, type MezoNetwork } from "./mezo-network"

export interface SimulationRequest {
  contractAddress: string
  contractName: string
  abi: any[]
  functionName: string
  args: any[]
  value?: bigint
  /** Caller to simulate as (eth_call needs no signature, so any address works) */
  from?: string
  chainId: number
}

export interface SimulationResult {
  id: string
  request: {
    contractName: string
    contractAddress: string
    functionName: string
    from?: string
    value?: bigint
    network: MezoNetwork
  }
  success: boolean
  /** Decoded return value, formatted for display */
  returnValue: string | null
  gasUsed: bigint | null
  gasPrice: bigint | null
  /** gasUsed * gasPrice in wei (BTC has 18 decimals on Mezo) */
  costWei: bigint | null
  error: { title: string; reason: string | null } | null
  blockNumber: bigint
  timestamp: number
}

/** bigint-safe display formatting for decoded values */
export function formatValue(value: unknown): string {
  if (value === undefined) return "—"
  if (value === null) return "null"
  if (typeof value === "bigint") return value.toString()
  if (typeof value === "string") return value
  if (typeof value === "boolean") return String(value)
  return JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2)
}

function describeError(error: unknown): { title: string; reason: string | null } {
  if (error instanceof BaseError) {
    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError)
    if (revert instanceof ContractFunctionRevertedError) {
      const custom = revert.data?.errorName && revert.data.errorName !== "Error"
        ? `${revert.data.errorName}(${(revert.data.args ?? []).map(formatValue).join(", ")})`
        : null
      return {
        title: "Transaction would revert",
        reason: revert.reason ?? custom ?? "Reverted without a reason",
      }
    }
    return { title: error.shortMessage, reason: error.details ?? null }
  }
  return { title: "Simulation failed", reason: error instanceof Error ? error.message : String(error) }
}

export async function simulateTransaction(request: SimulationRequest): Promise<SimulationResult> {
  const network = networkForChainId(request.chainId) ?? "testnet"
  const client = createPublicClient({ chain: mezoChains[network], transport: mezoTransport(network) })

  const call = {
    address: request.contractAddress as Address,
    abi: request.abi as Abi,
    functionName: request.functionName,
    args: request.args,
    value: request.value,
    account: request.from as Address | undefined,
  }

  const base = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    request: {
      contractName: request.contractName,
      contractAddress: request.contractAddress,
      functionName: request.functionName,
      from: request.from,
      value: request.value,
      network,
    },
    timestamp: Date.now(),
  }

  const blockNumber = await client.getBlockNumber()

  let returnValue: string | null = null
  try {
    const { result } = await client.simulateContract(call as any)
    const fn = request.abi.find((x: any) => x.type === "function" && x.name === request.functionName)
    returnValue = fn?.outputs?.length ? formatValue(result) : null
  } catch (error) {
    return {
      ...base,
      success: false,
      returnValue: null,
      gasUsed: null,
      gasPrice: null,
      costWei: null,
      error: describeError(error),
      blockNumber,
    }
  }

  let gasUsed: bigint | null = null
  let gasPrice: bigint | null = null
  try {
    ;[gasUsed, gasPrice] = await Promise.all([client.estimateContractGas(call as any), client.getGasPrice()])
  } catch {
    // Succeeded as eth_call but gas couldn't be estimated (e.g. caller has no BTC for value)
  }

  return {
    ...base,
    success: true,
    returnValue,
    gasUsed,
    gasPrice,
    costWei: gasUsed !== null && gasPrice !== null ? gasUsed * gasPrice : null,
    error: null,
    blockNumber,
  }
}
