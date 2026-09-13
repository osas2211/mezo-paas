import { AbiCoder, Interface } from "ethers"

export interface AbiInput {
  name: string
  type: string
  components?: AbiInput[]
  indexed?: boolean
}

export interface AbiFunction {
  name: string
  type: "function" | "constructor" | "event" | "fallback" | "receive"
  inputs: AbiInput[]
  outputs?: AbiInput[]
  stateMutability?: "pure" | "view" | "nonpayable" | "payable"
}

// Get constructor from ABI
export function getConstructor(abi: any[]): AbiFunction | undefined {
  return abi.find((item) => item.type === "constructor")
}

// Get all functions from ABI
export function getFunctions(abi: any[]): AbiFunction[] {
  return abi.filter((item) => item.type === "function")
}

// Get read-only functions (view/pure)
export function getReadFunctions(abi: any[]): AbiFunction[] {
  return getFunctions(abi).filter(
    (f) => f.stateMutability === "view" || f.stateMutability === "pure"
  )
}

// Get write functions (nonpayable/payable)
export function getWriteFunctions(abi: any[]): AbiFunction[] {
  return getFunctions(abi).filter(
    (f) => f.stateMutability === "nonpayable" || f.stateMutability === "payable"
  )
}

// Get events from ABI
export function getEvents(abi: any[]): AbiFunction[] {
  return abi.filter((item) => item.type === "event")
}

// Encode constructor arguments
export function encodeConstructorArgs(
  abi: any[],
  args: any[]
): string | null {
  const constructor = getConstructor(abi)
  if (!constructor || constructor.inputs.length === 0) {
    return null
  }

  const abiCoder = new AbiCoder()
  const types = constructor.inputs.map((input) => input.type)
  return abiCoder.encode(types, args)
}

// Encode function call data
export function encodeFunctionData(
  abi: any[],
  functionName: string,
  args: any[]
): string {
  const iface = new Interface(abi)
  return iface.encodeFunctionData(functionName, args)
}

// Decode function result
export function decodeFunctionResult(
  abi: any[],
  functionName: string,
  data: string
): any {
  const iface = new Interface(abi)
  return iface.decodeFunctionResult(functionName, data)
}

// Parse input value based on type
export function parseInputValue(type: string, value: string): any {
  // Remove whitespace
  value = value.trim()

  // Handle arrays
  if (type.endsWith("[]")) {
    try {
      const parsed = JSON.parse(value)
      const baseType = type.slice(0, -2)
      return Array.isArray(parsed)
        ? parsed.map((v) => parseInputValue(baseType, String(v)))
        : [parseInputValue(baseType, value)]
    } catch {
      // Try comma-separated values
      return value.split(",").map((v) => parseInputValue(type.slice(0, -2), v.trim()))
    }
  }

  // Handle tuples
  if (type.startsWith("tuple")) {
    try {
      return JSON.parse(value)
    } catch {
      throw new Error(`Invalid tuple value: ${value}`)
    }
  }

  // Handle basic types
  if (type === "bool") {
    return value.toLowerCase() === "true" || value === "1"
  }

  if (type === "address") {
    if (!value.startsWith("0x") || value.length !== 42) {
      throw new Error(`Invalid address: ${value}`)
    }
    return value
  }

  if (type.startsWith("bytes")) {
    if (!value.startsWith("0x")) {
      // Convert string to hex
      const hex = Buffer.from(value).toString("hex")
      return `0x${hex}`
    }
    return value
  }

  if (type.startsWith("uint") || type.startsWith("int")) {
    // Handle BigInt for large numbers
    return BigInt(value)
  }

  if (type === "string") {
    return value
  }

  return value
}

// Format output value for display
export function formatOutputValue(type: string, value: any): string {
  if (value === null || value === undefined) {
    return "null"
  }

  if (typeof value === "bigint") {
    return value.toString()
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value.map((v, i) => formatOutputValue("", v)), null, 2)
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}

// Get default value for input type
export function getDefaultValue(type: string): string {
  if (type.endsWith("[]")) return "[]"
  if (type === "bool") return "false"
  if (type === "address") return "0x0000000000000000000000000000000000000000"
  if (type.startsWith("bytes")) return "0x"
  if (type.startsWith("uint") || type.startsWith("int")) return "0"
  if (type === "string") return ""
  return ""
}
