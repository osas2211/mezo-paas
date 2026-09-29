/**
 * Builds the diagnostics attached to an IDE problem report.
 * Only sections the user leaves checked are included, and everything is
 * trimmed to stay under the backend's 64 KB limit.
 */

import type { CompilationResult, ConsoleLog, DeployedContract } from "@/types/ide"
import { networkForChainId } from "./mezo-network"

export const MAX_DIAGNOSTICS_BYTES = 60 * 1024 // backend limit is 64 KB

export interface DiagnosticsSources {
  logs: ConsoleLog[]
  compilation: CompilationResult | null
  compilerStatus: string
  activeFile: { name: string; content: string } | null
  deployments: DeployedContract[]
  wallet: { isConnected: boolean; address?: string; chainId?: number }
}

export interface DiagnosticsSelection {
  console: boolean
  compiler: boolean
  deployments: boolean
  environment: boolean
  source: boolean
}

export const DEFAULT_SELECTION: DiagnosticsSelection = {
  console: true,
  compiler: true,
  deployments: true,
  environment: true,
  source: false, // contracts can be private — opt in only
}

const clip = (text: string | undefined, max: number) =>
  text === undefined ? undefined : text.length > max ? `${text.slice(0, max)}… [+${text.length - max} chars]` : text

function build(src: DiagnosticsSources, sel: DiagnosticsSelection, limits: { logs: number; source: number }) {
  const out: Record<string, unknown> = {
    reportedAt: new Date().toISOString(),
    route: typeof window !== "undefined" ? window.location.pathname : undefined,
  }

  if (sel.environment) {
    out.environment = {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : undefined,
      wallet: {
        connected: src.wallet.isConnected,
        address: src.wallet.address,
        chainId: src.wallet.chainId,
        network: src.wallet.chainId ? networkForChainId(src.wallet.chainId) ?? "other" : undefined,
      },
    }
  }

  if (sel.console) {
    out.console = src.logs.slice(-limits.logs).map((log) => ({
      time: new Date(log.timestamp).toISOString(),
      type: log.type,
      message: clip(log.message, 500),
      details: clip(log.details, 500),
    }))
  }

  if (sel.compiler) {
    const c = src.compilation
    out.compiler = {
      status: src.compilerStatus,
      file: src.activeFile?.name,
      version: c?.compilerVersion,
      settings: c?.compilerSettings,
      success: c?.success,
      contracts: c?.contracts?.map((x) => x.name),
      errors: c?.errors?.slice(0, 20).map((e) => clip(e.formattedMessage || e.message, 1000)),
      warningCount: c?.warnings?.length ?? 0,
    }
  }

  if (sel.deployments) {
    out.deployments = src.deployments.slice(0, 5).map((d) => ({
      name: d.name,
      address: d.address,
      chainId: d.chainId,
      txHash: d.txHash,
      deployedAt: new Date(d.deployedAt).toISOString(),
    }))
  }

  if (sel.source && src.activeFile) {
    out.source = { file: src.activeFile.name, content: clip(src.activeFile.content, limits.source) }
  }

  return out
}

const byteSize = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length

/** Returns diagnostics trimmed to fit, plus their size in bytes */
export function buildDiagnostics(src: DiagnosticsSources, sel: DiagnosticsSelection) {
  // Progressively trim the two unbounded parts until it fits
  for (const limits of [
    { logs: 50, source: 20000 },
    { logs: 25, source: 10000 },
    { logs: 10, source: 4000 },
    { logs: 5, source: 1000 },
  ]) {
    const diagnostics = build(src, sel, limits)
    const size = byteSize(diagnostics)
    if (size <= MAX_DIAGNOSTICS_BYTES) return { diagnostics, size }
  }
  const diagnostics = build(src, { ...sel, source: false, console: false }, { logs: 0, source: 0 })
  return { diagnostics, size: byteSize(diagnostics) }
}
