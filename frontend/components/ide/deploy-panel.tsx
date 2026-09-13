"use client"

import { useState, useEffect } from "react"
import {
  Rocket,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Shield,
  ShieldCheck,
  ShieldX,
  Loader2,
  HelpCircle,
  Package,
  ChevronDown,
} from "lucide-react"
import { useAccount, useChainId, useSwitchChain, useWalletClient, usePublicClient } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import type { CompiledContract, DeploymentStatus } from "@/types/ide"
import { MEZO_NETWORKS } from "@/types/ide"
import { getConstructor, parseInputValue } from "@/lib/ide/abi-utils"
import { useGasEstimator } from "@/hooks/ide/use-gas-estimator"
import { useVerification } from "@/hooks/ide/use-verification"
import GasEstimatorPanel from "./gas-estimator-panel"

interface DeployPanelProps {
  selectedContract: CompiledContract | null
  sourceCode?: string
  compilerVersion?: string
  optimizerEnabled?: boolean
  optimizerRuns?: number
  resolvedSources?: Record<string, { content: string }> // All resolved sources for verification
  mainFileName?: string // Main contract file name
  onDeploySuccess: (address: string, txHash: string, chainId: number) => void
  onCreateDApp?: () => void // Open dApp generator
  addLog: (type: "info" | "success" | "warning" | "error", message: string, details?: string) => void
}

export default function DeployPanel({
  selectedContract,
  sourceCode = "",
  compilerVersion = "0.8.28",
  optimizerEnabled = true,
  optimizerRuns = 200,
  resolvedSources,
  mainFileName,
  onDeploySuccess,
  onCreateDApp,
  addLog,
}: DeployPanelProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [selectedNetwork, setSelectedNetwork] = useState<"testnet" | "mainnet">("mainnet")
  const [constructorArgs, setConstructorArgs] = useState<Record<string, string>>({})
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>("idle")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [autoVerify, setAutoVerify] = useState(true)
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false)

  // Gas estimator
  const gasEstimator = useGasEstimator()

  // Verification
  const verification = useVerification({
    onSuccess: (result) => {
      addLog("success", "Contract verified successfully!", result.explorerUrl)
    },
    onError: (error) => {
      addLog("warning", `Verification failed: ${error}`, "You can verify manually on the explorer.")
    },
  })

  // Get constructor inputs
  const constructor = selectedContract ? getConstructor(selectedContract.abi) : null
  const hasConstructorArgs = constructor && constructor.inputs.length > 0

  // Check if on correct network
  const targetChainId = selectedNetwork === "testnet" ? 31611 : 31612
  const isCorrectNetwork = chainId === targetChainId

  // Reset constructor args and estimate gas when contract changes
  useEffect(() => {
    setConstructorArgs({})
    setDeploymentStatus("idle")
    setTxHash(null)
    setDeployedAddress(null)
    verification.reset()

    // Estimate gas for the new contract
    if (selectedContract && isConnected) {
      gasEstimator.estimateDeployment(
        selectedContract.bytecode,
        selectedContract.abi,
        []
      )
    }
  }, [selectedContract?.name, isConnected])

  // Re-estimate when constructor args change
  const handleEstimateGas = () => {
    if (!selectedContract) return

    const args: any[] = []
    if (hasConstructorArgs && constructor) {
      for (const input of constructor.inputs) {
        const value = constructorArgs[input.name] || ""
        try {
          args.push(parseInputValue(input.type, value))
        } catch {
          // Invalid arg, use empty for estimation
        }
      }
    }

    gasEstimator.estimateDeployment(
      selectedContract.bytecode,
      selectedContract.abi,
      args
    )
  }

  const handleDeploy = async () => {
    if (!selectedContract || !isConnected || !walletClient || !publicClient) {
      addLog("error", "Wallet not connected properly. Please reconnect.")
      return
    }

    try {
      setDeploymentStatus("deploying")
      setIsDeploying(true)
      addLog("info", `Deploying ${selectedContract.name}...`)

      // Parse constructor arguments
      const args: any[] = []
      if (hasConstructorArgs && constructor) {
        for (const input of constructor.inputs) {
          const value = constructorArgs[input.name] || ""
          try {
            args.push(parseInputValue(input.type, value))
          } catch (err: any) {
            addLog("error", `Invalid value for ${input.name}: ${err.message}`)
            setDeploymentStatus("error")
            setIsDeploying(false)
            return
          }
        }
      }

      // Deploy using the wagmi wallet client
      const hash = await walletClient.deployContract({
        abi: selectedContract.abi,
        bytecode: selectedContract.bytecode as `0x${string}`,
        args,
        account: address as `0x${string}`,
      })

      setTxHash(hash)
      addLog("info", `Transaction submitted: ${hash}`)

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === "success" && receipt.contractAddress) {
        setDeploymentStatus("success")
        setDeployedAddress(receipt.contractAddress)
        addLog(
          "success",
          `${selectedContract.name} deployed successfully!`,
          `Address: ${receipt.contractAddress}`
        )
        onDeploySuccess(receipt.contractAddress, hash, targetChainId)

        // Auto-verify if enabled
        if (autoVerify && sourceCode) {
          addLog("info", "Starting contract verification...")
          verification.verify({
            contractAddress: receipt.contractAddress,
            contractName: selectedContract.name,
            sourceCode,
            abi: selectedContract.abi,
            compilerVersion,
            optimizationUsed: optimizerEnabled,
            runs: optimizerRuns,
            constructorArgs: args,
            chainId: targetChainId,
            sources: resolvedSources,
            mainFileName,
          })
        }
      } else {
        setDeploymentStatus("error")
        addLog("error", "Deployment failed - transaction reverted")
      }
    } catch (err: any) {
      console.error("Deployment error:", err)
      setDeploymentStatus("error")
      addLog("error", `Deployment failed: ${err.shortMessage || err.message}`)
    } finally {
      setIsDeploying(false)
    }
  }

  const handleSwitchNetwork = () => {
    switchChain?.({ chainId: targetChainId })
  }

  const getExplorerUrl = (hash: string) => {
    const network = MEZO_NETWORKS[selectedNetwork]
    return `${network.explorerUrl}/tx/${hash}`
  }

  if (!selectedContract) {
    return (
      <div className="h-full flex flex-col bg-[#0d0d0d]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <span className="text-white/80 text-sm font-medium">Deploy</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-white/40 text-xs text-center">
            Compile a contract first to deploy
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-white/80 text-sm font-medium">Deploy</span>
        <span className="text-primary text-xs">{selectedContract.name}</span>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="p-4 bg-[#111] border border-white/10 rounded-lg">
            <p className="text-white/60 text-xs mb-3 text-center">
              Connect your wallet to deploy
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full bg-primary text-dark py-2 px-4 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        ) : (
          <>
            {/* Network Selector */}
            <div className="relative">
              <label className="text-white/60 text-xs mb-1.5 block">Network</label>
              <button
                onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                className="w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-left text-sm hover:border-white/20 transition-colors"
              >
                <span className="text-white">
                  {selectedNetwork === "testnet" ? "Mezo Testnet (31611)" : "Mezo Mainnet (31612)"}
                </span>
                <ChevronDown size={14} className="text-white/40" />
              </button>
              {networkDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-white/10 rounded-lg shadow-xl z-10">
                  <button
                    onClick={() => {
                      setSelectedNetwork("testnet")
                      setNetworkDropdownOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors ${
                      selectedNetwork === "testnet" ? "text-primary" : "text-white"
                    }`}
                  >
                    Mezo Testnet (31611)
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNetwork("mainnet")
                      setNetworkDropdownOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors ${
                      selectedNetwork === "mainnet" ? "text-primary" : "text-white"
                    }`}
                  >
                    Mezo Mainnet (31612)
                  </button>
                </div>
              )}
              {!isCorrectNetwork && (
                <button
                  onClick={handleSwitchNetwork}
                  className="mt-2 w-full text-xs text-primary hover:underline"
                >
                  Switch to {MEZO_NETWORKS[selectedNetwork].name}
                </button>
              )}
            </div>

            {/* Constructor Arguments */}
            {hasConstructorArgs && constructor && (
              <div>
                <label className="text-white/60 text-xs mb-2 block">
                  Constructor Arguments
                </label>
                <div className="space-y-2">
                  {constructor.inputs.map((input) => (
                    <div key={input.name}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white/80 text-xs">{input.name}</span>
                        <span className="text-white/40 text-xs">({input.type})</span>
                      </div>
                      <input
                        type="text"
                        placeholder={`Enter ${input.type}`}
                        value={constructorArgs[input.name] || ""}
                        onChange={(e) =>
                          setConstructorArgs((prev) => ({
                            ...prev,
                            [input.name]: e.target.value,
                          }))
                        }
                        className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gas Estimator */}
            {isCorrectNetwork && (
              <GasEstimatorPanel
                estimate={gasEstimator.estimate}
                isEstimating={gasEstimator.isEstimating}
                error={gasEstimator.error}
                btcPrice={gasEstimator.btcPrice}
                btcChange24h={gasEstimator.btcChange24h}
                onRefresh={handleEstimateGas}
              />
            )}

            {/* Auto-Verify Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#111] border border-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-primary" />
                <span className="text-white/80 text-xs font-medium">Auto-Verify</span>
                <span className="text-white/40 cursor-help" title="Automatically verify source code on Mezo Explorer after deployment">
                  <HelpCircle size={12} />
                </span>
              </div>
              <button
                onClick={() => setAutoVerify(!autoVerify)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  autoVerify ? "bg-primary" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    autoVerify ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Deploy Button */}
            <button
              onClick={handleDeploy}
              disabled={
                !isCorrectNetwork ||
                deploymentStatus === "deploying" ||
                isDeploying ||
                !walletClient
              }
              className="w-full flex items-center justify-center gap-2 bg-primary text-dark py-2 px-4 text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deploymentStatus === "deploying" || isDeploying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Rocket size={14} />
                  <span>Deploy</span>
                </>
              )}
            </button>

            {/* Deployment Status */}
            {deploymentStatus === "success" && txHash && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-green-400 text-xs font-medium">
                    Deployed Successfully
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View on Explorer
                    <ExternalLink size={10} />
                  </a>
                  {onCreateDApp && (
                    <button
                      onClick={onCreateDApp}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                    >
                      <Package size={10} />
                      Create dApp
                    </button>
                  )}
                </div>
              </div>
            )}

            {deploymentStatus === "error" && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="text-red-400 text-xs font-medium">
                    Deployment Failed
                  </span>
                </div>
              </div>
            )}

            {/* Verification Status */}
            {deploymentStatus === "success" && autoVerify && (
              <div
                className={`p-3 border rounded-lg ${
                  verification.status === "verified"
                    ? "bg-green-500/10 border-green-500/20"
                    : verification.status === "failed"
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-blue-500/10 border-blue-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {verification.status === "verified" ? (
                    <>
                      <ShieldCheck size={14} className="text-green-500" />
                      <span className="text-green-400 text-xs font-medium">
                        Contract Verified
                      </span>
                    </>
                  ) : verification.status === "failed" ? (
                    <>
                      <ShieldX size={14} className="text-red-500" />
                      <span className="text-red-400 text-xs font-medium">
                        Verification Failed
                      </span>
                    </>
                  ) : verification.isVerifying ? (
                    <>
                      <Loader2 size={14} className="text-blue-400 animate-spin" />
                      <span className="text-blue-400 text-xs font-medium">
                        {verification.status === "flattening"
                          ? "Preparing source..."
                          : verification.status === "submitting"
                          ? "Submitting to explorer..."
                          : "Verifying..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Shield size={14} className="text-white/40" />
                      <span className="text-white/40 text-xs font-medium">
                        Verification pending
                      </span>
                    </>
                  )}
                </div>

                {verification.status === "verified" && verification.result?.explorerUrl && (
                  <a
                    href={verification.result.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View verified contract
                    <ExternalLink size={10} />
                  </a>
                )}

                {verification.status === "failed" && (
                  <>
                    {verification.error && (
                      <p className="text-red-400/80 text-xs mt-1">{verification.error}</p>
                    )}
                    {verification.result?.explorerUrl && (
                      <a
                        href={verification.result.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Verify manually on explorer
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </>
                )}

                {/* Manual verify button if auto-verify failed or wasn't enabled */}
                {(verification.status === "failed" || verification.status === "idle") &&
                  deployedAddress && (
                    <button
                      onClick={() => {
                        if (selectedContract && sourceCode) {
                          addLog("info", "Retrying verification...")
                          verification.verify({
                            contractAddress: deployedAddress,
                            contractName: selectedContract.name,
                            sourceCode,
                            abi: selectedContract.abi,
                            compilerVersion,
                            optimizationUsed: optimizerEnabled,
                            runs: optimizerRuns,
                            chainId: targetChainId,
                            sources: resolvedSources,
                            mainFileName,
                          })
                        }
                      }}
                      disabled={verification.isVerifying}
                      className="mt-2 w-full flex items-center justify-center gap-2 bg-white/10 text-white/80 py-1.5 px-3 text-xs font-medium hover:bg-white/20 disabled:opacity-50 transition-colors rounded-lg"
                    >
                      <Shield size={12} />
                      {verification.status === "failed" ? "Retry Verification" : "Verify Now"}
                    </button>
                  )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
