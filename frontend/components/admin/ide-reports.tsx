"use client"

import { useState } from "react"
import { Select } from "antd"
import moment from "moment"
import { ChevronDown, ChevronRight, Inbox, MessageSquareWarning } from "lucide-react"
import { useIdeReports, useUpdateIdeReport } from "@/hooks/use-admin"
import type { IdeReport, IdeReportCategory, IdeReportStatus } from "@/types/admin"

const STATUS_LABELS: Record<IdeReportStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  WONT_FIX: "Won't fix",
}

const STATUS_STYLES: Record<IdeReportStatus, string> = {
  OPEN: "text-amber-500 bg-amber-200/10",
  IN_PROGRESS: "text-primary bg-primary/10",
  RESOLVED: "text-green-500 bg-green-200/10",
  WONT_FIX: "text-white/50 bg-white/10",
}

const CATEGORY_LABELS: Record<IdeReportCategory, string> = {
  BUG: "Bug",
  CONFUSING: "Confusing",
  FEATURE_REQUEST: "Feature request",
  OTHER: "Other",
}

export function IdeReports({ adminKey }: { adminKey: string }) {
  const [filter, setFilter] = useState<IdeReportStatus | undefined>("OPEN")
  const { data, isLoading, isError } = useIdeReports(adminKey, filter)

  const counts = data?.counts
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0
  const filters: { key: IdeReportStatus | undefined; label: string; count?: number }[] = [
    { key: "OPEN", label: "Open", count: counts?.OPEN },
    { key: "IN_PROGRESS", label: "In progress", count: counts?.IN_PROGRESS },
    { key: "RESOLVED", label: "Resolved", count: counts?.RESOLVED },
    { key: "WONT_FIX", label: "Won't fix", count: counts?.WONT_FIX },
    { key: undefined, label: "All", count: total },
  ]

  return (
    <div className="space-y-5">
      <div className="flex gap-1 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filter === f.key ? "bg-primary/10 text-primary" : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {f.label}
            {f.count !== undefined && <span className="ml-1.5 text-white/40">{f.count}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-white/50">Loading reports…</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Couldn&apos;t load reports.</p>
      ) : !data?.reports.length ? (
        <div className="border border-white/10 bg-white/5 p-10 text-center">
          <Inbox className="text-white/30 mx-auto mb-2" size={32} />
          <p className="text-white/60 text-sm">No {filter ? STATUS_LABELS[filter].toLowerCase() : ""} reports</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.reports.map((report) => (
            <ReportCard key={report.id} report={report} adminKey={adminKey} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReportCard({ report, adminKey }: { report: IdeReport; adminKey: string }) {
  const update = useUpdateIdeReport(adminKey)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [notes, setNotes] = useState(report.adminNotes ?? "")
  const d = report.diagnostics ?? {}
  const reporter = report.user?.email ?? report.email ?? "unknown"

  const summary = [
    d.environment?.wallet?.network && `wallet on ${d.environment.wallet.network}`,
    d.compiler?.status && `compiler: ${d.compiler.status}${d.compiler.errors?.length ? ` (${d.compiler.errors.length} errors)` : ""}`,
    Array.isArray(d.console) && `${d.console.length} log lines`,
    Array.isArray(d.deployments) && d.deployments.length > 0 && `${d.deployments.length} deployments`,
    d.source && `source: ${d.source.file}`,
  ].filter(Boolean) as string[]

  return (
    <div className="border border-white/10 bg-white/5 p-1">
      <div className="border border-white/20 bg-dark p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <MessageSquareWarning size={16} className="text-primary" />
          <span className="text-xs px-2 py-0.5 rounded-sm bg-white/10 text-white/70">{CATEGORY_LABELS[report.category]}</span>
          <span className={`text-xs px-2 py-0.5 rounded-sm ${STATUS_STYLES[report.status]}`}>{STATUS_LABELS[report.status]}</span>
          <span className="text-xs text-white/50">{reporter}</span>
          <span className="text-xs text-white/30" title={report.createdAt}>
            {moment(report.createdAt).fromNow()}
          </span>
          <span className="ml-auto font-mono text-[11px] text-white/30">{report.id.slice(0, 8)}</span>
        </div>

        <p className="text-sm text-white/90 whitespace-pre-wrap break-words">{report.message}</p>

        {summary.length > 0 && <p className="text-xs text-white/40">{summary.join(" · ")}</p>}

        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white cursor-pointer"
        >
          {showDiagnostics ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Diagnostics
        </button>
        {showDiagnostics && (
          <pre className="max-h-80 overflow-auto bg-white/5 border border-white/10 p-3 text-[11px] font-mono text-white/70 whitespace-pre-wrap break-all">
            {JSON.stringify(report.diagnostics, null, 2)}
          </pre>
        )}

        <div className="flex flex-wrap items-start gap-2 pt-1">
          <Select<IdeReportStatus>
            size="small"
            value={report.status}
            onChange={(status) => update.mutate({ id: report.id, status })}
            options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value: value as IdeReportStatus, label }))}
            style={{ width: 140 }}
            disabled={update.isPending}
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={1}
            placeholder="Internal notes"
            className="flex-1 min-w-48 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 resize-y"
          />
          <button
            onClick={() => update.mutate({ id: report.id, adminNotes: notes })}
            disabled={update.isPending || notes === (report.adminNotes ?? "")}
            className="px-3 py-1 text-xs border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
          >
            Save notes
          </button>
        </div>
      </div>
    </div>
  )
}
