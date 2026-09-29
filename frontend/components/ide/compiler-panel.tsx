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
  Settings,
} from "lucide-react"
import type { CompilationResult, CompiledContract, CompilerStatus } from "@/types/ide"
import {
  ide,
  IdeButton,
  Notice,
  Section,
  PanelHeader,
  EmptyState,
  Spinner,
  toneText,
} from "./ui"

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
        return <Spinner size={14} />
      case "success":
        return <CheckCircle size={14} className={toneText.success} />
      case "error":
        return <AlertCircle size={14} className={toneText.error} />
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <PanelHeader title="Compiler" actions={getStatusIcon()} />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Compile Button */}
        <IdeButton
          variant="primary"
          size="md"
          block
          onClick={onCompile}
          loading={isCompiling}
          icon={<Play size={14} />}
        >
          <span>{isCompiling ? getButtonText() : "Compile"}</span>
        </IdeButton>

        {/* Optimizer Settings */}
        <div className={ide.card}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.07] transition-colors cursor-pointer"
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
            <div className="p-3 space-y-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">Enable Optimizer</span>
                <button
                  onClick={() => onOptimizerChange(!optimizerEnabled, optimizerRuns)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    optimizerEnabled ? "bg-primary" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                      optimizerEnabled ? "left-5 bg-black" : "left-0.5 bg-white"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/60 text-xs">Runs</span>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={optimizerRuns}
                  onChange={(e) => onOptimizerChange(optimizerEnabled, parseInt(e.target.value) || 200)}
                  disabled={!optimizerEnabled}
                  className={`${ide.inputMono} !w-24 !py-1 text-right`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Errors */}
        {result?.errors && result.errors.length > 0 && (
          <Section
            title={
              <span className={`flex items-center gap-1.5 ${toneText.error}`}>
                <AlertCircle size={12} />
                Errors ({result.errors.length})
              </span>
            }
          >
            <div className="space-y-2">
              {result.errors.map((error, i) => (
                <Notice key={i} tone="error">
                  <div className="whitespace-pre-wrap font-mono break-words">
                    {error.formattedMessage || error.message}
                  </div>
                </Notice>
              ))}
            </div>
          </Section>
        )}

        {/* Warnings */}
        {result?.warnings && result.warnings.length > 0 && (
          <Section
            title={
              <span className={`flex items-center gap-1.5 ${toneText.warning}`}>
                <AlertTriangle size={12} />
                Warnings ({result.warnings.length})
              </span>
            }
          >
            <div className="space-y-2">
              {result.warnings.map((warning, i) => (
                <Notice key={i} tone="warning">
                  <div className="whitespace-pre-wrap font-mono break-words">
                    {warning.formattedMessage || warning.message}
                  </div>
                </Notice>
              ))}
            </div>
          </Section>
        )}

        {/* Compiled Contracts */}
        {result?.contracts && result.contracts.length > 0 && (
          <Section
            title={
              <span className={`flex items-center gap-1.5 ${toneText.success}`}>
                <CheckCircle size={12} />
                Compiled ({result.contracts.length})
              </span>
            }
          >
            <div className="space-y-2">
              {result.contracts.map((contract) => (
                <button
                  key={contract.name}
                  onClick={() => onSelectContract(contract)}
                  className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                    selectedContract?.name === contract.name
                      ? "border border-primary/40 bg-primary/10 text-primary"
                      : `${ide.row} text-white`
                  }`}
                >
                  {contract.name}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Selected Contract Details */}
        {selectedContract && (
          <div className="space-y-5 pt-5 border-t border-white/10">
            {/* ABI */}
            <Section
              title="ABI"
              action={
                <IdeButton
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(selectedContract.abi, null, 2), "abi")
                  }
                  icon={copiedAbi ? <Check size={12} className={toneText.success} /> : <Copy size={12} />}
                >
                  {copiedAbi ? "Copied!" : "Copy"}
                </IdeButton>
              }
            >
              <div className={`${ide.codeBlock} text-white/60`}>
                {selectedContract.abi.length} functions
              </div>
            </Section>

            {/* Bytecode */}
            <Section
              title="Bytecode"
              action={
                <IdeButton
                  variant="ghost"
                  size="xs"
                  onClick={() => copyToClipboard(selectedContract.bytecode, "bytecode")}
                  icon={
                    copiedBytecode ? <Check size={12} className={toneText.success} /> : <Copy size={12} />
                  }
                >
                  {copiedBytecode ? "Copied!" : "Copy"}
                </IdeButton>
              }
            >
              <div className={`${ide.codeBlock} text-white/60 break-all max-h-16`}>
                {selectedContract.bytecode.slice(0, 100)}...
              </div>
            </Section>
          </div>
        )}

        {/* Empty State */}
        {!result && status === "idle" && (
          <EmptyState icon={<Play size={24} />} title='Click "Compile" to compile your contract' />
        )}
      </div>
    </div>
  )
}
