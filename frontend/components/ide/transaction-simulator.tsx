"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Zap,
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Fuel,
  ArrowRight,
  ChevronDown,
  Clock,
  Code,
  FileText,
  RefreshCw,
  Trash2,
  Copy,
  ExternalLink,
  Database,
  Activity,
  X,
  Loader2,
} from "lucide-react"
import { useTransactionSimulator } from "@/hooks/ide/use-transaction-simulator"
import { parseInputValue, getWriteFunctions, type AbiFunction } from "@/lib/ide/abi-utils"
import { formatValue, getFunctionSignature } from "@/lib/ide/transaction-simulator"
import type { DeployedContract, SimulationResult } from "@/types/ide"
import { MEZO_NETWORKS } from "@/types/ide"

interface TransactionSimulatorProps {
  open: boolean
  onClose: () => void
  deployedContracts: DeployedContract[]
  selectedContract?: DeployedContract | null
  addLog: (type: "info" | "success" | "warning" | "error", message: string, details?: string) => void
  chainId: number
}

export default function TransactionSimulator({
  open,
  onClose,
  deployedContracts,
  selectedContract: initialContract,
  addLog,
  chainId,
}: TransactionSimulatorProps) {
  const simulator = useTransactionSimulator()

  const [contract, setContract] = useState<DeployedContract | null>(initialContract || null)
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null)
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({})
  const [impersonateAddress, setImpersonateAddress] = useState("")
  const [sendValue, setSendValue] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [contractDropdownOpen, setContractDropdownOpen] = useState(false)
  const [functionDropdownOpen, setFunctionDropdownOpen] = useState(false)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onClose])

  // Get write functions from selected contract
  const writeFunctions = useMemo(() => {
    if (!contract) return []
    return getWriteFunctions(contract.abi)
  }, [contract])

  const selectedFunc = useMemo(() => {
    if (!selectedFunction || !writeFunctions.length) return null
    return writeFunctions.find((f) => f.name === selectedFunction) || null
  }, [selectedFunction, writeFunctions])

  const filteredContracts = deployedContracts.filter((c) => c.chainId === chainId)

  const handleContractChange = (contractId: string) => {
    const newContract = deployedContracts.find((c) => c.id === contractId) || null
    setContract(newContract)
    setSelectedFunction(null)
    setFunctionInputs({})
    simulator.reset()
    setContractDropdownOpen(false)
  }

  const handleFunctionChange = (funcName: string) => {
    setSelectedFunction(funcName)
    setFunctionInputs({})
    simulator.reset()
    setFunctionDropdownOpen(false)
  }

  const handleSimulate = async () => {
    if (!contract || !selectedFunc) return

    try {
      // Parse arguments
      const args = selectedFunc.inputs.map((input) => {
        const value = functionInputs[input.name] || ""
        return parseInputValue(input.type, value)
      })

      addLog("info", `Simulating ${selectedFunc.name}()...`)

      const result = await simulator.simulate({
        contractAddress: contract.address,
        abi: contract.abi,
        functionName: selectedFunc.name,
        args,
        from: impersonateAddress || undefined,
        value: sendValue ? BigInt(sendValue) : undefined,
      })

      if (result?.success) {
        addLog("success", `Simulation succeeded: ${selectedFunc.name}()`, `Gas: ${result.gasUsed.toString()}`)
      } else if (result?.error) {
        addLog("error", `Simulation failed: ${result.error.reason || result.error.message}`)
      }
    } catch (err: any) {
      addLog("error", `Simulation error: ${err.message}`)
    }
  }

  const network = chainId === 31611 ? "testnet" : "mainnet"
  const explorerUrl = MEZO_NETWORKS[network].explorerUrl

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl mx-4 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            <h2 className="text-white text-base font-medium">Transaction Simulator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {/* Contract Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-white/60 text-xs mb-1.5 block">Contract</label>
                <button
                  onClick={() => setContractDropdownOpen(!contractDropdownOpen)}
                  className="w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-left text-sm hover:border-white/20 transition-colors"
                >
                  <span className={contract ? "text-white" : "text-white/40"}>
                    {contract ? contract.name : "Select a contract"}
                  </span>
                  <ChevronDown size={14} className="text-white/40" />
                </button>
                {contractDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-white/10 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {filteredContracts.length === 0 ? (
                      <div className="px-3 py-2 text-white/40 text-sm">No contracts deployed</div>
                    ) : (
                      filteredContracts.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleContractChange(c.id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                        >
                          <span className="text-white">{c.name}</span>
                          <span className="text-white/40 text-xs font-mono">
                            {c.address.slice(0, 8)}...
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-white/60 text-xs mb-1.5 block">Function</label>
                <button
                  onClick={() => contract && setFunctionDropdownOpen(!functionDropdownOpen)}
                  disabled={!contract}
                  className="w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-left text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className={selectedFunction ? "text-white" : "text-white/40"}>
                    {selectedFunction || "Select function"}
                  </span>
                  <ChevronDown size={14} className="text-white/40" />
                </button>
                {functionDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-white/10 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {writeFunctions.length === 0 ? (
                      <div className="px-3 py-2 text-white/40 text-sm">No write functions</div>
                    ) : (
                      writeFunctions.map((f) => (
                        <button
                          key={f.name}
                          onClick={() => handleFunctionChange(f.name)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                        >
                          <span className="text-white">{f.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                            {f.stateMutability}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Function Inputs */}
            {selectedFunc && selectedFunc.inputs.length > 0 && (
              <div className="p-3 bg-[#111] border border-white/10 rounded-lg">
                <label className="text-white/60 text-xs mb-2 block">Arguments</label>
                <div className="space-y-2">
                  {selectedFunc.inputs.map((input) => (
                    <div key={input.name} className="flex items-center gap-2">
                      <div className="w-32 flex-shrink-0">
                        <span className="text-white/80 text-xs">{input.name}</span>
                        <span className="text-white/40 text-xs ml-1">({input.type})</span>
                      </div>
                      <input
                        type="text"
                        placeholder={input.type}
                        value={functionInputs[input.name] || ""}
                        onChange={(e) =>
                          setFunctionInputs((prev) => ({
                            ...prev,
                            [input.name]: e.target.value,
                          }))
                        }
                        className="flex-1 bg-[#0a0a0a] border border-white/10 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Options */}
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
              >
                <span className="text-white/60 text-xs">Advanced Options</span>
                <ChevronDown
                  size={14}
                  className={`text-white/40 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 p-3 border-t border-white/10 bg-[#111]">
                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block">
                      Impersonate Address
                      <span className="text-white/40 ml-1 cursor-help" title="Simulate as if this address is calling">?</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0x... (optional)"
                      value={impersonateAddress}
                      onChange={(e) => setImpersonateAddress(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block">
                      Value (wei)
                      <span className="text-white/40 ml-1 cursor-help" title="BTC value to send with the transaction">?</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0"
                      value={sendValue}
                      onChange={(e) => setSendValue(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/30"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Simulate Button */}
            <button
              onClick={handleSimulate}
              disabled={!contract || !selectedFunction || simulator.status === "simulating"}
              className="w-full flex items-center justify-center gap-2 bg-primary text-dark py-2.5 px-4 text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {simulator.status === "simulating" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Simulate Transaction</span>
                </>
              )}
            </button>

            {/* Result */}
            {simulator.result && (
              <SimulationResultPanel
                result={simulator.result}
                contractAddress={contract?.address || ""}
                functionName={selectedFunction || ""}
                explorerUrl={explorerUrl}
              />
            )}

            {/* History */}
            {simulator.history.length > 1 && (
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-xs">Recent Simulations</span>
                  <button
                    onClick={simulator.clearHistory}
                    className="text-white/40 hover:text-white/60 text-xs flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {simulator.history.slice(1).map((result, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2 rounded text-xs ${
                        result.success ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle size={12} className="text-green-400" />
                        ) : (
                          <XCircle size={12} className="text-red-400" />
                        )}
                        <span className="text-white/60">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="text-white/40">
                        Gas: {String(result.gasUsed)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simulation Result Panel Component
function SimulationResultPanel({
  result,
  contractAddress,
  functionName,
  explorerUrl,
}: {
  result: SimulationResult
  contractAddress: string
  functionName: string
  explorerUrl: string
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showTrace, setShowTrace] = useState(false)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div
      className={`p-4 rounded-lg border ${
        result.success
          ? "bg-green-500/10 border-green-500/30"
          : "bg-red-500/10 border-red-500/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {result.success ? (
            <>
              <CheckCircle size={18} className="text-green-400" />
              <span className="text-green-400 font-medium">Simulation Succeeded</span>
            </>
          ) : (
            <>
              <XCircle size={18} className="text-red-400" />
              <span className="text-red-400 font-medium">Simulation Failed</span>
            </>
          )}
        </div>
        <span className="text-white/40 text-xs">
          Block #{String(result.blockNumber)}
        </span>
      </div>

      {/* Error Message */}
      {result.error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm font-medium">{result.error.message}</p>
              {result.error.reason && (
                <p className="text-red-300/80 text-xs mt-1">
                  Reason: {result.error.reason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gas Cost */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-black/30 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
            <Fuel size={12} />
            <span>Gas Used</span>
          </div>
          <span className="text-white font-mono text-sm">
            {Number(result.gasUsed).toLocaleString()}
          </span>
        </div>
        <div className="p-3 bg-black/30 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
            <Activity size={12} />
            <span>Cost (sats)</span>
          </div>
          <span className="text-primary font-mono text-sm">
            {Number(result.gasCost.sats).toLocaleString()}
          </span>
        </div>
        <div className="p-3 bg-black/30 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
            <span className="text-[10px]">$</span>
            <span>Cost (USD)</span>
          </div>
          <span className="text-white font-mono text-sm">{result.gasCost.usd}</span>
        </div>
      </div>

      {/* Return Value */}
      {result.success && result.returnData !== "0x" && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-white/60 text-xs mb-2">
            <ArrowRight size={12} />
            <span>Return Value</span>
          </div>
          <div className="p-2 bg-black/30 rounded-lg font-mono text-xs break-all border border-white/5">
            {result.decodedReturn ? (
              <span className="text-primary">{result.decodedReturn}</span>
            ) : (
              <span className="text-white/60">{result.returnData}</span>
            )}
          </div>
        </div>
      )}

      {/* State Changes */}
      {result.stateChanges.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-white/60 text-xs mb-2">
            <Database size={12} />
            <span>State Changes</span>
            <span className="text-white/40">({result.stateChanges.length})</span>
          </div>
          <div className="space-y-2">
            {result.stateChanges.map((change, i) => (
              <div key={i} className="p-2 bg-black/30 rounded-lg text-xs border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 font-medium">
                    {change.decoded?.label || change.slot}
                    {change.key && (
                      <span className="text-white/40 ml-1">[{change.key}]</span>
                    )}
                  </span>
                  <span className="text-white/40">{change.decoded?.type}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-red-400/80">{change.oldValue}</span>
                  <ArrowRight size={10} className="text-white/40" />
                  <span className="text-green-400">{change.newValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events */}
      {result.events.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-white/60 text-xs mb-2">
            <FileText size={12} />
            <span>Events Emitted</span>
            <span className="text-white/40">({result.events.length})</span>
          </div>
          <div className="space-y-2">
            {result.events.map((event, i) => (
              <div key={i} className="p-2 bg-black/30 rounded-lg text-xs border border-white/5">
                <div className="text-primary font-medium mb-1">{event.name}</div>
                {Object.entries(event.args).length > 0 && (
                  <div className="text-white/60 font-mono">
                    {Object.entries(event.args).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-white/40">{key}:</span>
                        <span className="text-white/80">{formatValue(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trace */}
      {result.traces.length > 0 && (
        <div className="mb-4 border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <Code size={12} />
              <span>Execution Trace</span>
            </div>
            <ChevronDown
              size={12}
              className={`text-white/40 transition-transform ${showTrace ? "rotate-180" : ""}`}
            />
          </button>
          {showTrace && (
            <div className="space-y-2 p-3 border-t border-white/10 bg-[#111]">
              {result.traces.map((trace, i) => (
                <div key={i} className="p-2 bg-black/30 rounded-lg text-xs font-mono border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      {trace.type}
                    </span>
                    <span className="text-white/60">
                      Gas: {String(trace.gasUsed)}
                    </span>
                  </div>
                  <div className="text-white/40 truncate">
                    {trace.from.slice(0, 10)}... → {trace.to.slice(0, 10)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-white/10">
        <a
          href={`${explorerUrl}/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/80 text-xs rounded-lg hover:bg-white/20 transition-colors"
        >
          <ExternalLink size={12} />
          View Contract
        </a>
        <button
          onClick={() => copyToClipboard(JSON.stringify(result, null, 2), "result")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/80 text-xs rounded-lg hover:bg-white/20 transition-colors"
        >
          {copiedField === "result" ? (
            <CheckCircle size={12} className="text-green-400" />
          ) : (
            <Copy size={12} />
          )}
          Copy Result
        </button>
      </div>
    </div>
  )
}
