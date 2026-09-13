"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Rocket,
  Download,
  CheckCircle,
  Package,
  FileCode,
  Folder,
  X,
  Loader2,
} from "lucide-react"
import { FaGithub } from "react-icons/fa"
import type { DeployedContract } from "@/types/ide"
import { generateDAppProject, downloadAsZip } from "@/lib/ide/dapp-generator"

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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onClose])

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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Rocket size={18} className="text-primary" />
            <h2 className="text-white text-base font-medium">
              Create dApp from Contract
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {!contract ? (
            <div className="py-8 text-center">
              <p className="text-white/60">No deployed contract selected</p>
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
              <code className="block mt-4 p-3 bg-[#111] border border-white/10 rounded-lg text-primary text-sm font-mono">
                cd {projectName.trim().toLowerCase().replace(/\s+/g, "-")} &&
                npm install && npm run dev
              </code>
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={() => {
                    setIsComplete(false)
                    setProjectName("")
                  }}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Create Another
                </button>
                <button
                  onClick={() => {
                    setIsComplete(false)
                    setProjectName("")
                    onClose()
                  }}
                  className="px-6 py-2 text-sm font-medium text-dark bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Contract Info */}
              <div className="p-3 bg-[#111] border border-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    {contract.name}
                  </span>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {networkName}
                  </span>
                </div>
                <code className="text-xs text-white/50 break-all">
                  {contract.address}
                </code>
              </div>

              {/* Project Name */}
              <div>
                <label className="text-white/60 text-xs mb-2 block">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="my-mezo-dapp"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/30"
                />
              </div>

              {/* Template Selection */}
              <div>
                <label className="text-white/60 text-xs mb-2 block">
                  Starter Template
                </label>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.value}
                      onClick={() => setSelectedTemplate(template.value)}
                      className={`w-full p-3 text-left rounded-lg border transition-all ${
                        selectedTemplate === template.value
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-[#111] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded ${
                            selectedTemplate === template.value
                              ? "bg-primary/20 text-primary"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">
                              {template.label}
                            </span>
                            {template.value === "nextjs-wagmi" && (
                              <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-white/50 text-xs mt-0.5">
                            {template.description}
                          </p>
                        </div>
                        {selectedTemplate === template.value && (
                          <CheckCircle size={16} className="text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div className="p-3 bg-[#111] border border-white/10 rounded-lg">
                <p className="text-white/60 text-xs mb-2">
                  Your project will include:
                </p>
                <ul className="text-xs text-white/40 space-y-1">
                  <li>• Pre-configured {contract.name} contract with ABI</li>
                  <li>• Mezo network configuration ({networkName})</li>
                  <li>• RainbowKit wallet connection</li>
                  <li>• Example component to interact with your contract</li>
                  <li>• TypeScript support</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={!projectName.trim() || isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-dark py-2.5 px-4 font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Download Project</span>
                    </>
                  )}
                </button>
              </div>

              {/* Future: GitHub Deploy */}
              <div className="text-center pt-2 border-t border-white/10">
                <button
                  disabled
                  className="text-white/30 text-xs flex items-center gap-1 mx-auto cursor-not-allowed"
                >
                  <FaGithub size={12} />
                  <span>Deploy to GitHub (Coming Soon)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
