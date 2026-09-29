/**
 * dApp Project Generator
 * Generates runnable starter projects wired to a deployed Mezo contract.
 * Templates live in ./dapp-templates.
 */

import JSZip from "jszip"
import { sanitizeProjectName, type TemplateContext } from "./dapp-templates/shared"
import {
  nextjsViem,
  nextjsWagmi,
  reactViteWagmi,
  type GeneratedFile,
} from "./dapp-templates/projects"

export type { GeneratedFile }
export { sanitizeProjectName }

export type DAppTemplate = "nextjs-wagmi" | "nextjs-viem" | "react-wagmi"

export interface GeneratorConfig {
  projectName: string
  template: DAppTemplate
  contract: {
    name: string
    address: string
    abi: any[]
    chainId: number
  }
}

/**
 * Generate a complete dApp project
 */
export async function generateDAppProject(
  config: GeneratorConfig
): Promise<GeneratedFile[]> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(config.contract.address)) {
    throw new Error(`Invalid contract address: ${config.contract.address}`)
  }
  if (!Array.isArray(config.contract.abi)) {
    throw new Error("Contract ABI is missing")
  }

  const projectName = sanitizeProjectName(config.projectName)

  const base = {
    projectName,
    contract: config.contract,
    alias: "@/",
  }

  switch (config.template) {
    case "nextjs-viem":
      return nextjsViem({ ...base, useClient: true } satisfies TemplateContext)
    case "react-wagmi":
      return reactViteWagmi({ ...base, useClient: false } satisfies TemplateContext)
    case "nextjs-wagmi":
    default:
      return nextjsWagmi({ ...base, useClient: true } satisfies TemplateContext)
  }
}

/**
 * Download generated files as a zip. Files are placed in a top-level folder
 * named after the project, so "unzip && cd <name>" works as documented.
 */
export async function downloadAsZip(
  projectName: string,
  files: GeneratedFile[]
): Promise<void> {
  const name = sanitizeProjectName(projectName)
  const zip = new JSZip()
  const folder = zip.folder(name)!

  for (const file of files) {
    folder.file(file.path, file.content)
  }

  const blob = await zip.generateAsync({ type: "blob" })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${name}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
