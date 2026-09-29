import { CHAIN_IDS, MEZO_EXPLORERS, MEZO_RPC_URLS } from "@/lib/ide/mezo-network"
// IDE TypeScript Types

export interface StoredContract {
  id: string
  name: string
  content: string
  createdAt: number
  updatedAt: number
  projectId?: string
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface DeployedContract {
  id: string
  address: string
  name: string
  abi: any[]
  bytecode: string
  chainId: number
  deployedAt: number
  txHash: string
  constructorArgs?: any[]
}

export interface CompilationResult {
  success: boolean
  contracts?: CompiledContract[]
  errors?: CompilationError[]
  warnings?: CompilationWarning[]
  sources?: Record<string, { content: string }> // All resolved sources for verification
  mainFileName?: string // Source key of the file that was compiled
  compilerVersion?: string // Full solc version, e.g. v0.8.28+commit.7893614a
  compilerSettings?: CompilerSettings // Exact settings passed to solc
}

export interface CompilerSettings {
  optimizer: { enabled: boolean; runs: number }
  evmVersion?: string
}

export interface CompiledContract {
  name: string
  abi: any[]
  bytecode: string
  deployedBytecode: string
}

export interface CompilationError {
  severity: "error"
  message: string
  sourceLocation?: {
    file: string
    start: number
    end: number
  }
  formattedMessage?: string
}

export interface CompilationWarning {
  severity: "warning"
  message: string
  sourceLocation?: {
    file: string
    start: number
    end: number
  }
  formattedMessage?: string
}

export interface IDESettings {
  theme: "dark" | "light"
  fontSize: number
  tabSize: number
  autoSave: boolean
  autoCompile: boolean
  optimizerEnabled: boolean
  optimizerRuns: number
  solcVersion: string
}

export interface OpenFile {
  id: string
  name: string
  content: string
  isDirty: boolean
}

export interface ConsoleLog {
  id: string
  type: "info" | "success" | "warning" | "error"
  message: string
  timestamp: number
  details?: string
}

export type CompilerStatus = "idle" | "loading" | "resolving" | "compiling" | "success" | "error"

export type DeploymentStatus = "idle" | "estimating" | "confirming" | "deploying" | "success" | "error"

export interface NetworkConfig {
  name: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
}

// Derived from lib/ide/mezo-network.ts (Mezo's documented RPCs and explorers)
export const MEZO_NETWORKS: Record<string, NetworkConfig> = {
  testnet: {
    name: "Mezo Testnet",
    chainId: CHAIN_IDS.testnet,
    rpcUrl: MEZO_RPC_URLS.testnet[0],
    explorerUrl: MEZO_EXPLORERS.testnet.url,
  },
  mainnet: {
    name: "Mezo Mainnet",
    chainId: CHAIN_IDS.mainnet,
    rpcUrl: MEZO_RPC_URLS.mainnet[0],
    explorerUrl: MEZO_EXPLORERS.mainnet.url,
  },
}

export const DEFAULT_SETTINGS: IDESettings = {
  theme: "dark",
  fontSize: 14,
  tabSize: 4,
  autoSave: true,
  autoCompile: false,
  optimizerEnabled: true,
  optimizerRuns: 200,
  solcVersion: "0.8.28",
}

// Verification types
export type VerificationStatus =
  | "idle"
  | "indexing" // waiting for the explorer to index the new contract
  | "submitting"
  | "pending"
  | "verified"
  | "failed"

export interface VerificationResult {
  success: boolean
  status: VerificationStatus
  message?: string
  explorerUrl?: string
  guid?: string // Verification request ID from explorer
}

export interface VerificationRequest {
  contractAddress: string
  contractName: string
  sourceCode: string
  compilerVersion: string
  optimizationUsed: boolean
  runs: number
  constructorArguments?: string // ABI-encoded constructor args (without 0x prefix)
  chainId: number
  sources?: Record<string, { content: string }> // All resolved sources for Standard JSON
  mainFileName?: string // The main contract file name
  compilerSettings?: CompilerSettings // Exact settings used at compile time
}

// Transaction simulator types live in lib/ide/transaction-simulator.ts
