"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Database,
  Search,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Code,
  ChevronDown,
  ChevronRight,
  Zap,
  Coins,
  Shield,
  Settings,
  FileCode,
  Download,
  X,
} from "lucide-react"
import {
  PROTOCOLS,
  searchProtocols,
  generateInterface,
  type Protocol,
} from "@/lib/ide/protocol-registry"
import {
  ide,
  ChipTabs,
  EmptyState,
  IconButton,
  IdeButton,
  IdeModal,
  Notice,
  StatusPill,
  type Tone,
} from "./ui"

interface ProtocolRegistryProps {
  open: boolean
  onClose: () => void
  onImportAbi: (name: string, abi: any[], address?: string) => void
  onGenerateInterface: (name: string, code: string) => void
  network: "testnet" | "mainnet"
}

const categoryIconClass = "text-white/40 group-hover:text-primary transition-colors"

const categoryIcons: Record<string, React.ReactNode> = {
  defi: <Zap size={14} className={categoryIconClass} />,
  token: <Coins size={14} className={categoryIconClass} />,
  governance: <Shield size={14} className={categoryIconClass} />,
  infrastructure: <Settings size={14} className={categoryIconClass} />,
}

const statusColors: Record<string, { tone: Tone; label: string }> = {
  live: { tone: "success", label: "Live" },
  testnet: { tone: "warning", label: "Testnet" },
  "coming-soon": { tone: "neutral", label: "Coming Soon" },
}

export default function ProtocolRegistry({
  open,
  onClose,
  onImportAbi,
  onGenerateInterface,
  network,
}: ProtocolRegistryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [notification, setNotification] = useState<{ type: "success" | "warning"; message: string } | null>(null)

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const filteredProtocols = useMemo(() => {
    let protocols = searchQuery ? searchProtocols(searchQuery) : PROTOCOLS

    if (activeTab !== "all") {
      protocols = protocols.filter((p) => p.category === activeTab)
    }

    return protocols
  }, [searchQuery, activeTab])

  const handleCopyAddress = async (protocol: Protocol) => {
    const address = protocol.addresses[network]
    if (!address || address === "0x0000000000000000000000000000000000000000") {
      setNotification({ type: "warning", message: `No ${network} address available for ${protocol.name}` })
      return
    }

    await navigator.clipboard.writeText(address)
    setCopiedAddress(protocol.id)
    setNotification({ type: "success", message: "Address copied!" })
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const handleImportAbi = (protocol: Protocol) => {
    const address = protocol.addresses[network]
    const validAddress =
      address && address !== "0x0000000000000000000000000000000000000000"
        ? address
        : undefined
    onImportAbi(protocol.name, protocol.abi, validAddress)
    setNotification({ type: "success", message: `Imported ${protocol.name} ABI` })
    onClose()
  }

  const handleGenerateInterface = (protocol: Protocol) => {
    const interfaceCode = generateInterface(protocol)
    onGenerateInterface(`I${protocol.name.replace(/[^a-zA-Z0-9]/g, "")}.sol`, interfaceCode)
    setNotification({ type: "success", message: `Generated ${protocol.name} interface` })
    onClose()
  }

  const getAddressDisplay = (protocol: Protocol) => {
    const address = protocol.addresses[network]
    if (!address || address === "0x0000000000000000000000000000000000000000") {
      return "Not deployed"
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const categories = [
    { key: "all", label: "All", icon: <Database size={14} /> },
    { key: "defi", label: "DeFi", icon: <Zap size={14} /> },
    { key: "token", label: "Tokens", icon: <Coins size={14} /> },
    { key: "governance", label: "Governance", icon: <Shield size={14} /> },
  ]

  return (
    <IdeModal
      open={open}
      onClose={onClose}
      title="Mezo Protocol Registry"
      icon={<Database />}
      width={880}
    >
      {/* Content */}
      <div className="flex flex-col gap-4">
        {/* Notification */}
        {notification && (
          <Notice tone={notification.type === "success" ? "primary" : "warning"}>
            {notification.message}
          </Notice>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search protocols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${ide.input} pl-10 pr-10 py-2.5`}
          />
          {searchQuery && (
            <IconButton
              onClick={() => setSearchQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <X size={14} />
            </IconButton>
          )}
        </div>

        {/* Network indicator */}
        <div className={`${ide.card} flex items-center justify-between px-3 py-2`}>
          <span className={ide.label}>Showing addresses for:</span>
          <StatusPill tone={network === "testnet" ? "warning" : "primary"}>
            {network === "testnet" ? "Mezo Testnet (31611)" : "Mezo Mainnet (31612)"}
          </StatusPill>
        </div>

        {/* Category Tabs */}
        <ChipTabs
          items={categories}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* Protocol List */}
        <div className="space-y-2">
          {filteredProtocols.length === 0 ? (
            <EmptyState
              icon={<Database size={24} />}
              title="No protocols found"
            />
          ) : (
            filteredProtocols.map((protocol) => (
              <ProtocolCard
                key={protocol.id}
                protocol={protocol}
                network={network}
                expanded={expandedProtocol === protocol.id}
                onToggle={() =>
                  setExpandedProtocol(
                    expandedProtocol === protocol.id ? null : protocol.id
                  )
                }
                onCopyAddress={() => handleCopyAddress(protocol)}
                onImportAbi={() => handleImportAbi(protocol)}
                onGenerateInterface={() => handleGenerateInterface(protocol)}
                isCopied={copiedAddress === protocol.id}
                getAddressDisplay={() => getAddressDisplay(protocol)}
              />
            ))
          )}
        </div>
      </div>
    </IdeModal>
  )
}

interface ProtocolCardProps {
  protocol: Protocol
  network: "testnet" | "mainnet"
  expanded: boolean
  onToggle: () => void
  onCopyAddress: () => void
  onImportAbi: () => void
  onGenerateInterface: () => void
  isCopied: boolean
  getAddressDisplay: () => string
}

function ProtocolCard({
  protocol,
  network,
  expanded,
  onToggle,
  onCopyAddress,
  onImportAbi,
  onGenerateInterface,
  isCopied,
  getAddressDisplay,
}: ProtocolCardProps) {
  const status = statusColors[protocol.status]
  const address = protocol.addresses[network]
  const hasAddress =
    address && address !== "0x0000000000000000000000000000000000000000"

  return (
    <div className={`${ide.row} overflow-hidden group`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between gap-3 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          {categoryIcons[protocol.category]}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium group-hover:text-primary transition-colors">
                {protocol.name}
              </span>
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </div>
            <p className="text-white/50 text-sm mt-0.5 line-clamp-1">
              {protocol.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick address display */}
          <div className="flex items-center gap-1">
            <code className={`text-xs font-mono ${hasAddress ? "text-primary" : "text-white/30"}`}>
              {getAddressDisplay()}
            </code>
            {hasAddress && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  onCopyAddress()
                }}
                title="Copy address"
              >
                {isCopied ? (
                  <Check size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
              </IconButton>
            )}
          </div>
          {expanded ? (
            <ChevronDown size={16} className="text-white/40" />
          ) : (
            <ChevronRight size={16} className="text-white/40" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/10 p-3 space-y-4">
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <IdeButton
              variant="primary"
              onClick={onImportAbi}
              icon={<Download size={12} />}
            >
              Import ABI
            </IdeButton>
            <IdeButton
              variant="secondary"
              onClick={onGenerateInterface}
              icon={<FileCode size={12} />}
            >
              Generate Interface
            </IdeButton>
            {protocol.docs && (
              <a
                href={protocol.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-primary hover:underline"
              >
                <BookOpen size={12} />
                Docs
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          {/* Functions */}
          <div>
            <h4 className={`${ide.label} mb-2 flex items-center gap-1`}>
              <Code size={12} />
              Functions
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {protocol.functions.map((fn) => (
                <div
                  key={fn.name}
                  className="flex items-center gap-2 px-2 py-1.5 bg-white/5 border border-white/10 text-xs group/fn"
                  title={fn.description}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      fn.type === "read" ? "bg-primary" : "bg-amber-500"
                    }`}
                  />
                  <code className="font-mono text-white/80">{fn.name}</code>
                  <span className="text-white/30 cursor-help group-hover/fn:text-white/50">?</span>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Guide */}
          {protocol.integrationGuide && (
            <div>
              <h4 className={`${ide.label} mb-2 flex items-center gap-1`}>
                <BookOpen size={12} />
                Integration Guide
              </h4>
              <pre className={`${ide.codeBlock} text-[11px] max-h-[200px]`}>
                {protocol.integrationGuide.trim()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
