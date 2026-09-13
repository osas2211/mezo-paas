/**
 * Transaction Simulator Service
 * Simulates transactions using eth_call without broadcasting
 * Decodes state changes, events, and provides detailed gas analysis
 */

import {
  encodeFunctionData,
  decodeFunctionResult,
  decodeErrorResult,
  parseAbi,
  type Abi,
  type PublicClient,
  decodeEventLog,
  toHex,
  fromHex,
  formatEther,
} from "viem"
import type {
  SimulationRequest,
  SimulationResult,
  SimulationEvent,
  SimulationStateChange,
  SimulationTrace,
} from "@/types/ide"
import { MEZO_NETWORKS } from "@/types/ide"

// Common error signatures for decoding revert reasons
const ERROR_SIGNATURES: Record<string, string> = {
  "0x08c379a0": "Error(string)", // Standard revert
  "0x4e487b71": "Panic(uint256)", // Panic codes
}

// Panic code meanings
const PANIC_CODES: Record<number, string> = {
  0x00: "Generic compiler inserted panic",
  0x01: "Assert failed",
  0x11: "Arithmetic overflow/underflow",
  0x12: "Division by zero",
  0x21: "Enum conversion error",
  0x22: "Storage encoding error",
  0x31: "Pop on empty array",
  0x32: "Array index out of bounds",
  0x41: "Too much memory allocated",
  0x51: "Zero-initialized internal function",
}

/**
 * Decode a revert reason from error data
 */
export function decodeRevertReason(data: string): string {
  if (!data || data === "0x") {
    return "Transaction reverted without reason"
  }

  const selector = data.slice(0, 10)

  // Standard Error(string)
  if (selector === "0x08c379a0") {
    try {
      const reason = decodeErrorResult({
        abi: parseAbi(["error Error(string)"]),
        data: data as `0x${string}`,
      })
      return reason.args?.[0] as string || "Unknown error"
    } catch {
      return "Failed to decode error string"
    }
  }

  // Panic(uint256)
  if (selector === "0x4e487b71") {
    try {
      const code = parseInt(data.slice(10, 74), 16)
      return PANIC_CODES[code] || `Panic code: 0x${code.toString(16)}`
    } catch {
      return "Panic error"
    }
  }

  // Custom error - return raw data
  return `Custom error: ${data.slice(0, 66)}...`
}

/**
 * Decode events from logs using contract ABI
 */
export function decodeEvents(
  logs: Array<{ topics: string[]; data: string; address: string }>,
  abi: any[]
): SimulationEvent[] {
  const events: SimulationEvent[] = []

  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi,
        data: log.data as `0x${string}`,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      }) as { eventName: string; args: Record<string, unknown> }

      events.push({
        name: decoded.eventName,
        signature: `${decoded.eventName}(${Object.keys(decoded.args || {}).join(", ")})`,
        args: decoded.args as Record<string, any>,
        topics: log.topics,
        data: log.data,
      })
    } catch {
      // Unknown event, add raw
      events.push({
        name: "Unknown",
        signature: log.topics[0] || "0x",
        args: {},
        topics: log.topics,
        data: log.data,
      })
    }
  }

  return events
}

/**
 * Format a value for display (handles bigint, addresses, etc.)
 */
export function formatValue(value: any): string {
  if (value === undefined || value === null) {
    return "null"
  }

  if (typeof value === "bigint") {
    // If it looks like a wei value, also show in ether
    if (value > BigInt(10 ** 15)) {
      return `${value.toString()} (${formatEther(value)} BTC)`
    }
    return value.toString()
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false"
  }

  if (typeof value === "string") {
    // Address
    if (value.startsWith("0x") && value.length === 42) {
      return value
    }
    // Bytes
    if (value.startsWith("0x")) {
      if (value.length > 66) {
        return `${value.slice(0, 34)}...${value.slice(-32)}`
      }
      return value
    }
    return value
  }

  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(", ")}]`
  }

  if (typeof value === "object") {
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Simulate a transaction using eth_call
 */
export async function simulateTransaction(
  client: PublicClient,
  request: SimulationRequest,
  btcPrice: number
): Promise<SimulationResult> {
  const startTime = Date.now()

  try {
    // Encode function call
    const data = encodeFunctionData({
      abi: request.abi,
      functionName: request.functionName,
      args: request.args,
    })

    // Get current block for context
    const block = await client.getBlock()

    // Get gas price for cost estimation
    const gasPrice = await client.getGasPrice()

    // Estimate gas first
    let gasEstimate: bigint
    try {
      gasEstimate = await client.estimateGas({
        to: request.contractAddress as `0x${string}`,
        data,
        value: request.value,
        account: request.from as `0x${string}` | undefined,
      })
    } catch (err: any) {
      // If estimation fails, the tx would fail - decode why
      const errorData = err.data || err.cause?.data
      const reason = decodeRevertReason(errorData)

      return {
        success: false,
        returnData: "0x",
        gasUsed: BigInt(0),
        gasCost: {
          sats: BigInt(0),
          btc: "0",
          usd: "$0.00",
        },
        stateChanges: [],
        events: [],
        traces: [],
        error: {
          message: err.shortMessage || err.message || "Transaction would revert",
          reason,
          data: errorData,
        },
        blockNumber: block.number,
        timestamp: startTime,
      }
    }

    // Perform the simulation via eth_call
    let returnData: string = "0x"
    try {
      const callResult = await client.call({
        to: request.contractAddress as `0x${string}`,
        data,
        value: request.value,
        account: request.from as `0x${string}` | undefined,
        gas: gasEstimate,
      })

      // viem call returns { data: "0x..." } - extract the data
      if (typeof callResult === "object" && callResult !== null) {
        returnData = (callResult as { data?: string }).data || "0x"
      } else if (typeof callResult === "string") {
        returnData = callResult
      }
    } catch (err: any) {
      // Extract error data - could be string or object
      let errorData = "0x"
      const rawError = err.data || err.cause?.data
      if (typeof rawError === "object" && rawError !== null) {
        errorData = (rawError as { data?: string }).data || "0x"
      } else if (typeof rawError === "string") {
        errorData = rawError
      }

      const reason = decodeRevertReason(errorData)

      return {
        success: false,
        returnData: errorData,
        gasUsed: gasEstimate,
        gasCost: calculateGasCost(gasEstimate, gasPrice, btcPrice),
        stateChanges: [],
        events: [],
        traces: [],
        error: {
          message: err.shortMessage || err.message || "Simulation failed",
          reason,
          data: errorData,
        },
        blockNumber: block.number,
        timestamp: startTime,
      }
    }

    // Decode return value - convert to string to avoid React rendering issues
    let decodedReturn: string | null = null
    try {
      const funcAbi = request.abi.find(
        (item: any) => item.type === "function" && item.name === request.functionName
      )
      if (funcAbi && funcAbi.outputs && funcAbi.outputs.length > 0 && returnData && returnData !== "0x") {
        const rawDecoded = decodeFunctionResult({
          abi: request.abi,
          functionName: request.functionName,
          data: returnData as `0x${string}`,
        })
        // Convert to string to avoid React rendering issues
        decodedReturn = formatValue(rawDecoded)
      }
    } catch (e) {
      // Decoding failed, continue with raw data
    }

    // Note: Full state diff and event tracing requires debug_traceCall
    // which may not be available on all RPC endpoints.
    // For now, we provide estimated state changes based on function type.
    const stateChanges = estimateStateChanges(request.functionName, request.args, request.abi)

    // Calculate gas cost
    const gasCost = calculateGasCost(gasEstimate, gasPrice, btcPrice)

    return {
      success: true,
      returnData: returnData || "0x",
      decodedReturn,
      gasUsed: gasEstimate,
      gasCost,
      stateChanges,
      events: [], // Would need trace to get logs
      traces: [
        {
          type: "CALL",
          from: request.from || "0x0000000000000000000000000000000000000000",
          to: request.contractAddress,
          value: request.value?.toString() || "0",
          input: data,
          output: returnData || "0x",
          gasUsed: gasEstimate,
        },
      ],
      blockNumber: block.number,
      timestamp: startTime,
    }
  } catch (err: any) {
    return {
      success: false,
      returnData: "0x",
      gasUsed: BigInt(0),
      gasCost: {
        sats: BigInt(0),
        btc: "0",
        usd: "$0.00",
      },
      stateChanges: [],
      events: [],
      traces: [],
      error: {
        message: err.message || "Unknown simulation error",
      },
      blockNumber: BigInt(0),
      timestamp: startTime,
    }
  }
}

/**
 * Calculate gas cost in sats, BTC, and USD
 */
function calculateGasCost(
  gasUnits: bigint,
  gasPrice: bigint,
  btcPrice: number
): { sats: bigint; btc: string; usd: string } {
  // Gas cost in wei
  const totalWei = gasUnits * gasPrice

  // Convert to sats (1 BTC = 10^18 wei on Mezo, 1 BTC = 10^8 sats)
  const sats = totalWei / BigInt(10 ** 10)

  // Convert to BTC
  const btcAmount = Number(sats) / 100_000_000
  const btcFormatted = btcAmount < 0.00001
    ? btcAmount.toExponential(2)
    : btcAmount.toFixed(8)

  // Convert to USD
  const usdAmount = btcAmount * btcPrice
  const usdFormatted = usdAmount < 0.01
    ? `$${usdAmount.toFixed(4)}`
    : `$${usdAmount.toFixed(2)}`

  return {
    sats,
    btc: btcFormatted,
    usd: usdFormatted,
  }
}

/**
 * Estimate state changes based on function signature
 * This is an approximation - real state changes require trace
 */
function estimateStateChanges(
  functionName: string,
  args: any[],
  abi: any[]
): SimulationStateChange[] {
  const changes: SimulationStateChange[] = []

  // Find function in ABI
  const func = abi.find(
    (item: any) => item.type === "function" && item.name === functionName
  )

  if (!func || func.stateMutability === "view" || func.stateMutability === "pure") {
    return changes
  }

  // Common patterns
  const lowerName = functionName.toLowerCase()

  if (lowerName.includes("transfer")) {
    changes.push({
      slot: "balances",
      key: args[0]?.toString(),
      oldValue: "...",
      newValue: `+${args[1]?.toString() || "amount"}`,
      decoded: {
        type: "uint256",
        label: "Recipient Balance",
        oldDecoded: "Previous balance",
        newDecoded: `Previous + ${formatValue(args[1])}`,
      },
    })
    changes.push({
      slot: "balances",
      key: "sender",
      oldValue: "...",
      newValue: `-${args[1]?.toString() || "amount"}`,
      decoded: {
        type: "uint256",
        label: "Sender Balance",
        oldDecoded: "Previous balance",
        newDecoded: `Previous - ${formatValue(args[1])}`,
      },
    })
  }

  if (lowerName.includes("approve")) {
    changes.push({
      slot: "allowances",
      key: `owner -> ${args[0]}`,
      oldValue: "...",
      newValue: args[1]?.toString() || "amount",
      decoded: {
        type: "uint256",
        label: "Allowance",
        oldDecoded: "Previous allowance",
        newDecoded: formatValue(args[1]),
      },
    })
  }

  if (lowerName.includes("mint")) {
    changes.push({
      slot: "totalSupply",
      oldValue: "...",
      newValue: `+${args[1]?.toString() || args[0]?.toString() || "amount"}`,
      decoded: {
        type: "uint256",
        label: "Total Supply",
        oldDecoded: "Previous supply",
        newDecoded: "Previous + minted amount",
      },
    })
  }

  if (lowerName.includes("burn")) {
    changes.push({
      slot: "totalSupply",
      oldValue: "...",
      newValue: `-${args[0]?.toString() || "amount"}`,
      decoded: {
        type: "uint256",
        label: "Total Supply",
        oldDecoded: "Previous supply",
        newDecoded: "Previous - burned amount",
      },
    })
  }

  if (lowerName.includes("set") || lowerName.includes("update")) {
    changes.push({
      slot: functionName.replace(/^set/i, "").replace(/^update/i, ""),
      oldValue: "...",
      newValue: args[0]?.toString() || "new value",
      decoded: {
        type: "mixed",
        label: functionName,
        oldDecoded: "Previous value",
        newDecoded: formatValue(args[0]),
      },
    })
  }

  // If no patterns matched but function is state-changing, add generic
  if (changes.length === 0 && func.stateMutability !== "view" && func.stateMutability !== "pure") {
    changes.push({
      slot: "contract state",
      oldValue: "...",
      newValue: "modified",
      decoded: {
        type: "unknown",
        label: `${functionName}() modifies state`,
        oldDecoded: "Unknown",
        newDecoded: "Unknown",
      },
    })
  }

  return changes
}

/**
 * Get human-readable function signature
 */
export function getFunctionSignature(abi: any[], functionName: string): string {
  const func = abi.find(
    (item: any) => item.type === "function" && item.name === functionName
  )

  if (!func) return functionName

  const inputs = func.inputs?.map((i: any) => `${i.type} ${i.name}`).join(", ") || ""
  const outputs = func.outputs?.map((o: any) => o.type).join(", ") || "void"

  return `${functionName}(${inputs}) → ${outputs}`
}
