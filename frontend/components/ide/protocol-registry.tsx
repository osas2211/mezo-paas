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

interface ProtocolRegistryProps {
  open: boolean
  onClose: () => void
  onImportAbi: (name: string, abi: any[], address?: string) => void
  onGenerateInterface: (name: string, code: string) => void
  network: "testnet" | "mainnet"
}

const categoryIcons: Record<string, React.ReactNode> = {
  defi: <Zap size={14} className="text-primary" />,
  token: <Coins size={14} className="text-yellow-400" />,
  governance: <Shield size={14} className="text-blue-400" />,
  infrastructure: <Settings size={14} className="text-purple-400" />,
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  live: { bg: "bg-green-500/20", text: "text-green-400", label: "Live" },
  testnet: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Testnet" },
  "coming-soon": { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Coming Soon" },
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl mx-4 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-primary" />
            <h2 className="text-white text-base font-medium">Mezo Protocol Registry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-5 gap-4">
          {/* Notification */}
          {notification && (
            <div className={`px-3 py-2 rounded-lg text-sm ${
              notification.type === "success"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
            }`}>
              {notification.message}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Network indicator */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#111] rounded-lg border border-white/10">
            <span className="text-white/60 text-xs">Showing addresses for:</span>
            <span
              className={`text-xs font-medium ${
                network === "testnet" ? "text-blue-400" : "text-green-400"
              }`}
            >
              {network === "testnet" ? "Mezo Testnet (31611)" : "Mezo Mainnet (31612)"}
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveTab(category.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  activeTab === category.key
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Protocol List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredProtocols.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                No protocols found
              </div>
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
      </div>
    </div>
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
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111] hover:border-white/20 transition-colors">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {categoryIcons[protocol.category]}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{protocol.name}</span>
              <span className={`px-1.5 py-0.5 text-[10px] rounded ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <p className="text-white/50 text-xs mt-0.5 line-clamp-1">
              {protocol.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick address display */}
          <div className="flex items-center gap-2">
            <code className={`text-xs ${hasAddress ? "text-primary" : "text-white/30"}`}>
              {getAddressDisplay()}
            </code>
            {hasAddress && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCopyAddress()
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Copy address"
              >
                {isCopied ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Copy size={12} className="text-white/40" />
                )}
              </button>
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
          <div className="flex gap-2">
            <button
              onClick={onImportAbi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary text-xs font-medium rounded hover:bg-primary/30 transition-colors"
            >
              <Download size={12} />
              Import ABI
            </button>
            <button
              onClick={onGenerateInterface}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/80 text-xs font-medium rounded hover:bg-white/20 transition-colors"
            >
              <FileCode size={12} />
              Generate Interface
            </button>
            {protocol.docs && (
              <a
                href={protocol.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/80 text-xs font-medium rounded hover:bg-white/20 transition-colors"
              >
                <BookOpen size={12} />
                Docs
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          {/* Functions */}
          <div>
            <h4 className="text-white/60 text-xs font-medium mb-2 flex items-center gap-1">
              <Code size={12} />
              Functions
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {protocol.functions.map((fn) => (
                <div
                  key={fn.name}
                  className="flex items-center gap-2 px-2 py-1.5 bg-black/30 rounded text-xs group"
                  title={fn.description}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      fn.type === "read" ? "bg-blue-400" : "bg-orange-400"
                    }`}
                  />
                  <code className="text-white/80">{fn.name}</code>
                  <span className="text-white/30 cursor-help group-hover:text-white/50">?</span>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Guide */}
          {protocol.integrationGuide && (
            <div>
              <h4 className="text-white/60 text-xs font-medium mb-2 flex items-center gap-1">
                <BookOpen size={12} />
                Integration Guide
              </h4>
              <pre className="text-[11px] text-white/70 bg-black/40 p-3 rounded overflow-x-auto max-h-[200px] overflow-y-auto border border-white/5">
                {protocol.integrationGuide.trim()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
