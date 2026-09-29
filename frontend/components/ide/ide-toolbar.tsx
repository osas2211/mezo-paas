"use client"

import { Tooltip, Dropdown, MenuProps } from "antd"
import { FilePlus, Save, Play, FileCode, Database, Zap, Share2, ChevronDown } from "lucide-react"
import { IconButton, IdeButton } from "./ui"

interface IDEToolbarProps {
  onNewFile: () => void
  onSave: () => void
  onCompile: () => void
  onTemplates: () => void
  onProtocolRegistry: () => void
  onSimulator: () => void
  onShare: () => void
  isDirty: boolean
  isCompiling: boolean
  hasActiveFile: boolean
}

const Divider = () => <div className="w-px h-4 bg-white/10 mx-1.5" />

export default function IDEToolbar({
  onNewFile,
  onSave,
  onCompile,
  onTemplates,
  onProtocolRegistry,
  onSimulator,
  onShare,
  isDirty,
  isCompiling,
  hasActiveFile,
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
    <div className="h-11 flex items-center justify-between px-2 border-b border-white/10 shrink-0">
      {/* Left Actions */}
      <div className="flex items-center">
        <Dropdown menu={{ items: fileMenuItems }} trigger={["click"]}>
          <IdeButton variant="ghost" size="xs" icon={<FilePlus size={14} />}>
            File
            <ChevronDown size={12} className="text-white/40" />
          </IdeButton>
        </Dropdown>

        <Divider />

        <Tooltip title="Save (Ctrl+S)">
          <IconButton onClick={onSave} disabled={!isDirty} aria-label="Save">
            <Save size={15} />
          </IconButton>
        </Tooltip>

        <Divider />

        <Tooltip title="Mezo Protocol Registry">
          <IdeButton variant="ghost" size="xs" icon={<Database size={14} />} onClick={onProtocolRegistry}>
            Protocols
          </IdeButton>
        </Tooltip>

        <Tooltip title="Simulate transactions without gas">
          <IdeButton variant="ghost" size="xs" icon={<Zap size={14} />} onClick={onSimulator}>
            Simulate
          </IdeButton>
        </Tooltip>

        <Tooltip title="Share this contract via URL">
          <IdeButton
            variant="ghost"
            size="xs"
            icon={<Share2 size={14} />}
            onClick={onShare}
            disabled={!hasActiveFile}
          >
            Share
          </IdeButton>
        </Tooltip>
      </div>

      {/* Primary Action */}
      <Tooltip title="Compile (Ctrl+B)">
        <IdeButton
          variant="primary"
          size="xs"
          icon={<Play size={13} />}
          onClick={onCompile}
          loading={isCompiling}
          disabled={!hasActiveFile}
        >
          {isCompiling ? "Compiling..." : "Compile"}
        </IdeButton>
      </Tooltip>
    </div>
  )
}
