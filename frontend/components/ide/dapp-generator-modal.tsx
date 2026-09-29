"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Rocket,
  Download,
  CheckCircle,
  Package,
  FileCode,
  Folder,
} from "lucide-react"
import type { DeployedContract } from "@/types/ide"
import {
  generateDAppProject,
  downloadAsZip,
  sanitizeProjectName,
  type DAppTemplate,
} from "@/lib/ide/dapp-generator"
import { ide, IdeButton, IdeModal, Section, Field, StatusPill } from "./ui"

interface DAppGeneratorModalProps {
  open: boolean
  onClose: () => void
  contract: DeployedContract | null
  addLog?: (
    type: "info" | "success" | "warning" | "error",
    message: string,
  ) => void
}

type Template = DAppTemplate

interface TemplateOption {
  value: Template
  label: string
  description: string
  icon: React.ReactNode
}

const templates: TemplateOption[] = [
  {
    value: "nextjs-wagmi",
    label: "Next.js + wagmi",
    description: "Next.js 16, wagmi, RainbowKit. Browser, WalletConnect and mobile wallets.",
    icon: <Package size={16} />,
  },
  {
    value: "nextjs-viem",
    label: "Next.js + viem",
    description: "Next.js 16 and viem only. Minimal, no wallet kit, browser wallets.",
    icon: <FileCode size={16} />,
  },
  {
    value: "react-wagmi",
    label: "React + wagmi (Vite)",
    description: "Client-side React 19 SPA with Vite, wagmi and RainbowKit.",
    icon: <Folder size={16} />,
  },
]

export default function DAppGeneratorModal({
  open,
  onClose,
  contract,
  addLog,
}: DAppGeneratorModalProps) {
  const [projectName, setProjectName] = useState("")
  const [selectedTemplate, setSelectedTemplate] =
    useState<Template>("nextjs-wagmi")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Start fresh for each contract, with a sensible default name
  useEffect(() => {
    if (!contract) return
    setProjectName(sanitizeProjectName(`${contract.name}-dapp`))
    setIsComplete(false)
  }, [contract?.address, contract?.chainId])

  const folderName = sanitizeProjectName(projectName)

  const handleGenerate = useCallback(async () => {
    if (!contract || !projectName.trim()) return

    setIsGenerating(true)
    addLog?.("info", `Generating ${selectedTemplate} project...`)

    try {
      // Generate the project files
      const files = await generateDAppProject({
        projectName: folderName,
        template: selectedTemplate,
        contract: {
          name: contract.name,
          address: contract.address,
          abi: contract.abi,
          chainId: contract.chainId,
        },
      })

      // Download as zip
      await downloadAsZip(folderName, files)

      setIsComplete(true)
      addLog?.("success", `Project "${folderName}" generated and downloaded (${files.length} files)`)
    } catch (error: any) {
      addLog?.("error", `Failed to generate project: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }, [contract, projectName, folderName, selectedTemplate, addLog])

  const networkName =
    contract?.chainId === 31611
      ? "Mezo Testnet"
      : contract?.chainId === 31612
        ? "Mezo Mainnet"
        : `Chain ${contract?.chainId}`

  return (
    <IdeModal
      open={open}
      onClose={onClose}
      title="Create dApp from Contract"
      icon={<Rocket size={18} />}
      width={520}
    >
      {!contract ? (
        <div className="py-8 text-center">
          <p className="text-sm text-white/60">No deployed contract selected</p>
        </div>
      ) : isComplete ? (
        <div className="py-6 text-center">
          <CheckCircle size={48} className="text-primary mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">
            Project Generated!
          </h3>
          <p className="text-white/60 text-sm">
            Unzip <span className="font-mono text-white">{folderName}.zip</span>, then run:
          </p>
          <code className={`${ide.codeBlock} block mt-4 text-left whitespace-pre`}>
            {[`cd ${folderName}`, "npm install", "npm run dev"].join("\n")}
          </code>
          <p className="text-white/40 text-xs mt-3">
            Requires Node.js 20.9+. See the project README for wallet setup.
          </p>
          <div className="flex gap-3 mt-6 justify-center">
            <IdeButton
              variant="secondary"
              size="md"
              onClick={() => setIsComplete(false)}
            >
              Create Another
            </IdeButton>
            <IdeButton
              variant="primary"
              size="md"
              className="px-6"
              onClick={() => {
                setIsComplete(false)
                onClose()
              }}
            >
              Done
            </IdeButton>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Contract Info */}
          <div className={`${ide.card} p-3`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm text-white font-medium">
                {contract.name}
              </span>
              <StatusPill tone="primary">{networkName}</StatusPill>
            </div>
            <code className="text-xs font-mono text-white/50 break-all">
              {contract.address}
            </code>
          </div>

          {/* Project Name */}
          <Field
            label="Project Name"
            hint={
              projectName.trim() && folderName !== projectName.trim() ? (
                <>
                  Folder and package name: <span className="font-mono text-white/60">{folderName}</span>
                </>
              ) : undefined
            }
          >
            <input
              type="text"
              placeholder="my-mezo-dapp"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={ide.input}
            />
          </Field>

          {/* Template Selection */}
          <Section title="Starter Template">
            <div className="space-y-2">
              {templates.map((template) => {
                const isSelected = selectedTemplate === template.value
                return (
                  <button
                    key={template.value}
                    onClick={() => setSelectedTemplate(template.value)}
                    className={`${ide.row} w-full p-3 text-left cursor-pointer ${
                      isSelected ? "border-primary/40 bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 border ${
                          isSelected
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-white/10 bg-white/5 text-white/40"
                        }`}
                      >
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium text-sm ${
                              isSelected ? "text-primary" : "text-white"
                            }`}
                          >
                            {template.label}
                          </span>
                          {template.value === "nextjs-wagmi" && (
                            <StatusPill tone="primary">Recommended</StatusPill>
                          )}
                        </div>
                        <p className="text-white/50 text-xs mt-0.5">
                          {template.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle size={16} className="text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </Section>

          {/* What's Included */}
          <div className={`${ide.card} p-3`}>
            <p className={`${ide.label} mb-2`}>Your project will include:</p>
            <ul className="text-xs text-white/60 space-y-1">
              <li>• Typed {contract.name} ABI and address ({networkName})</li>
              <li>• Read and write UI for every contract function, including payable, arrays and structs</li>
              <li>• Transactions simulated first, so revert reasons show before the wallet opens</li>
              <li>• Wallet connection with switch-to-Mezo prompt</li>
              <li>• Official Mezo chains from viem, Tailwind CSS 4, TypeScript</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <IdeButton
              variant="primary"
              size="md"
              block
              onClick={handleGenerate}
              disabled={!projectName.trim() || isGenerating}
              loading={isGenerating}
              icon={<Download size={16} />}
            >
              <span>{isGenerating ? "Generating..." : "Download Project"}</span>
            </IdeButton>
          </div>

        </div>
      )}
    </IdeModal>
  )
}
