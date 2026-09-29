"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BookOpen,
  Check,
  Copy,
  Database,
  ExternalLink,
  FileCode,
  Download,
  Search,
  X,
} from "lucide-react"
import {
  CATEGORY_LABELS,
  PROTOCOLS,
  explorerAddressUrl,
  formatSignature,
  generateInterface,
  loadProtocolAbi,
  protocolAddress,
  searchProtocols,
  summarizeAbi,
  type LoadedAbi,
  type Protocol,
  type ProtocolCategory,
} from "@/lib/ide/protocol-registry"
import type { MezoNetwork } from "@/lib/ide/mezo-network"
import {
  EmptyState,
  IconButton,
  IdeButton,
  IdeModal,
  Notice,
  Spinner,
  StatusPill,
  UnderlineTabs,
  ide,
} from "./ui"

interface ProtocolRegistryProps {
  open: boolean
  onClose: () => void
  onImportAbi: (name: string, abi: any[], address?: string) => void
  onGenerateInterface: (name: string, code: string) => void
}

const CATEGORY_ORDER: ProtocolCategory[] = ["token", "oracle", "dex", "governance"]

export default function ProtocolRegistry({
  open,
  onClose,
  onImportAbi,
  onGenerateInterface,
}: ProtocolRegistryProps) {
  const [network, setNetwork] = useState<MezoNetwork>("testnet")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(PROTOCOLS[0].id)

  const filtered = useMemo(() => searchProtocols(query), [query])
  const selected = PROTOCOLS.find((p) => p.id === selectedId) ?? PROTOCOLS[0]

  // Keep the selection inside the filtered list
  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((p) => p.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  return (
    <IdeModal
      open={open}
      onClose={onClose}
      title="Mezo Protocol Registry"
      icon={<Database />}
      width={1000}
      bodyClassName="pt-3"
    >
      <div className="grid grid-cols-[260px_1fr] h-[62vh] min-h-[420px] border border-white/10">
        {/* Left: search + list */}
        <aside className="flex flex-col min-h-0 border-r border-white/10">
          <div className="p-3 space-y-3 border-b border-white/10">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search protocols"
                className={`${ide.input} pl-9 pr-8 py-1.5 text-xs`}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <NetworkSwitch value={network} onChange={setNetwork} />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <EmptyState title="No matches" caption="Try another name or category." className="py-8" />
            ) : (
              CATEGORY_ORDER.map((category) => {
                const items = filtered.filter((p) => p.category === category)
                if (items.length === 0) return null
                return (
                  <div key={category} className="mb-3">
                    <p className={`${ide.label} px-2 py-1.5`}>{CATEGORY_LABELS[category]}</p>
                    <ul className="space-y-0.5">
                      {items.map((p) => {
                        const active = p.id === selected.id
                        return (
                          <li key={p.id}>
                            <button
                              onClick={() => setSelectedId(p.id)}
                              className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-white/70 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {p.name}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* Right: details */}
        <ProtocolDetails
          key={`${selected.id}:${network}`}
          protocol={selected}
          network={network}
          onImportAbi={onImportAbi}
          onGenerateInterface={onGenerateInterface}
        />
      </div>
    </IdeModal>
  )
}

function NetworkSwitch({ value, onChange }: { value: MezoNetwork; onChange: (n: MezoNetwork) => void }) {
  return (
    <div className="grid grid-cols-2 border border-white/10 p-0.5 text-xs">
      {(["testnet", "mainnet"] as const).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`py-1.5 capitalize transition-colors cursor-pointer ${
            value === n ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function ProtocolDetails({
  protocol,
  network,
  onImportAbi,
  onGenerateInterface,
}: {
  protocol: Protocol
  network: MezoNetwork
  onImportAbi: (name: string, abi: any[], address?: string) => void
  onGenerateInterface: (name: string, code: string) => void
}) {
  const address = protocolAddress(protocol, network)
  const [loaded, setLoaded] = useState<LoadedAbi | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [copied, setCopied] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [tab, setTab] = useState<"reads" | "writes" | "events">("reads")

  useEffect(() => {
    let cancelled = false
    setLoaded(null)
    setError(null)
    loadProtocolAbi(protocol, network)
      .then((result) => !cancelled && setLoaded(result))
      .catch((e) => !cancelled && setError(e.message || "Failed to load ABI"))
    return () => {
      cancelled = true
    }
  }, [protocol, network, attempt])

  const summary = useMemo(() => (loaded ? summarizeAbi(loaded.abi) : null), [loaded])
  const fileBase = protocol.name.replace(/[^a-zA-Z0-9]/g, "")

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleInterface = () => {
    if (!loaded) return
    onGenerateInterface(`I${fileBase}.sol`, generateInterface(protocol.name, loaded.abi))
    setDone(`Created I${fileBase}.sol in your workspace`)
  }

  const handleImport = () => {
    if (!loaded) return
    onImportAbi(protocol.name, loaded.abi, address)
    setDone(`Created ${fileBase}ABI.ts in your workspace`)
  }

  const items = summary ? summary[tab] : []

  return (
    <section className="flex flex-col min-h-0">
      {/* Header */}
      <div className="p-5 space-y-4 border-b border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg text-white font-medium">{protocol.name}</h3>
              <StatusPill tone="neutral">{CATEGORY_LABELS[protocol.category]}</StatusPill>
            </div>
            <p className="text-sm text-white/60 mt-1">{protocol.description}</p>
          </div>
          <a
            href={protocol.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-primary"
          >
            <BookOpen size={13} />
            Docs
          </a>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 border border-white/10 bg-white/5 pl-3 pr-1 h-9">
          <span className={`${ide.label} shrink-0`}>{network}</span>
          <code className="flex-1 min-w-0 truncate font-mono text-xs text-white/80">{address}</code>
          <IconButton onClick={copyAddress} aria-label="Copy address" title="Copy address">
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </IconButton>
          <a
            href={explorerAddressUrl(address, network)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center h-7 w-7 text-white/50 hover:text-white hover:bg-white/5"
            aria-label="View on explorer"
            title="View on explorer"
          >
            <ExternalLink size={13} />
          </a>
        </div>

        {protocol.notes && protocol.notes.length > 0 && (
          <ul className="space-y-1 text-xs text-white/50">
            {protocol.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="text-white/20">—</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <IdeButton
            variant="primary"
            icon={<FileCode size={13} />}
            onClick={handleInterface}
            disabled={!loaded}
          >
            Generate Solidity interface
          </IdeButton>
          <IdeButton variant="secondary" icon={<Download size={13} />} onClick={handleImport} disabled={!loaded}>
            Import ABI
          </IdeButton>
          {done && <span className="text-xs text-green-500 ml-1">{done}</span>}
        </div>
      </div>

      {/* ABI */}
      <div className="flex-1 min-h-0 flex flex-col">
        {error ? (
          <div className="p-5">
            <Notice tone="error" title="Couldn't load the ABI">
              <p>{error}</p>
              <button
                onClick={() => setAttempt((n) => n + 1)}
                className="mt-2 underline underline-offset-2 cursor-pointer"
              >
                Retry
              </button>
            </Notice>
          </div>
        ) : !loaded || !summary ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-xs text-white/40">
            <Spinner size={14} /> Loading verified ABI…
          </div>
        ) : (
          <>
            <UnderlineTabs
              active={tab}
              onChange={setTab}
              items={[
                { key: "reads", label: `Read (${summary.reads.length})` },
                { key: "writes", label: `Write (${summary.writes.length})` },
                { key: "events", label: `Events (${summary.events.length})` },
              ]}
            />
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-5 text-xs text-white/40">None.</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {items.map((item: any, i: number) => (
                    <li key={`${item.name}-${i}`} className="px-5 py-2 font-mono text-[11px] text-white/70 break-all">
                      <span className="text-white">{item.name}</span>
                      <span className="text-white/50">{formatSignature(item).slice(item.name.length)}</span>
                      {item.stateMutability === "payable" && (
                        <StatusPill tone="warning" className="ml-2 align-middle">payable</StatusPill>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="px-5 py-2 border-t border-white/10 text-[10px] text-white/30">
              ABI source: {loaded.source}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
