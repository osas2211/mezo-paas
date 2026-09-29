"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Download, FileCode, FolderDown, Hammer, Package } from "lucide-react"
import { downloadAsZip } from "@/lib/ide/dapp-generator"
import { sanitizeProjectName } from "@/lib/ide/dapp-templates/shared"
import {
  EVM_VERSION,
  OZ_VERSION,
  generateExportProject,
  solcShortVersion,
  type ExportFramework,
} from "@/lib/ide/project-export"
import type { CompilationResult, CompiledContract, StoredContract } from "@/types/ide"
import { Field, IdeButton, IdeModal, Notice, ide } from "./ui"

interface ExportProjectModalProps {
  open: boolean
  onClose: () => void
  workspaceFiles: StoredContract[]
  compilation: CompilationResult | null
  selectedContract: CompiledContract | null
  addLog: (type: "info" | "success" | "warning" | "error", message: string) => void
}

const FRAMEWORKS: { key: ExportFramework; name: string; icon: React.ReactNode; blurb: string; deploy: string }[] = [
  {
    key: "hardhat",
    name: "Hardhat 3",
    icon: <Package size={18} />,
    blurb: "TypeScript + viem. Ignition deploy module, encrypted keystore, `hardhat verify blockscout`.",
    deploy: "npm install → npm run deploy:testnet",
  },
  {
    key: "foundry",
    name: "Foundry",
    icon: <Hammer size={18} />,
    blurb: "Solidity deploy script, `forge script --broadcast --verify` against Mezo's Blockscout.",
    deploy: "forge install … → forge script script/Deploy.s.sol",
  },
]

export default function ExportProjectModal({
  open,
  onClose,
  workspaceFiles,
  compilation,
  selectedContract,
  addLog,
}: ExportProjectModalProps) {
  const [framework, setFramework] = useState<ExportFramework>("hardhat")
  const [projectName, setProjectName] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const main = compilation?.success && selectedContract ? selectedContract : null
  const constructorInputs = useMemo(
    () => (main?.abi.find((x: any) => x.type === "constructor")?.inputs ?? []) as any[],
    [main]
  )
  const solFiles = workspaceFiles.filter((f) => f.name.endsWith(".sol"))

  useEffect(() => {
    if (!open) return
    setDone(null)
    setError(null)
    if (main) setProjectName(sanitizeProjectName(`${main.name}-${framework}`))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, main?.name])

  const exportInput = main
    ? {
        framework,
        projectName: projectName || main.name,
        files: solFiles.map((f) => ({ name: f.name, content: f.content })),
        main: {
          fileName: compilation?.mainFileName ?? `${main.name}.sol`,
          contractName: main.name,
          constructorInputs,
        },
        compiler: {
          version: compilation?.compilerVersion ?? "v0.8.28+commit.7893614a",
          optimizer: compilation?.compilerSettings?.optimizer ?? { enabled: true, runs: 200 },
        },
      }
    : null

  const files = useMemo(() => (exportInput ? generateExportProject(exportInput) : []), [
    framework,
    projectName,
    main,
    solFiles.map((f) => f.updatedAt).join(","),
  ])

  const folder = sanitizeProjectName(projectName || main?.name || "mezo-contracts")

  const handleExport = async () => {
    if (!exportInput) return
    setIsExporting(true)
    setError(null)
    try {
      await downloadAsZip(folder, files)
      setDone(folder)
      addLog("success", `Exported ${main!.name} as a ${framework === "hardhat" ? "Hardhat 3" : "Foundry"} project (${folder}.zip)`)
    } catch (e: any) {
      setError(e?.message || "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  const selected = FRAMEWORKS.find((f) => f.key === framework)!

  return (
    <IdeModal open={open} onClose={onClose} title="Export project" icon={<FolderDown />} width={720}>
      {!main ? (
        <Notice tone="warning" title="Compile a contract first">
          The export includes a deploy script for the selected contract, so it needs a successful compile. Open the
          contract, press Ctrl+B, then export.
        </Notice>
      ) : done ? (
        <div className="py-6 flex flex-col items-center text-center gap-2">
          <CheckCircle2 size={40} className="text-green-500 mb-1" />
          <p className="text-white font-medium">Downloaded {done}.zip</p>
          <p className="text-sm text-white/50 max-w-md">
            Unzip it and follow the README — it has setup, deploy and verify commands for Mezo.
          </p>
          <code className={`${ide.codeBlock} mt-3 text-left`}>{selected.deploy}</code>
          <div className="flex gap-2 mt-4">
            <IdeButton variant="secondary" size="md" onClick={() => setDone(null)}>
              Export again
            </IdeButton>
            <IdeButton variant="primary" size="md" onClick={onClose}>
              Done
            </IdeButton>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Framework */}
          <div className="grid grid-cols-2 gap-2">
            {FRAMEWORKS.map((f) => {
              const active = f.key === framework
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setFramework(f.key)
                    setProjectName(sanitizeProjectName(`${main.name}-${f.key}`))
                  }}
                  className={`text-left p-4 border transition-colors cursor-pointer ${
                    active ? "border-primary/40 bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                  }`}
                >
                  <span className={`flex items-center gap-2 font-medium ${active ? "text-primary" : "text-white"}`}>
                    {f.icon}
                    {f.name}
                  </span>
                  <span className="block text-xs text-white/50 mt-1.5 leading-relaxed">{f.blurb}</span>
                </button>
              )
            })}
          </div>

          <Field label="Project name">
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className={ide.inputMono} />
          </Field>

          {/* What's in it */}
          <div className="grid grid-cols-2 gap-4">
            <section className="space-y-1.5 min-w-0">
              <h4 className={ide.label}>Deploys</h4>
              <div className={`${ide.card} p-3 space-y-2`}>
                <p className="font-mono text-sm text-white truncate">{main.name}</p>
                {constructorInputs.length === 0 ? (
                  <p className="text-xs text-white/50">No constructor arguments</p>
                ) : (
                  <ul className="space-y-0.5 text-[11px] font-mono">
                    {constructorInputs.map((p: any, i: number) => (
                      <li key={i} className="truncate">
                        <span className="text-white/70">{p.name || `arg${i}`}</span>{" "}
                        <span className="text-white/35">{p.type}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[11px] text-white/40 pt-1 border-t border-white/10">
                  solc {solcShortVersion(exportInput!.compiler.version)} · optimizer{" "}
                  {exportInput!.compiler.optimizer.enabled ? `${exportInput!.compiler.optimizer.runs} runs` : "off"} · EVM{" "}
                  {EVM_VERSION} · OZ {OZ_VERSION}
                </p>
              </div>
            </section>

            <section className="space-y-1.5 min-w-0">
              <h4 className={ide.label}>Files ({files.length})</h4>
              <ul className={`${ide.card} p-2 max-h-44 overflow-y-auto space-y-0.5`}>
                {files.map((f) => (
                  <li key={f.path} className="flex items-center gap-1.5 text-[11px] font-mono text-white/70 truncate">
                    <FileCode size={11} className="shrink-0 text-white/30" />
                    {f.path}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <Notice tone="neutral">
            Includes Mezo Testnet and Mainnet networks (Mezo&apos;s documented RPCs), Blockscout verification, and a
            README with setup, deploy and verify steps. Set the constructor arguments before deploying — the export
            uses placeholders.
          </Notice>

          {error && <Notice tone="error">{error}</Notice>}

          <div className="flex justify-end gap-2">
            <IdeButton variant="secondary" size="md" onClick={onClose}>
              Cancel
            </IdeButton>
            <IdeButton variant="primary" size="md" icon={<Download size={14} />} loading={isExporting} onClick={handleExport}>
              Download {folder}.zip
            </IdeButton>
          </div>
        </div>
      )}
    </IdeModal>
  )
}
