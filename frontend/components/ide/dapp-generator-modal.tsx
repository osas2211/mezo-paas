"use client"

import { useState, useCallback } from "react"
import {
  Rocket,
  Download,
  CheckCircle,
  Package,
  FileCode,
  Folder,
} from "lucide-react"
import { FaGithub } from "react-icons/fa"
import type { DeployedContract } from "@/types/ide"
import { generateDAppProject, downloadAsZip } from "@/lib/ide/dapp-generator"
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

type Template = "nextjs-wagmi" | "nextjs-viem" | "react-wagmi"

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
    description: "Full-stack React framework with wagmi hooks",
    icon: <Package size={16} />,
  },
  {
    value: "nextjs-viem",
    label: "Next.js + viem",
    description: "Full-stack React with low-level viem client",
    icon: <FileCode size={16} />,
  },
  {
    value: "react-wagmi",
    label: "React + wagmi",
    description: "Client-side React with wagmi hooks",
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

  const handleGenerate = useCallback(async () => {
    if (!contract || !projectName.trim()) return

    setIsGenerating(true)
    addLog?.("info", `Generating ${selectedTemplate} project...`)

    try {
      // Generate the project files
      const files = await generateDAppProject({
        projectName: projectName.trim().toLowerCase().replace(/\s+/g, "-"),
        template: selectedTemplate,
        contract: {
          name: contract.name,
          address: contract.address,
          abi: contract.abi,
          chainId: contract.chainId,
        },
      })

      // Download as zip
      await downloadAsZip(
        projectName.trim().toLowerCase().replace(/\s+/g, "-"),
        files,
      )

      setIsComplete(true)
      addLog?.("success", `Project "${projectName}" generated and downloaded!`)
    } catch (error: any) {
      addLog?.("error", `Failed to generate project: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }, [contract, projectName, selectedTemplate, addLog])

  const networkName =
    contract?.chainId === 31611 ? "Mezo Testnet" : "Mezo Mainnet"

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
            Your dApp project has been downloaded. Unzip and run:
          </p>
          <code className={`${ide.codeBlock} block mt-4 text-left`}>
            cd {projectName.trim().toLowerCase().replace(/\s+/g, "-")} &&
            npm install && npm run dev
          </code>
          <div className="flex gap-3 mt-6 justify-center">
            <IdeButton
              variant="secondary"
              size="md"
              onClick={() => {
                setIsComplete(false)
                setProjectName("")
              }}
            >
              Create Another
            </IdeButton>
            <IdeButton
              variant="primary"
              size="md"
              className="px-6"
              onClick={() => {
                setIsComplete(false)
                setProjectName("")
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
          <Field label="Project Name">
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
              <li>• Pre-configured {contract.name} contract with ABI</li>
              <li>• Mezo network configuration ({networkName})</li>
              <li>• RainbowKit wallet connection</li>
              <li>• Example component to interact with your contract</li>
              <li>• TypeScript support</li>
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

          {/* Future: GitHub Deploy */}
          <div className={`text-center pt-4 border-t ${ide.divider}`}>
            <IdeButton
              variant="ghost"
              size="xs"
              disabled
              icon={<FaGithub size={12} />}
              className="mx-auto"
            >
              <span>Deploy to GitHub (Coming Soon)</span>
            </IdeButton>
          </div>
        </div>
      )}
    </IdeModal>
  )
}
