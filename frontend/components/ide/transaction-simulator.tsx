"use client"

import { useState, useMemo } from "react"
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
} from "lucide-react"
import { useTransactionSimulator } from "@/hooks/ide/use-transaction-simulator"
import { parseInputValue, getWriteFunctions, type AbiFunction } from "@/lib/ide/abi-utils"
import { formatValue, getFunctionSignature } from "@/lib/ide/transaction-simulator"
import type { DeployedContract, SimulationResult } from "@/types/ide"
import { MEZO_NETWORKS } from "@/types/ide"
import { ide, IdeButton, IdeModal, Notice, Section, StatusPill, toneText } from "./ui"

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

  return (
    <IdeModal open={open} onClose={onClose} title="Transaction Simulator" icon={<Zap />} width={768}>
      <div className="flex flex-col gap-4">
        {/* Contract Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative space-y-1.5">
            <span className={`${ide.label} block`}>Contract</span>
            <button
              onClick={() => setContractDropdownOpen(!contractDropdownOpen)}
              className={`${ide.input} flex items-center justify-between text-left cursor-pointer`}
            >
              <span className={contract ? "text-white" : "text-white/40"}>
                {contract ? contract.name : "Select a contract"}
              </span>
              <ChevronDown size={14} className="text-white/40" />
            </button>
            {contractDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-dark border border-white/10 shadow-xl z-10 max-h-48 overflow-y-auto">
                {filteredContracts.length === 0 ? (
                  <div className="px-3 py-2 text-white/40 text-sm">No contracts deployed</div>
                ) : (
                  filteredContracts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleContractChange(c.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span className="text-white">{c.name}</span>
                      <span className="text-white/40 text-xs font-mono">{c.address.slice(0, 8)}...</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative space-y-1.5">
            <span className={`${ide.label} block`}>Function</span>
            <button
              onClick={() => contract && setFunctionDropdownOpen(!functionDropdownOpen)}
              disabled={!contract}
              className={`${ide.input} flex items-center justify-between text-left cursor-pointer`}
            >
              <span className={selectedFunction ? "text-white" : "text-white/40"}>
                {selectedFunction || "Select function"}
              </span>
              <ChevronDown size={14} className="text-white/40" />
            </button>
            {functionDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-dark border border-white/10 shadow-xl z-10 max-h-48 overflow-y-auto">
                {writeFunctions.length === 0 ? (
                  <div className="px-3 py-2 text-white/40 text-sm">No write functions</div>
                ) : (
                  writeFunctions.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => handleFunctionChange(f.name)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span className="text-white">{f.name}</span>
                      <StatusPill tone="neutral">{f.stateMutability}</StatusPill>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Function Inputs */}
        {selectedFunc && selectedFunc.inputs.length > 0 && (
          <div className={`${ide.card} p-3`}>
            <Section title="Arguments">
              <div className="space-y-2">
                {selectedFunc.inputs.map((input) => (
                  <div key={input.name} className="flex items-center gap-2">
                    <div className="w-32 shrink-0">
                      <span className="text-white/80 text-xs">{input.name}</span>
                      <span className="text-white/40 text-xs ml-1 font-mono">({input.type})</span>
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
                      className={`${ide.inputMono} flex-1`}
                    />
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Advanced Options */}
        <div className="border border-white/10">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className={ide.label}>Advanced Options</span>
            <ChevronDown
              size={14}
              className={`text-white/40 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>
          {showAdvanced && (
            <div className="grid grid-cols-2 gap-4 p-3 border-t border-white/10 bg-white/5">
              <div className="space-y-1.5">
                <span className={`${ide.label} flex items-center gap-1.5`}>
                  Impersonate Address
                  <span className="text-white/40 cursor-help" title="Simulate as if this address is calling">?</span>
                </span>
                <input
                  type="text"
                  placeholder="0x... (optional)"
                  value={impersonateAddress}
                  onChange={(e) => setImpersonateAddress(e.target.value)}
                  className={ide.inputMono}
                />
              </div>
              <div className="space-y-1.5">
                <span className={`${ide.label} flex items-center gap-1.5`}>
                  Value (wei)
                  <span className="text-white/40 cursor-help" title="BTC value to send with the transaction">?</span>
                </span>
                <input
                  type="text"
                  placeholder="0"
                  value={sendValue}
                  onChange={(e) => setSendValue(e.target.value)}
                  className={ide.inputMono}
                />
              </div>
            </div>
          )}
        </div>

        {/* Simulate Button */}
        <IdeButton
          variant="primary"
          size="md"
          block
          onClick={handleSimulate}
          disabled={!contract || !selectedFunction || simulator.status === "simulating"}
          loading={simulator.status === "simulating"}
          icon={<Play size={16} />}
        >
          {simulator.status === "simulating" ? "Simulating..." : "Simulate Transaction"}
        </IdeButton>

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
            <Section
              title="Recent Simulations"
              action={
                <IdeButton variant="ghost" size="xs" icon={<Trash2 size={12} />} onClick={simulator.clearHistory}>
                  Clear
                </IdeButton>
              }
            >
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {simulator.history.slice(1).map((result, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 text-xs border border-white/10 bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle size={12} className={toneText.success} />
                      ) : (
                        <XCircle size={12} className={toneText.error} />
                      )}
                      <span className="text-white/60">{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <span className="text-white/40">
                      Gas: <span className="font-mono text-white">{String(result.gasUsed)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </IdeModal>
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
      className={`p-4 border ${result.success ? "border-green-500/20" : "border-red-500/20"} bg-white/5`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {result.success ? (
            <>
              <CheckCircle size={18} className={toneText.success} />
              <span className={`${toneText.success} font-medium`}>Simulation Succeeded</span>
            </>
          ) : (
            <>
              <XCircle size={18} className={toneText.error} />
              <span className={`${toneText.error} font-medium`}>Simulation Failed</span>
            </>
          )}
        </div>
        <span className="text-white/40 text-xs font-mono">Block #{String(result.blockNumber)}</span>
      </div>

      {/* Error Message */}
      {result.error && (
        <Notice
          tone="error"
          icon={<AlertTriangle size={14} />}
          title={result.error.message}
          className="mb-4"
        >
          {result.error.reason && <p>Reason: {result.error.reason}</p>}
        </Notice>
      )}

      {/* Gas Cost */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className={`${ide.card} p-3`}>
          <div className={`${ide.label} flex items-center gap-1.5 mb-1`}>
            <Fuel size={12} />
            <span>Gas Used</span>
          </div>
          <span className="text-white font-mono text-sm">{Number(result.gasUsed).toLocaleString()}</span>
        </div>
        <div className={`${ide.card} p-3`}>
          <div className={`${ide.label} flex items-center gap-1.5 mb-1`}>
            <Activity size={12} />
            <span>Cost (sats)</span>
          </div>
          <span className="text-primary font-mono text-sm">{Number(result.gasCost.sats).toLocaleString()}</span>
        </div>
        <div className={`${ide.card} p-3`}>
          <div className={`${ide.label} flex items-center gap-1.5 mb-1`}>
            <span className="text-[10px]">$</span>
            <span>Cost (USD)</span>
          </div>
          <span className="text-white font-mono text-sm">{result.gasCost.usd}</span>
        </div>
      </div>

      {/* Return Value */}
      {result.success && result.returnData !== "0x" && (
        <Section
          className="mb-4"
          title={
            <span className="flex items-center gap-1.5">
              <ArrowRight size={12} />
              Return Value
            </span>
          }
        >
          <div className={`${ide.codeBlock} break-all`}>
            {result.decodedReturn ? (
              <span className="text-primary">{result.decodedReturn}</span>
            ) : (
              <span className="text-white/60">{result.returnData}</span>
            )}
          </div>
        </Section>
      )}

      {/* State Changes */}
      {result.stateChanges.length > 0 && (
        <Section
          className="mb-4"
          title={
            <span className="flex items-center gap-1.5">
              <Database size={12} />
              State Changes
              <span className="text-white/40">({result.stateChanges.length})</span>
            </span>
          }
        >
          <div className="space-y-2">
            {result.stateChanges.map((change, i) => (
              <div key={i} className={`${ide.card} p-2 text-xs`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 font-medium">
                    {change.decoded?.label || change.slot}
                    {change.key && <span className="text-white/40 ml-1 font-mono">[{change.key}]</span>}
                  </span>
                  <span className="text-white/40 font-mono">{change.decoded?.type}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono break-all">
                  <span className="text-white/40 line-through">{change.oldValue}</span>
                  <ArrowRight size={10} className="text-white/40 shrink-0" />
                  <span className="text-primary">{change.newValue}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Events */}
      {result.events.length > 0 && (
        <Section
          className="mb-4"
          title={
            <span className="flex items-center gap-1.5">
              <FileText size={12} />
              Events Emitted
              <span className="text-white/40">({result.events.length})</span>
            </span>
          }
        >
          <div className="space-y-2">
            {result.events.map((event, i) => (
              <div key={i} className={`${ide.card} p-2 text-xs`}>
                <div className="text-primary font-medium mb-1">{event.name}</div>
                {Object.entries(event.args).length > 0 && (
                  <div className="text-white/60 font-mono">
                    {Object.entries(event.args).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-white/40">{key}:</span>
                        <span className="text-white/80 break-all">{formatValue(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Trace */}
      {result.traces.length > 0 && (
        <div className="mb-4 border border-white/10">
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className={`${ide.label} flex items-center gap-1.5`}>
              <Code size={12} />
              <span>Execution Trace</span>
            </div>
            <ChevronDown
              size={12}
              className={`text-white/40 transition-transform ${showTrace ? "rotate-180" : ""}`}
            />
          </button>
          {showTrace && (
            <div className="space-y-2 p-3 border-t border-white/10">
              {result.traces.map((trace, i) => (
                <div key={i} className={ide.codeBlock}>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusPill tone="primary">{trace.type}</StatusPill>
                    <span className="text-white/60">
                      Gas: <span className="text-white">{String(trace.gasUsed)}</span>
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
          className="inline-flex items-center justify-center h-8 px-3 text-xs gap-1.5 font-medium bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink size={12} />
          View Contract
        </a>
        <IdeButton
          variant="secondary"
          size="sm"
          onClick={() => copyToClipboard(JSON.stringify(result, null, 2), "result")}
          icon={
            copiedField === "result" ? (
              <CheckCircle size={12} className={toneText.success} />
            ) : (
              <Copy size={12} />
            )
          }
        >
          Copy Result
        </IdeButton>
      </div>
    </div>
  )
}
