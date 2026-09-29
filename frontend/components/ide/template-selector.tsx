"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Check, Copy, FileCode, FilePlus, Search, X } from "lucide-react"
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  templateContractName,
  uniqueFileName,
  type ContractTemplate,
  type TemplateCategory,
} from "@/lib/ide/templates"
import { ChipTabs, EmptyState, IdeButton, IdeModal, StatusPill, ide, type Tone } from "./ui"

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (template: ContractTemplate, fileName: string) => void
  /** Names of files already in the workspace, to avoid clashes */
  existingFileNames?: string[]
}

const LEVEL_TONE: Record<ContractTemplate["level"], Tone> = {
  Beginner: "success",
  Intermediate: "neutral",
  Advanced: "warning",
}

type Filter = TemplateCategory | "all"

export default function TemplateSelector({
  open,
  onClose,
  onSelect,
  existingFileNames = [],
}: TemplateSelectorProps) {
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(TEMPLATES[0].id)
  const [fileName, setFileName] = useState("")
  const [copied, setCopied] = useState(false)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TEMPLATES.filter(
      (t) =>
        (filter === "all" || t.category === filter) &&
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.features.some((f) => f.toLowerCase().includes(q)))
    )
  }, [filter, query])

  const selected = visible.find((t) => t.id === selectedId) ?? visible[0] ?? null

  // Default file name: the contract's own name, made unique in the workspace
  useEffect(() => {
    if (selected) setFileName(uniqueFileName(templateContractName(selected), existingFileNames))
    setCopied(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, open])

  const trimmedName = fileName.trim()
  const finalName = trimmedName ? (trimmedName.endsWith(".sol") ? trimmedName : `${trimmedName}.sol`) : ""
  const nameTaken = existingFileNames.some((n) => n.toLowerCase() === finalName.toLowerCase())
  const nameInvalid = !finalName || !/^[\w.-]+\.sol$/.test(finalName)
  const canCreate = !!selected && !nameInvalid && !nameTaken

  const create = () => {
    if (!selected || !canCreate) return
    onSelect(selected, finalName)
    onClose()
  }

  const copyCode = async () => {
    if (!selected) return
    await navigator.clipboard.writeText(selected.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: TEMPLATES.length }
    for (const t of TEMPLATES) c[t.category] = (c[t.category] ?? 0) + 1
    return c
  }, [])

  const filterItems: { key: Filter; label: ReactNode }[] = [
    { key: "all", label: <>All <span className="text-white/30">{counts.all}</span></> },
    ...TEMPLATE_CATEGORIES.filter((c) => counts[c.key]).map((c) => ({
      key: c.key as Filter,
      label: (
        <>
          {c.label} <span className="text-white/30">{counts[c.key]}</span>
        </>
      ),
    })),
  ]

  return (
    <IdeModal open={open} onClose={onClose} title="Create from Template" icon={<FileCode />} width={1040} bodyClassName="pt-3">
      <div className="space-y-3">
        {/* Search + filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates"
              className={`${ide.input} pl-9 pr-8 py-1.5 text-xs`}
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <ChipTabs items={filterItems} active={filter} onChange={setFilter} className="min-w-0" />
        </div>

        <div className="grid grid-cols-[280px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] h-[calc(72vh-4.5rem)] min-h-[320px] overflow-hidden border border-white/10">
          {/* List */}
          <ul className="min-h-0 overflow-y-auto border-r border-white/10 p-2 space-y-0.5">
            {visible.length === 0 ? (
              <EmptyState title="No matching templates" caption="Try a different search or category." className="py-10" />
            ) : (
              visible.map((t) => {
                const active = t.id === selected?.id
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelectedId(t.id)}
                      onDoubleClick={() => {
                        setSelectedId(t.id)
                        onSelect(t, uniqueFileName(templateContractName(t), existingFileNames))
                        onClose()
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                        active ? "bg-primary/10" : "hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${active ? "text-primary" : "text-white"}`}>{t.name}</span>
                        <StatusPill tone={LEVEL_TONE[t.level]}>{t.level}</StatusPill>
                      </span>
                      <span className="block text-xs text-white/40 mt-0.5 line-clamp-2">{t.description}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>

          {/* Details */}
          {selected ? (
            <div className="flex flex-col min-h-0 min-w-0">
              <div className="flex-1 overflow-y-auto">
                <div className="p-5 space-y-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg text-white font-medium">{selected.name}</h3>
                      <StatusPill tone={LEVEL_TONE[selected.level]}>{selected.level}</StatusPill>
                    </div>
                    <p className="text-sm text-white/60 mt-1">{selected.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {selected.features.map((f) => (
                      <span key={f} className="text-[11px] text-white/70 border border-white/10 bg-white/5 px-2 py-0.5">
                        {f}
                      </span>
                    ))}
                  </div>

                  <section className="space-y-1.5">
                    <h4 className={ide.label}>Constructor arguments</h4>
                    {selected.params.length === 0 ? (
                      <p className="text-xs text-white/50">None — deploys with one click.</p>
                    ) : (
                      <dl className="border border-white/10 divide-y divide-white/10">
                        {selected.params.map((p) => (
                          <div key={p.name} className="grid grid-cols-[160px_1fr] gap-3 px-3 py-2 text-xs">
                            <dt className="font-mono min-w-0">
                              <span className="text-white">{p.name}</span>
                              <span className="block text-white/40">{p.type}</span>
                            </dt>
                            <dd className="text-white/60 break-words">{p.hint}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </section>

                  {selected.afterDeploy.length > 0 && (
                    <section className="space-y-1.5">
                      <h4 className={ide.label}>After deploying</h4>
                      <ol className="space-y-1 text-xs text-white/60 list-decimal list-inside">
                        {selected.afterDeploy.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </section>
                  )}
                </div>

                <CodePreview code={selected.content} />
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 p-3 border-t border-white/10">
                <div className="flex-1 min-w-0">
                  <input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && create()}
                    aria-label="File name"
                    className={`${ide.inputMono} py-1.5 ${nameTaken || (trimmedName && nameInvalid) ? "border-red-500/50" : ""}`}
                  />
                  {(nameTaken || (trimmedName && nameInvalid)) && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {nameTaken ? "A file with this name already exists." : "Use letters, numbers, dots, dashes or underscores."}
                    </p>
                  )}
                </div>
                <IdeButton
                  variant="secondary"
                  size="md"
                  className="shrink-0"
                  icon={copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  onClick={copyCode}
                >
                  {copied ? "Copied" : "Copy code"}
                </IdeButton>
                <IdeButton variant="primary" size="md" className="shrink-0" icon={<FilePlus size={14} />} onClick={create} disabled={!canCreate}>
                  Create file
                </IdeButton>
              </div>
            </div>
          ) : (
            <EmptyState title="Select a template" className="h-full" />
          )}
        </div>
      </div>
    </IdeModal>
  )
}

/* ------------------------------------------------------------------ */
/* Lightweight Solidity highlighting for the read-only preview          */
/* ------------------------------------------------------------------ */

const KEYWORDS = new Set([
  "pragma", "solidity", "import", "contract", "interface", "library", "abstract", "is", "function", "modifier",
  "event", "emit", "struct", "enum", "mapping", "constructor", "returns", "return", "if", "else", "for", "while",
  "require", "revert", "public", "external", "internal", "private", "view", "pure", "payable", "memory",
  "calldata", "storage", "override", "virtual", "constant", "immutable", "indexed", "using", "new", "delete",
  "error", "unchecked", "receive", "fallback", "true", "false",
])
const TYPE = /^(u?int\d*|address|bool|string|bytes\d*)$/

function highlightLine(line: string): ReactNode[] {
  const trimmed = line.trimStart()
  if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
    return [<span key="c" className="text-white/30 italic">{line}</span>]
  }
  const commentAt = line.indexOf("//")
  const code = commentAt >= 0 ? line.slice(0, commentAt) : line
  const parts = code.split(/("[^"]*"|\b\w+\b)/g)
  const nodes = parts.map((part, i) => {
    if (part.startsWith('"')) return <span key={i} className="text-primary/70">{part}</span>
    if (KEYWORDS.has(part)) return <span key={i} className="text-primary">{part}</span>
    if (TYPE.test(part)) return <span key={i} className="text-white">{part}</span>
    if (/^\d/.test(part)) return <span key={i} className="text-white">{part}</span>
    return <span key={i}>{part}</span>
  })
  if (commentAt >= 0) nodes.push(<span key="tc" className="text-white/30 italic">{line.slice(commentAt)}</span>)
  return nodes
}

function CodePreview({ code }: { code: string }) {
  const lines = code.replace(/\n$/, "").split("\n")
  return (
    <div className="p-5 space-y-1.5 min-w-0">
      <h4 className={ide.label}>Source · {lines.length} lines</h4>
      <pre className="bg-white/[0.03] border border-white/10 overflow-x-auto text-[11.5px] leading-[1.6] font-mono text-white/70 py-3">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="select-none text-white/20 text-right w-10 pr-3 shrink-0">{i + 1}</span>
            <span className="whitespace-pre pr-4">{highlightLine(line)}</span>
          </div>
        ))}
      </pre>
    </div>
  )
}
