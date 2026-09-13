"use client"

import { Tooltip, Dropdown, MenuProps } from "antd"
import {
  FilePlus,
  Save,
  Play,
  Rocket,
  Settings,
  FileCode,
  Download,
  Upload,
  Sun,
  Moon,
  Database,
  Zap,
  Share2,
} from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

interface IDEToolbarProps {
  onNewFile: () => void
  onSave: () => void
  onCompile: () => void
  onTemplates: () => void
  onProtocolRegistry: () => void
  onSimulator: () => void
  onShare: () => void
  onSettings: () => void
  isDirty: boolean
  isCompiling: boolean
  hasActiveFile: boolean
  theme: "dark" | "light"
  onThemeToggle: () => void
}

export default function IDEToolbar({
  onNewFile,
  onSave,
  onCompile,
  onTemplates,
  onProtocolRegistry,
  onSimulator,
  onShare,
  onSettings,
  isDirty,
  isCompiling,
  hasActiveFile,
  theme,
  onThemeToggle,
}: IDEToolbarProps) {
  const fileMenuItems: MenuProps["items"] = [
    {
      key: "new",
      label: "New File",
      icon: <FilePlus size={14} />,
      onClick: onNewFile,
    },
    {
      key: "template",
      label: "New from Template",
      icon: <FileCode size={14} />,
      onClick: onTemplates,
    },
    { type: "divider" },
    {
      key: "save",
      label: "Save",
      icon: <Save size={14} />,
      onClick: onSave,
      disabled: !isDirty,
    },
  ]

  return (
    <div className="h-10 flex items-center justify-between px-3 bg-[#0d0d0d] border-b border-white/10">
      {/* Left Actions */}
      <div className="flex items-center gap-1">
        {/* File Menu */}
        <Dropdown menu={{ items: fileMenuItems }} trigger={["click"]}>
          <button className="flex items-center gap-1.5 px-2 py-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors text-sm">
            <FilePlus size={14} />
            <span>File</span>
          </button>
        </Dropdown>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Save */}
        <Tooltip title="Save (Ctrl+S)">
          <button
            onClick={onSave}
            disabled={!isDirty}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Save size={16} />
          </button>
        </Tooltip>

        {/* Compile */}
        <Tooltip title="Compile (Ctrl+B)">
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="p-1.5 text-white/60 hover:text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
          >
            <Play size={16} />
          </button>
        </Tooltip>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Protocol Registry */}
        <Tooltip title="Mezo Protocol Registry">
          <button
            onClick={onProtocolRegistry}
            className="flex items-center gap-1.5 px-2 py-1 text-white/60 hover:text-primary hover:bg-primary/10 rounded transition-colors text-xs"
          >
            <Database size={14} />
            <span>Protocols</span>
          </button>
        </Tooltip>

        {/* Transaction Simulator */}
        <Tooltip title="Simulate transactions without gas">
          <button
            onClick={onSimulator}
            className="flex items-center gap-1.5 px-2 py-1 text-white/60 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition-colors text-xs"
          >
            <Zap size={14} />
            <span>Simulate</span>
          </button>
        </Tooltip>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Share */}
        <Tooltip title="Share this contract via URL">
          <button
            onClick={onShare}
            disabled={!hasActiveFile}
            className="flex items-center gap-1.5 px-2 py-1 text-white/60 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
        </Tooltip>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Tooltip title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          <button
            onClick={onThemeToggle}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </Tooltip>

        {/* Settings */}
        <Tooltip title="Settings">
          <button
            onClick={onSettings}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <Settings size={16} />
          </button>
        </Tooltip>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Wallet */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted
            const connected = ready && account && chain

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="px-3 py-1 bg-primary text-dark text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        Connect
                      </button>
                    )
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="px-3 py-1 bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        Wrong Network
                      </button>
                    )
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        className="px-2 py-1 bg-white/10 text-white/70 text-xs hover:bg-white/20 transition-colors rounded"
                      >
                        {chain.name}
                      </button>
                      <button
                        onClick={openAccountModal}
                        className="px-2 py-1 bg-white/10 text-white/70 text-xs hover:bg-white/20 transition-colors rounded font-mono"
                      >
                        {account.displayName}
                      </button>
                    </div>
                  )
                })()}
              </div>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  )
}
