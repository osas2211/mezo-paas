"use client"

import { useState, useCallback, useEffect } from "react"
import { Tabs, Modal, Spin } from "antd"
import { Code, Rocket, Play as PlayIcon } from "lucide-react"
import { useChainId } from "wagmi"
import { useIDEState } from "@/hooks/ide/use-ide-state"
import { useCompiler } from "@/hooks/ide/use-compiler"
import { getAllDeployments, saveDeployment, generateId } from "@/lib/ide/storage"
import type { DeployedContract, CompiledContract } from "@/types/ide"

import CodeEditor from "./code-editor"
import FileExplorer from "./file-explorer"
import EditorTabs from "./editor-tabs"
import CompilerPanel from "./compiler-panel"
import DeployPanel from "./deploy-panel"
import ContractInteract from "./contract-interact"
import ConsolePanel from "./console-panel"
import TemplateSelector from "./template-selector"
import ProtocolRegistry from "./protocol-registry"
import TransactionSimulator from "./transaction-simulator"
import ShareModal from "./share-modal"
import DAppGeneratorModal from "./dapp-generator-modal"
import IDEToolbar from "./ide-toolbar"
import { parseShareFromLocation, clearShareFromUrl, hasShareParams } from "@/lib/ide/share"

export default function IDEContainer() {
  const ide = useIDEState()
  const compiler = useCompiler()
  const chainId = useChainId()

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isProtocolRegistryOpen, setIsProtocolRegistryOpen] = useState(false)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isDAppGeneratorOpen, setIsDAppGeneratorOpen] = useState(false)
  const [dappGeneratorContract, setDappGeneratorContract] = useState<DeployedContract | null>(null)
  const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([])
  const [rightPanelTab, setRightPanelTab] = useState<"compile" | "deploy" | "interact">("compile")
  const [consoleHeight, setConsoleHeight] = useState(150)
  const [selectedNetwork, setSelectedNetwork] = useState<"testnet" | "mainnet">("testnet")

  // Load deployed contracts
  useEffect(() => {
    getAllDeployments().then(setDeployedContracts)
  }, [])

  // Welcome message
  useEffect(() => {
    ide.addLog("info", "Welcome to Mezo IDE!")
    ide.addLog("info", "Create a new file or select a template to get started.")
  }, [])

  // Load shared contract from URL
  useEffect(() => {
    const loadSharedContract = async () => {
      if (!hasShareParams()) return

      try {
        const shareData = await parseShareFromLocation()
        if (shareData) {
          await ide.createNewFile(shareData.name, shareData.content)
          ide.addLog("success", `Loaded shared contract: ${shareData.name}`)
          clearShareFromUrl()
        }
      } catch (err: any) {
        ide.addLog("error", `Failed to load shared contract: ${err.message}`)
        clearShareFromUrl()
      }
    }

    loadSharedContract()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        ide.saveActiveFile()
      }
      // Ctrl/Cmd + B = Compile
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault()
        handleCompile()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [ide.activeFile])

  const handleCompile = useCallback(async () => {
    if (!ide.activeFile) {
      ide.addLog("warning", "No file open to compile")
      return
    }

    ide.addLog("info", `Compiling ${ide.activeFile.name}...`)

    try {
      const result = await compiler.compile(
        ide.activeFile.content,
        ide.activeFile.name,
        ide.settings?.optimizerEnabled ?? true,
        ide.settings?.optimizerRuns ?? 200
      )

      ide.setCompilationResult(result)

      if (result.success) {
        ide.addLog(
          "success",
          `Compilation successful! ${result.contracts?.length || 0} contract(s) compiled.`
        )
        if (result.contracts && result.contracts.length > 0) {
          ide.setSelectedContract(result.contracts[0])
        }
        if (result.warnings && result.warnings.length > 0) {
          ide.addLog("warning", `${result.warnings.length} warning(s)`)
        }
      } else {
        ide.addLog("error", `Compilation failed with ${result.errors?.length || 0} error(s)`)
      }
    } catch (err: any) {
      ide.addLog("error", `Compilation error: ${err.message}`)
    }
  }, [ide.activeFile, ide.settings, compiler])

  const handleDeploySuccess = useCallback(
    async (address: string, txHash: string, chainId: number) => {
      if (!ide.selectedContract) return

      const deployment: DeployedContract = {
        id: generateId(),
        address,
        name: ide.selectedContract.name,
        abi: ide.selectedContract.abi,
        bytecode: ide.selectedContract.bytecode,
        chainId,
        deployedAt: Date.now(),
        txHash,
      }

      await saveDeployment(deployment)
      setDeployedContracts((prev) => [deployment, ...prev])
      setRightPanelTab("interact")

      // Set contract for dApp generator option
      setDappGeneratorContract(deployment)
    },
    [ide.selectedContract]
  )

  const handleOpenDAppGenerator = useCallback((contract: DeployedContract) => {
    setDappGeneratorContract(contract)
    setIsDAppGeneratorOpen(true)
  }, [])

  const handleTemplateSelect = useCallback(
    async (template: { name: string; content: string }) => {
      await ide.createNewFile(`${template.name}.sol`, template.content)
      setIsTemplateModalOpen(false)
    },
    [ide]
  )

  const handleNewFile = useCallback(() => {
    const name = `Contract${ide.contracts.length + 1}.sol`
    ide.createNewFile(name)
  }, [ide])

  const handleThemeToggle = useCallback(() => {
    const newTheme = ide.settings?.theme === "dark" ? "light" : "dark"
    ide.updateSettingsValue({ theme: newTheme })
  }, [ide.settings])

  const handleOptimizerChange = useCallback(
    (enabled: boolean, runs: number) => {
      ide.updateSettingsValue({ optimizerEnabled: enabled, optimizerRuns: runs })
    },
    [ide]
  )

  // Protocol Registry handlers
  const handleImportAbi = useCallback(
    async (name: string, abi: any[], address?: string) => {
      // Create a new file with the ABI as a TypeScript constant
      const abiContent = `// ${name} ABI
// Address: ${address || "Not deployed"}

export const ${name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}_ABI = ${JSON.stringify(abi, null, 2)} as const;

export const ${name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}_ADDRESS = "${address || "0x0000000000000000000000000000000000000000"}";
`
      await ide.createNewFile(`${name.replace(/[^a-zA-Z0-9]/g, "")}ABI.ts`, abiContent)
      ide.addLog("success", `Imported ${name} ABI`)
    },
    [ide]
  )

  const handleGenerateInterface = useCallback(
    async (name: string, code: string) => {
      await ide.createNewFile(name, code)
      ide.addLog("success", `Generated Solidity interface: ${name}`)
    },
    [ide]
  )

  if (ide.isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-white/60 text-sm">Loading IDE...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Toolbar */}
      <IDEToolbar
        onNewFile={handleNewFile}
        onSave={ide.saveActiveFile}
        onCompile={handleCompile}
        onTemplates={() => setIsTemplateModalOpen(true)}
        onProtocolRegistry={() => setIsProtocolRegistryOpen(true)}
        onSimulator={() => setIsSimulatorOpen(true)}
        onShare={() => setIsShareModalOpen(true)}
        onSettings={() => {}}
        isDirty={ide.activeFile?.isDirty || false}
        isCompiling={compiler.status === "compiling" || compiler.status === "resolving"}
        hasActiveFile={!!ide.activeFile}
        theme={ide.settings?.theme || "dark"}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-56 border-r border-white/10 flex-shrink-0">
          <FileExplorer
            contracts={ide.contracts}
            activeFileId={ide.activeFileId}
            onFileSelect={ide.openFile}
            onFileCreate={ide.createNewFile}
            onFileRename={ide.renameFile}
            onFileDelete={ide.deleteFile}
            onTemplatesClick={() => setIsTemplateModalOpen(true)}
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Tabs */}
          <EditorTabs
            openFiles={ide.openFiles}
            activeFileId={ide.activeFileId}
            onTabClick={ide.setActiveFileId}
            onTabClose={ide.closeFile}
          />

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            {ide.activeFile ? (
              <CodeEditor
                value={ide.activeFile.content}
                onChange={(content) =>
                  ide.updateFileContent(ide.activeFile!.id, content)
                }
                onSave={ide.saveActiveFile}
                fontSize={ide.settings?.fontSize || 14}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
                <div className="text-center">
                  <Code size={48} className="text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-sm mb-4">No file open</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handleNewFile}
                      className="px-4 py-2 bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors rounded"
                    >
                      New File
                    </button>
                    <button
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="px-4 py-2 bg-primary text-dark text-sm hover:bg-primary/90 transition-colors"
                    >
                      From Template
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-white/10 flex-shrink-0 flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-white/10 bg-[#0d0d0d]">
            <button
              onClick={() => setRightPanelTab("compile")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
                rightPanelTab === "compile"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <PlayIcon size={12} />
              Compile
            </button>
            <button
              onClick={() => setRightPanelTab("deploy")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
                rightPanelTab === "deploy"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Rocket size={12} />
              Deploy
            </button>
            <button
              onClick={() => setRightPanelTab("interact")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
                rightPanelTab === "interact"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Code size={12} />
              Interact
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {rightPanelTab === "compile" && (
              <CompilerPanel
                status={compiler.status}
                result={compiler.result}
                selectedContract={ide.selectedContract}
                onCompile={handleCompile}
                onSelectContract={ide.setSelectedContract}
                optimizerEnabled={ide.settings?.optimizerEnabled ?? true}
                optimizerRuns={ide.settings?.optimizerRuns ?? 200}
                onOptimizerChange={handleOptimizerChange}
              />
            )}
            {rightPanelTab === "deploy" && (
              <DeployPanel
                selectedContract={ide.selectedContract}
                sourceCode={ide.activeFile?.content}
                compilerVersion={ide.settings?.solcVersion || "0.8.28"}
                optimizerEnabled={ide.settings?.optimizerEnabled ?? true}
                optimizerRuns={ide.settings?.optimizerRuns ?? 200}
                resolvedSources={compiler.result?.sources}
                mainFileName={ide.activeFile?.name}
                onDeploySuccess={handleDeploySuccess}
                onCreateDApp={() => dappGeneratorContract && setIsDAppGeneratorOpen(true)}
                addLog={ide.addLog}
              />
            )}
            {rightPanelTab === "interact" && (
              <ContractInteract
                deployedContracts={deployedContracts}
                addLog={ide.addLog}
                onCreateDApp={handleOpenDAppGenerator}
              />
            )}
          </div>
        </div>
      </div>

      {/* Console */}
      <div
        style={{ height: consoleHeight }}
        className="transition-[height] duration-150 ease-out"
      >
        <ConsolePanel
          logs={ide.consoleLogs}
          onClear={ide.clearLogs}
          height={consoleHeight}
          onHeightChange={setConsoleHeight}
          minHeight={32}
          maxHeight={400}
        />
      </div>

      {/* Template Selector Modal */}
      <TemplateSelector
        open={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Protocol Registry Modal */}
      <ProtocolRegistry
        open={isProtocolRegistryOpen}
        onClose={() => setIsProtocolRegistryOpen(false)}
        onImportAbi={handleImportAbi}
        onGenerateInterface={handleGenerateInterface}
        network={selectedNetwork}
      />

      {/* Transaction Simulator Modal */}
      <TransactionSimulator
        open={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        deployedContracts={deployedContracts}
        addLog={ide.addLog}
        chainId={chainId}
      />

      {/* Share Modal */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        fileName={ide.activeFile?.name || "Contract.sol"}
        content={ide.activeFile?.content || ""}
      />

      {/* dApp Generator Modal */}
      <DAppGeneratorModal
        open={isDAppGeneratorOpen}
        onClose={() => setIsDAppGeneratorOpen(false)}
        contract={dappGeneratorContract}
        addLog={ide.addLog}
      />
    </div>
  )
}
