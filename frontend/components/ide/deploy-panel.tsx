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
  HelpCircle,
  Package,
  ChevronDown,
} from "lucide-react"
import { useAccount, useChainId, useSwitchChain, useWalletClient, usePublicClient } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import type { CompiledContract, CompilerSettings, DeploymentStatus } from "@/types/ide"
import { MEZO_NETWORKS } from "@/types/ide"
import { getConstructor, parseInputValue } from "@/lib/ide/abi-utils"
import { useGasEstimator } from "@/hooks/ide/use-gas-estimator"
import { useVerification } from "@/hooks/ide/use-verification"
import GasEstimatorPanel from "./gas-estimator-panel"
import { Switch } from "antd"
import { ide, IdeButton, Notice, Section, Field, PanelHeader, EmptyState, Spinner } from "./ui"

interface DeployPanelProps {
  selectedContract: CompiledContract | null
  sourceCode?: string
  compilerVersion?: string
  optimizerEnabled?: boolean
  optimizerRuns?: number
  resolvedSources?: Record<string, { content: string }> // All resolved sources for verification
  mainFileName?: string // Main contract file name
  compilerSettings?: CompilerSettings // Exact settings used at compile time
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
  compilerSettings,
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
            compilerSettings,
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
      <div className="h-full flex flex-col">
        <PanelHeader icon={<Rocket size={14} />} title="Deploy" />
        <div className="flex-1 overflow-y-auto">
          <EmptyState icon={<Rocket size={28} />} title="Compile a contract first to deploy" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <PanelHeader
        icon={<Rocket size={14} />}
        title="Deploy"
        actions={
          <span className="text-primary text-xs font-medium truncate max-w-40">
            {selectedContract.name}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Wallet Connection */}
        {!isConnected ? (
          <div className={`${ide.card} p-4 space-y-3`}>
            <p className="text-white/60 text-xs text-center">
              Connect your wallet to deploy
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <IdeButton variant="primary" size="md" block onClick={openConnectModal}>
                  Connect Wallet
                </IdeButton>
              )}
            </ConnectButton.Custom>
          </div>
        ) : (
          <>
            {/* Network Selector */}
            <Section title="Network">
              <div className="relative">
                <button
                  onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                  className={`${ide.input} flex items-center justify-between text-left cursor-pointer hover:border-white/20`}
                >
                  <span className="text-white">
                    {selectedNetwork === "testnet" ? "Mezo Testnet (31611)" : "Mezo Mainnet (31612)"}
                  </span>
                  <ChevronDown size={14} className="text-white/40" />
                </button>
                {networkDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-dark border border-white/10 shadow-xl z-10">
                    <button
                      onClick={() => {
                        setSelectedNetwork("testnet")
                        setNetworkDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors cursor-pointer ${
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
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors cursor-pointer ${
                        selectedNetwork === "mainnet" ? "text-primary" : "text-white"
                      }`}
                    >
                      Mezo Mainnet (31612)
                    </button>
                  </div>
                )}
              </div>
              {!isCorrectNetwork && (
                <button
                  onClick={handleSwitchNetwork}
                  className="w-full text-xs text-primary hover:underline cursor-pointer"
                >
                  Switch to {MEZO_NETWORKS[selectedNetwork].name}
                </button>
              )}
            </Section>

            {/* Constructor Arguments */}
            {hasConstructorArgs && constructor && (
              <Section title="Constructor Arguments">
                <div className="space-y-3">
                  {constructor.inputs.map((input) => (
                    <Field
                      key={input.name}
                      label={
                        <>
                          <span className="text-white/60 normal-case tracking-normal">{input.name}</span>
                          <span className="font-mono normal-case tracking-normal">({input.type})</span>
                        </>
                      }
                    >
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
                        className={ide.inputMono}
                      />
                    </Field>
                  ))}
                </div>
              </Section>
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
            <div className={`${ide.card} flex items-center justify-between p-3`}>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-primary" />
                <span className="text-white text-xs font-medium">Auto-Verify</span>
                <span className="text-white/40 cursor-help" title="Automatically verify source code on Mezo Explorer after deployment">
                  <HelpCircle size={12} />
                </span>
              </div>
              <Switch size="small" checked={autoVerify} onChange={() => setAutoVerify(!autoVerify)} />
            </div>

            {/* Deploy Button */}
            <IdeButton
              variant="primary"
              size="md"
              block
              onClick={handleDeploy}
              disabled={
                !isCorrectNetwork ||
                deploymentStatus === "deploying" ||
                isDeploying ||
                !walletClient
              }
              loading={deploymentStatus === "deploying" || isDeploying}
              icon={<Rocket size={14} />}
            >
              {deploymentStatus === "deploying" || isDeploying ? "Deploying..." : "Deploy"}
            </IdeButton>

            {/* Deployment Status */}
            {deploymentStatus === "success" && txHash && (
              <Notice tone="success" icon={<CheckCircle size={14} />} title="Deployed Successfully">
                <div className="flex items-center gap-3 pt-1">
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
                      className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                    >
                      <Package size={10} />
                      Create dApp
                    </button>
                  )}
                </div>
              </Notice>
            )}

            {deploymentStatus === "error" && (
              <Notice tone="error" icon={<AlertCircle size={14} />} title="Deployment Failed" />
            )}

            {/* Verification Status */}
            {deploymentStatus === "success" && autoVerify && (
              <Notice
                tone={
                  verification.status === "verified"
                    ? "success"
                    : verification.status === "failed"
                    ? "error"
                    : verification.isVerifying
                    ? "primary"
                    : "neutral"
                }
                icon={
                  verification.status === "verified" ? (
                    <ShieldCheck size={14} />
                  ) : verification.status === "failed" ? (
                    <ShieldX size={14} />
                  ) : verification.isVerifying ? (
                    <Spinner size={14} />
                  ) : (
                    <Shield size={14} />
                  )
                }
                title={
                  verification.status === "verified"
                    ? "Contract Verified"
                    : verification.status === "failed"
                    ? "Verification Failed"
                    : verification.isVerifying
                    ? verification.status === "indexing"
                      ? "Waiting for explorer to index contract..."
                      : verification.status === "submitting"
                      ? "Submitting to explorer..."
                      : "Verifying..."
                    : "Verification pending"
                }
              >
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
                      <p className="text-xs break-words">{verification.error}</p>
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
                    <IdeButton
                      variant="secondary"
                      size="xs"
                      block
                      className="mt-2"
                      icon={<Shield size={12} />}
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
                            compilerSettings,
                          })
                        }
                      }}
                      disabled={verification.isVerifying}
                    >
                      {verification.status === "failed" ? "Retry Verification" : "Verify Now"}
                    </IdeButton>
                  )}
              </Notice>
            )}
          </>
        )}
      </div>
    </div>
  )
}
