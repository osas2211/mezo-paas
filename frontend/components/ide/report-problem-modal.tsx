"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { CheckCircle2, ChevronDown, ChevronRight, MessageSquareWarning, Send } from "lucide-react"
import { submitIdeReport, type IdeReportCategory } from "@/services/ide-report.service"
import { useUser } from "@/hooks/use-user"
import {
  DEFAULT_SELECTION,
  buildDiagnostics,
  type DiagnosticsSelection,
  type DiagnosticsSources,
} from "@/lib/ide/report-diagnostics"
import { ChipTabs, IdeButton, IdeModal, Notice, ide } from "./ui"

interface ReportProblemModalProps {
  open: boolean
  onClose: () => void
  sources: Omit<DiagnosticsSources, "wallet">
}

const CATEGORIES: { key: IdeReportCategory; label: string }[] = [
  { key: "BUG", label: "Bug" },
  { key: "CONFUSING", label: "Confusing" },
  { key: "FEATURE_REQUEST", label: "Feature request" },
  { key: "OTHER", label: "Other" },
]

const MIN_MESSAGE = 10
const MAX_MESSAGE = 5000

export default function ReportProblemModal({ open, onClose, sources }: ReportProblemModalProps) {
  const { address, isConnected, chainId } = useAccount()
  const { data: userData } = useUser()

  const [category, setCategory] = useState<IdeReportCategory>("BUG")
  const [message, setMessage] = useState("")
  const [selection, setSelection] = useState<DiagnosticsSelection>(DEFAULT_SELECTION)
  const [showPreview, setShowPreview] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentId, setSentId] = useState<string | null>(null)

  // Fresh form each time the modal opens
  useEffect(() => {
    if (open) {
      setError(null)
      setSentId(null)
      setShowPreview(false)
    }
  }, [open])

  const fullSources: DiagnosticsSources = { ...sources, wallet: { isConnected, address, chainId } }
  const { diagnostics, size } = useMemo(
    () => buildDiagnostics(fullSources, selection),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sources, selection, isConnected, address, chainId, open]
  )

  const errorCount = sources.compilation?.errors?.length ?? 0
  const options: { key: keyof DiagnosticsSelection; label: string; detail: string }[] = [
    { key: "console", label: "Console log", detail: `${Math.min(sources.logs.length, 50)} most recent entries` },
    {
      key: "compiler",
      label: "Compiler output",
      detail: sources.compilation
        ? `${sources.compilation.success ? "Compiled" : "Failed"}${errorCount ? ` · ${errorCount} error(s)` : ""}`
        : "Not compiled yet",
    },
    { key: "deployments", label: "Recent deployments", detail: `${Math.min(sources.deployments.length, 5)} contract(s), addresses and tx hashes` },
    { key: "environment", label: "Environment", detail: "Browser, screen size, wallet address and network" },
    {
      key: "source",
      label: "Contract source",
      detail: sources.activeFile ? `${sources.activeFile.name} — only if it isn't sensitive` : "No file open",
    },
  ]

  const trimmed = message.trim()
  const canSend = trimmed.length >= MIN_MESSAGE && trimmed.length <= MAX_MESSAGE && !isSending

  const send = async () => {
    setIsSending(true)
    setError(null)
    try {
      const result = await submitIdeReport({ category, message: trimmed, diagnostics })
      setSentId(result.id)
      setMessage("")
      setSelection(DEFAULT_SELECTION)
    } catch (err: any) {
      const status = err?.response?.status
      setError(
        status === 401
          ? "Your session expired — log in again and resend."
          : err?.response?.data?.message || err?.message || "Couldn't send the report"
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <IdeModal open={open} onClose={onClose} title="Report a problem" icon={<MessageSquareWarning />} width={640}>
      {sentId ? (
        <div className="py-8 flex flex-col items-center text-center gap-2">
          <CheckCircle2 size={40} className="text-green-500 mb-2" />
          <p className="text-white font-medium">Thanks — your report was sent</p>
          <p className="text-sm text-white/50">
            Reference <span className="font-mono text-white/80">{sentId.slice(0, 8)}</span>. We read every report.
          </p>
          <div className="flex gap-2 mt-4">
            <IdeButton variant="secondary" size="md" onClick={() => setSentId(null)}>
              Report another
            </IdeButton>
            <IdeButton variant="primary" size="md" onClick={onClose}>
              Done
            </IdeButton>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <ChipTabs items={CATEGORIES} active={category} onChange={setCategory} />

          <label className="block space-y-1.5">
            <span className={ide.label}>What happened?</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={MAX_MESSAGE}
              autoFocus
              placeholder="What were you trying to do, and what happened instead? Steps to reproduce help a lot."
              className={`${ide.input} resize-y min-h-28`}
            />
            <span className="flex justify-between text-[11px] text-white/40">
              <span>{trimmed.length > 0 && trimmed.length < MIN_MESSAGE ? `At least ${MIN_MESSAGE} characters` : ""}</span>
              <span>
                {trimmed.length}/{MAX_MESSAGE}
              </span>
            </span>
          </label>

          <section className="space-y-2">
            <h4 className={ide.label}>Attach diagnostics</h4>
            <div className="border border-white/10 divide-y divide-white/10">
              {options.map((opt) => (
                <label key={opt.key} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input
                    type="checkbox"
                    checked={selection[opt.key]}
                    onChange={(e) => setSelection((prev) => ({ ...prev, [opt.key]: e.target.checked }))}
                    className="mt-0.5 accent-[#b3ec11]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-white">{opt.label}</span>
                    <span className="block text-xs text-white/40">{opt.detail}</span>
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white cursor-pointer"
            >
              {showPreview ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Preview what will be sent ({(size / 1024).toFixed(1)} KB)
            </button>
            {showPreview && (
              <pre className={`${ide.codeBlock} max-h-56 text-[11px] whitespace-pre-wrap break-all`}>
                {JSON.stringify({ category, message: trimmed, diagnostics }, null, 2)}
              </pre>
            )}
          </section>

          {error && <Notice tone="error">{error}</Notice>}

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-white/40 min-w-0 truncate">
              Sent with your account{userData?.user?.email ? ` (${userData.user.email})` : ""} so we can follow up.
            </p>
            <div className="flex gap-2 shrink-0">
              <IdeButton variant="secondary" size="md" onClick={onClose}>
                Cancel
              </IdeButton>
              <IdeButton variant="primary" size="md" icon={<Send size={14} />} loading={isSending} disabled={!canSend} onClick={send}>
                Send report
              </IdeButton>
            </div>
          </div>
        </div>
      )}
    </IdeModal>
  )
}
