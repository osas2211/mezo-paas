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

export const MEZO_NETWORKS: Record<string, NetworkConfig> = {
  testnet: {
    name: "Mezo Testnet",
    chainId: 31611,
    rpcUrl: "https://rpc.test.mezo.org",
    explorerUrl: "https://explorer.test.mezo.org",
  },
  mainnet: {
    name: "Mezo Mainnet",
    chainId: 31612,
    rpcUrl: "https://rpc.mezo.org",
    explorerUrl: "https://explorer.mezo.org",
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
  | "flattening"
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
}

// Transaction Simulator types
export interface SimulationStateChange {
  slot: string
  key?: string // For mappings
  oldValue: string
  newValue: string
  decoded?: {
    type: string
    label?: string
    oldDecoded: string
    newDecoded: string
  }
}

export interface SimulationEvent {
  name: string
  signature: string
  args: Record<string, any>
  topics: string[]
  data: string
}

export interface SimulationTrace {
  type: "CALL" | "STATICCALL" | "DELEGATECALL" | "CREATE" | "CREATE2"
  from: string
  to: string
  value: string
  input: string
  output?: string
  gasUsed: bigint
  error?: string
}

export interface SimulationResult {
  success: boolean
  returnData: string
  decodedReturn?: string | null
  gasUsed: bigint
  gasCost: {
    sats: bigint
    btc: string
    usd: string
  }
  stateChanges: SimulationStateChange[]
  events: SimulationEvent[]
  traces: SimulationTrace[]
  error?: {
    message: string
    reason?: string // Decoded revert reason
    data?: string
  }
  blockNumber: bigint
  timestamp: number
}

export interface SimulationRequest {
  contractAddress: string
  abi: any[]
  functionName: string
  args: any[]
  value?: bigint // ETH/BTC value to send
  from?: string // Caller address (can impersonate)
  chainId: number
}

export type SimulationStatus = "idle" | "simulating" | "success" | "failed"
