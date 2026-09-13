"use client"

import { useState } from "react"
import {
  Play,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Copy,
  Check,
  Loader2,
  Settings,
} from "lucide-react"
import type { CompilationResult, CompiledContract, CompilerStatus } from "@/types/ide"

interface CompilerPanelProps {
  status: CompilerStatus
  result: CompilationResult | null
  selectedContract: CompiledContract | null
  onCompile: () => void
  onSelectContract: (contract: CompiledContract) => void
  optimizerEnabled: boolean
  optimizerRuns: number
  onOptimizerChange: (enabled: boolean, runs: number) => void
}

export default function CompilerPanel({
  status,
  result,
  selectedContract,
  onCompile,
  onSelectContract,
  optimizerEnabled,
  optimizerRuns,
  onOptimizerChange,
}: CompilerPanelProps) {
  const [copiedAbi, setCopiedAbi] = useState(false)
  const [copiedBytecode, setCopiedBytecode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const copyToClipboard = async (text: string, type: "abi" | "bytecode") => {
    await navigator.clipboard.writeText(text)
    if (type === "abi") {
      setCopiedAbi(true)
      setTimeout(() => setCopiedAbi(false), 2000)
    } else {
      setCopiedBytecode(true)
      setTimeout(() => setCopiedBytecode(false), 2000)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "compiling":
      case "loading":
      case "resolving":
        return <Loader2 size={14} className="text-primary animate-spin" />
      case "success":
        return <CheckCircle size={14} className="text-green-500" />
      case "error":
        return <AlertCircle size={14} className="text-red-500" />
      default:
        return null
    }
  }

  const getButtonText = () => {
    switch (status) {
      case "resolving":
        return "Resolving imports..."
      case "loading":
        return "Loading compiler..."
      case "compiling":
        return "Compiling..."
      default:
        return "Compile"
    }
  }

  const isCompiling = status === "compiling" || status === "loading" || status === "resolving"

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-white/80 text-sm font-medium">Compiler</span>
        {getStatusIcon()}
      </div>

      {/* Compile Button */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={onCompile}
          disabled={isCompiling}
          className="w-full flex items-center justify-center gap-2 bg-primary text-dark py-2 px-4 text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCompiling ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>{getButtonText()}</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>Compile</span>
            </>
          )}
        </button>
      </div>

      {/* Optimizer Settings */}
      <div className="border-b border-white/10">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Settings size={12} className="text-white/40" />
            <span className="text-white/60 text-xs">Optimizer Settings</span>
          </div>
          <ChevronDown
            size={14}
            className={`text-white/40 transition-transform ${showSettings ? "rotate-180" : ""}`}
          />
        </button>
        {showSettings && (
          <div className="px-3 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Enable Optimizer</span>
              <button
                onClick={() => onOptimizerChange(!optimizerEnabled, optimizerRuns)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  optimizerEnabled ? "bg-primary" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    optimizerEnabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Runs</span>
              <input
                type="number"
                min={1}
                max={10000}
                value={optimizerRuns}
                onChange={(e) => onOptimizerChange(optimizerEnabled, parseInt(e.target.value) || 200)}
                disabled={!optimizerEnabled}
                className="w-20 bg-[#111] border border-white/10 rounded px-2 py-1 text-white text-xs text-right focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Compilation Results */}
      <div className="flex-1 overflow-auto">
        {/* Errors */}
        {result?.errors && result.errors.length > 0 && (
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-red-500" />
              <span className="text-red-400 text-xs font-medium">
                Errors ({result.errors.length})
              </span>
            </div>
            <div className="space-y-2">
              {result.errors.map((error, i) => (
                <div
                  key={i}
                  className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300 whitespace-pre-wrap font-mono"
                >
                  {error.formattedMessage || error.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {result?.warnings && result.warnings.length > 0 && (
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-yellow-500" />
              <span className="text-yellow-400 text-xs font-medium">
                Warnings ({result.warnings.length})
              </span>
            </div>
            <div className="space-y-2">
              {result.warnings.map((warning, i) => (
                <div
                  key={i}
                  className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-300 whitespace-pre-wrap font-mono"
                >
                  {warning.formattedMessage || warning.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compiled Contracts */}
        {result?.contracts && result.contracts.length > 0 && (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-green-400 text-xs font-medium">
                Compiled ({result.contracts.length})
              </span>
            </div>
            <div className="space-y-2">
              {result.contracts.map((contract) => (
                <button
                  key={contract.name}
                  onClick={() => onSelectContract(contract)}
                  className={`w-full p-2 text-left rounded-lg text-sm transition-colors ${
                    selectedContract?.name === contract.name
                      ? "bg-primary/20 border border-primary/50 text-primary"
                      : "bg-[#111] border border-white/10 text-white/80 hover:border-white/20"
                  }`}
                >
                  {contract.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Contract Details */}
        {selectedContract && (
          <div className="p-3 border-t border-white/10">
            <div className="space-y-3">
              {/* ABI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/60 text-xs">ABI</span>
                  <button
                    onClick={() =>
                      copyToClipboard(JSON.stringify(selectedContract.abi, null, 2), "abi")
                    }
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors"
                  >
                    {copiedAbi ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copiedAbi ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="p-2 bg-[#111] border border-white/10 rounded-lg text-xs text-white/60 font-mono">
                  {selectedContract.abi.length} functions
                </div>
              </div>

              {/* Bytecode */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/60 text-xs">Bytecode</span>
                  <button
                    onClick={() => copyToClipboard(selectedContract.bytecode, "bytecode")}
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors"
                  >
                    {copiedBytecode ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copiedBytecode ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="p-2 bg-[#111] border border-white/10 rounded-lg text-xs text-white/60 font-mono break-all max-h-16 overflow-auto">
                  {selectedContract.bytecode.slice(0, 100)}...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && status === "idle" && (
          <div className="p-6 text-center">
            <p className="text-white/40 text-xs">
              Click "Compile" to compile your contract
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
