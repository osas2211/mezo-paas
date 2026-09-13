"use client"

import { useState, useEffect } from "react"
import { Play, Eye, Edit3, ChevronDown, ExternalLink, Package, Loader2 } from "lucide-react"
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

      // Use viem directly for read
      const { createPublicClient, http } = await import("viem")
      const { mezoTestnet } = await import("wagmi/chains")

      const publicClient = createPublicClient({
        chain: chainId === 31611 ? mezoTestnet : {
          id: 31612,
          name: "Mezo Mainnet",
          nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
          rpcUrls: { default: { http: ["https://rpc.mezo.org"] } },
        },
        transport: http(),
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

    return (
      <div
        key={func.name}
        className="p-3 bg-[#111] border border-white/10 rounded-lg mb-2"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isWrite ? (
              <Edit3 size={12} className="text-orange-400" />
            ) : (
              <Eye size={12} className="text-blue-400" />
            )}
            <span className="text-white/90 text-sm font-medium">{func.name}</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            isWrite ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"
          }`}>
            {func.stateMutability}
          </span>
        </div>

        {/* Inputs */}
        {func.inputs.length > 0 && (
          <div className="space-y-2 mb-2">
            {func.inputs.map((input) => (
              <div key={input.name}>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-white/60 text-xs">{input.name}</span>
                  <span className="text-white/30 text-xs">({input.type})</span>
                </div>
                <input
                  type="text"
                  placeholder={input.type}
                  value={functionInputs[funcKey]?.[input.name] || ""}
                  onChange={(e) =>
                    updateFunctionInput(funcKey, input.name, e.target.value)
                  }
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/30"
                />
              </div>
            ))}
          </div>
        )}

        {/* Call Button */}
        <button
          onClick={() =>
            isWrite ? handleWriteFunction(func) : handleReadFunction(func)
          }
          disabled={isLoading || (isWrite && !isConnected)}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
        >
          {isLoading ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <>
              <Play size={10} />
              <span>{isWrite ? "Write" : "Read"}</span>
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-2 p-2 bg-black/30 rounded-lg text-xs font-mono break-all border border-white/5">
            <span className="text-white/40">Result: </span>
            <span className={result.startsWith("Error") ? "text-red-400" : "text-white/80"}>
              {result}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-white/80 text-sm font-medium">Interact</span>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Contract Selection */}
        <div>
          <label className="text-white/60 text-xs mb-2 block">
            Select Contract
          </label>
          {chainContracts.length > 0 ? (
            <div className="space-y-2">
              {chainContracts.map((contract) => (
                <div
                  key={contract.id}
                  className={`p-2 rounded-lg text-xs transition-colors ${
                    selectedContract?.id === contract.id
                      ? "bg-primary/20 border border-primary/50"
                      : "bg-[#111] border border-white/10 hover:border-white/20"
                  }`}
                >
                  <button
                    onClick={() => setSelectedContract(contract)}
                    className="w-full text-left"
                  >
                    <div className={`font-medium ${selectedContract?.id === contract.id ? "text-primary" : "text-white/80"}`}>
                      {contract.name}
                    </div>
                    <div className="text-white/40 truncate">{contract.address}</div>
                  </button>
                  {selectedContract?.id === contract.id && onCreateDApp && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCreateDApp(contract)
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-1.5 px-3 text-xs font-medium transition-colors rounded-lg"
                    >
                      <Package size={12} />
                      <span>Create dApp</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-xs">No deployed contracts on this chain</p>
          )}
        </div>

        {/* Custom Address */}
        <div>
          <label className="text-white/60 text-xs mb-1.5 block">
            Or enter address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/30"
          />
        </div>

        {/* Functions */}
        {selectedContract && (
          <>
            {/* Read Functions */}
            {readFunctions.length > 0 && (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowReadFunctions(!showReadFunctions)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-blue-400" />
                    <span className="text-white/80 text-xs">
                      Read Functions ({readFunctions.length})
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-white/40 transition-transform ${showReadFunctions ? "rotate-180" : ""}`}
                  />
                </button>
                {showReadFunctions && (
                  <div className="p-3 border-t border-white/10">
                    {readFunctions.map((func) => renderFunctionCard(func, false))}
                  </div>
                )}
              </div>
            )}

            {/* Write Functions */}
            {writeFunctions.length > 0 && (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowWriteFunctions(!showWriteFunctions)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Edit3 size={14} className="text-orange-400" />
                    <span className="text-white/80 text-xs">
                      Write Functions ({writeFunctions.length})
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-white/40 transition-transform ${showWriteFunctions ? "rotate-180" : ""}`}
                  />
                </button>
                {showWriteFunctions && (
                  <div className="p-3 border-t border-white/10">
                    {!isConnected && (
                      <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-400 text-xs">
                          Connect wallet to call write functions
                        </p>
                      </div>
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
          <div className="text-center py-8">
            <p className="text-white/40 text-xs">
              Select a deployed contract or enter an address to interact
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
