"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Play, Eye, Edit3, ChevronDown, ExternalLink, Package } from "lucide-react"
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import type { DeployedContract } from "@/types/ide"
import { MEZO_NETWORKS } from "@/types/ide"
import {
  getReadFunctions,
  getWriteFunctions,
  parseInputValue,
  formatOutputValue,
  type AbiFunction,
} from "@/lib/ide/abi-utils"
import { ide, IdeButton, StatusPill, Notice, Section, Field, PanelHeader, EmptyState } from "./ui"

interface ContractInteractProps {
  deployedContracts: DeployedContract[]
  addLog: (type: "info" | "success" | "warning" | "error", message: string, details?: string) => void
  onCreateDApp?: (contract: DeployedContract) => void
}

export default function ContractInteract({
  deployedContracts,
  addLog,
  onCreateDApp,
}: ContractInteractProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const [selectedContract, setSelectedContract] = useState<DeployedContract | null>(null)
  const [customAddress, setCustomAddress] = useState("")
  const [functionInputs, setFunctionInputs] = useState<Record<string, Record<string, string>>>({})
  const [functionResults, setFunctionResults] = useState<Record<string, string>>({})
  const [loadingFunctions, setLoadingFunctions] = useState<Set<string>>(new Set())
  const [showReadFunctions, setShowReadFunctions] = useState(true)
  const [showWriteFunctions, setShowWriteFunctions] = useState(true)

  const { writeContractAsync } = useWriteContract()

  // Get read and write functions
  const readFunctions = selectedContract ? getReadFunctions(selectedContract.abi) : []
  const writeFunctions = selectedContract ? getWriteFunctions(selectedContract.abi) : []

  // Filter contracts by current chain
  const chainContracts = deployedContracts.filter((c) => c.chainId === chainId)

  const handleReadFunction = async (func: AbiFunction) => {
    if (!selectedContract) return

    const funcKey = func.name
    setLoadingFunctions((prev) => new Set(prev).add(funcKey))

    try {
      // Parse arguments
      const args = func.inputs.map((input) => {
        const value = functionInputs[funcKey]?.[input.name] || ""
        return parseInputValue(input.type, value)
      })

      // Read from the network the contract was deployed to (not the wallet's current chain)
      const { createPublicClient } = await import("viem")
      const { mezoChains, mezoTransport, networkForChainId } = await import("@/lib/ide/mezo-network")
      const network = networkForChainId(selectedContract.chainId) ?? "testnet"

      const publicClient = createPublicClient({
        chain: mezoChains[network],
        transport: mezoTransport(network),
      })

      const result = await publicClient.readContract({
        address: selectedContract.address as `0x${string}`,
        abi: selectedContract.abi,
        functionName: func.name,
        args,
      })

      const formattedResult = formatOutputValue(
        func.outputs?.[0]?.type || "",
        result
      )
      setFunctionResults((prev) => ({
        ...prev,
        [funcKey]: formattedResult,
      }))
      addLog("success", `${func.name}() returned: ${formattedResult}`)
    } catch (err: any) {
      console.error("Read error:", err)
      setFunctionResults((prev) => ({
        ...prev,
        [funcKey]: `Error: ${err.shortMessage || err.message}`,
      }))
      addLog("error", `${func.name}() failed: ${err.shortMessage || err.message}`)
    } finally {
      setLoadingFunctions((prev) => {
        const next = new Set(prev)
        next.delete(funcKey)
        return next
      })
    }
  }

  const handleWriteFunction = async (func: AbiFunction) => {
    if (!selectedContract || !isConnected) return

    const funcKey = func.name
    setLoadingFunctions((prev) => new Set(prev).add(funcKey))

    try {
      // Parse arguments
      const args = func.inputs.map((input) => {
        const value = functionInputs[funcKey]?.[input.name] || ""
        return parseInputValue(input.type, value)
      })

      addLog("info", `Calling ${func.name}()...`)

      const hash = await writeContractAsync({
        address: selectedContract.address as `0x${string}`,
        abi: selectedContract.abi,
        functionName: func.name,
        args,
      })

      setFunctionResults((prev) => ({
        ...prev,
        [funcKey]: `Tx: ${hash}`,
      }))
      addLog("success", `${func.name}() submitted`, `Transaction: ${hash}`)
    } catch (err: any) {
      console.error("Write error:", err)
      setFunctionResults((prev) => ({
        ...prev,
        [funcKey]: `Error: ${err.shortMessage || err.message}`,
      }))
      addLog("error", `${func.name}() failed: ${err.shortMessage || err.message}`)
    } finally {
      setLoadingFunctions((prev) => {
        const next = new Set(prev)
        next.delete(funcKey)
        return next
      })
    }
  }

  const updateFunctionInput = (funcName: string, inputName: string, value: string) => {
    setFunctionInputs((prev) => ({
      ...prev,
      [funcName]: {
        ...prev[funcName],
        [inputName]: value,
      },
    }))
  }

  const renderFunctionCard = (func: AbiFunction, isWrite: boolean) => {
    const funcKey = func.name
    const isLoading = loadingFunctions.has(funcKey)
    const result = functionResults[funcKey]
    const tone = !isWrite ? "neutral" : func.stateMutability === "payable" ? "warning" : "primary"

    return (
      <div key={func.name} className={`${ide.card} p-3 space-y-3`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isWrite ? (
              <Edit3 size={12} className="text-primary shrink-0" />
            ) : (
              <Eye size={12} className="text-white/40 shrink-0" />
            )}
            <span className="text-white text-sm font-medium truncate">{func.name}</span>
          </div>
          <StatusPill tone={tone}>{func.stateMutability}</StatusPill>
        </div>

        {/* Inputs */}
        {func.inputs.length > 0 && (
          <div className="space-y-2.5">
            {func.inputs.map((input) => (
              <Field
                key={input.name}
                label={
                  <>
                    <span>{input.name}</span>
                    <span className="normal-case tracking-normal font-mono text-white/30">({input.type})</span>
                  </>
                }
              >
                <input
                  type="text"
                  placeholder={input.type}
                  value={functionInputs[funcKey]?.[input.name] || ""}
                  onChange={(e) =>
                    updateFunctionInput(funcKey, input.name, e.target.value)
                  }
                  className={ide.inputMono}
                />
              </Field>
            ))}
          </div>
        )}

        {/* Call Button */}
        <IdeButton
          variant={isWrite ? "primary" : "secondary"}
          size="xs"
          block
          loading={isLoading}
          icon={<Play size={10} />}
          onClick={() =>
            isWrite ? handleWriteFunction(func) : handleReadFunction(func)
          }
          disabled={isLoading || (isWrite && !isConnected)}
        >
          {!isLoading && <span>{isWrite ? "Write" : "Read"}</span>}
        </IdeButton>

        {/* Result */}
        {result && (
          <div className={`${ide.codeBlock} break-all`}>
            <span className="text-white/40">Result: </span>
            <span className={result.startsWith("Error") ? "text-red-500" : "text-white/80"}>
              {result}
            </span>
          </div>
        )}
      </div>
    )
  }

  const renderGroupToggle = (
    icon: ReactNode,
    label: string,
    isOpen: boolean,
    onToggle: () => void
  ) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 h-9 hover:bg-white/5 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-white/80 text-xs font-medium">{label}</span>
      </div>
      <ChevronDown
        size={14}
        className={`text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  )

  return (
    <div className="h-full overflow-y-auto">
      <PanelHeader title="Interact" className="sticky top-0 z-10 bg-dark" />

      <div className="p-4 space-y-5">
        {/* Contract Selection */}
        <Section title="Select Contract">
          {chainContracts.length > 0 ? (
            <div className="space-y-2">
              {chainContracts.map((contract) => {
                const isSelected = selectedContract?.id === contract.id
                return (
                  <div
                    key={contract.id}
                    className={`p-2.5 text-xs ${
                      isSelected
                        ? "border border-primary/40 bg-primary/10 transition-colors"
                        : ide.row
                    }`}
                  >
                    <button
                      onClick={() => setSelectedContract(contract)}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className={`font-medium ${isSelected ? "text-primary" : "text-white"}`}>
                        {contract.name}
                      </div>
                      <div className="text-white/40 font-mono truncate mt-0.5">{contract.address}</div>
                    </button>
                    {isSelected && onCreateDApp && (
                      <IdeButton
                        variant="outline"
                        size="xs"
                        block
                        icon={<Package size={12} />}
                        onClick={(e) => {
                          e.stopPropagation()
                          onCreateDApp(contract)
                        }}
                        className="mt-2.5"
                      >
                        <span>Create dApp</span>
                      </IdeButton>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Package size={24} />}
              title="No deployed contracts on this chain"
              className={`${ide.card} py-6`}
            />
          )}
        </Section>

        {/* Custom Address */}
        <Field label="Or enter address">
          <input
            type="text"
            placeholder="0x..."
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            className={ide.inputMono}
          />
        </Field>

        {/* Functions */}
        {selectedContract && (
          <>
            {/* Read Functions */}
            {readFunctions.length > 0 && (
              <div className="border border-white/10">
                {renderGroupToggle(
                  <Eye size={14} className="text-white/40" />,
                  `Read Functions (${readFunctions.length})`,
                  showReadFunctions,
                  () => setShowReadFunctions(!showReadFunctions)
                )}
                {showReadFunctions && (
                  <div className="p-3 border-t border-white/10 space-y-2">
                    {readFunctions.map((func) => renderFunctionCard(func, false))}
                  </div>
                )}
              </div>
            )}

            {/* Write Functions */}
            {writeFunctions.length > 0 && (
              <div className="border border-white/10">
                {renderGroupToggle(
                  <Edit3 size={14} className="text-primary" />,
                  `Write Functions (${writeFunctions.length})`,
                  showWriteFunctions,
                  () => setShowWriteFunctions(!showWriteFunctions)
                )}
                {showWriteFunctions && (
                  <div className="p-3 border-t border-white/10 space-y-2">
                    {!isConnected && (
                      <Notice tone="warning">
                        Connect wallet to call write functions
                      </Notice>
                    )}
                    {writeFunctions.map((func) => renderFunctionCard(func, true))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!selectedContract && (
          <p className="text-center py-8 text-white/40 text-xs">
            Select a deployed contract or enter an address to interact
          </p>
        )}
      </div>
    </div>
  )
}
