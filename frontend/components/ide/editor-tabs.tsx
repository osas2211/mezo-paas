"use client"

import { X } from "lucide-react"
import type { OpenFile } from "@/types/ide"

interface EditorTabsProps {
  openFiles: OpenFile[]
  activeFileId: string | null
  onTabClick: (fileId: string) => void
  onTabClose: (fileId: string) => void
}

export default function EditorTabs({
  openFiles,
  activeFileId,
  onTabClick,
  onTabClose,
}: EditorTabsProps) {
  if (openFiles.length === 0) {
    return null
  }

  return (
    <div className="flex items-center bg-[#0d0d0d] border-b border-white/10 overflow-x-auto">
      {openFiles.map((file) => {
        const isActive = file.id === activeFileId
        return (
          <div
            key={file.id}
            className={`
              group flex items-center gap-2 px-3 py-2 border-r border-white/10 cursor-pointer
              transition-colors text-sm min-w-[120px] max-w-[200px]
              ${isActive
                ? "bg-[#0a0a0a] text-white border-b-2 border-b-primary -mb-px"
                : "text-white/60 hover:text-white hover:bg-white/5"
              }
            `}
            onClick={() => onTabClick(file.id)}
          >
            <span className="truncate flex-1">
              {file.isDirty && <span className="text-primary mr-1">*</span>}
              {file.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(file.id)
              }}
              className={`
                p-0.5 rounded transition-colors
                ${isActive
                  ? "hover:bg-white/10"
                  : "opacity-0 group-hover:opacity-100 hover:bg-white/10"
                }
              `}
            >
              <X size={12} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
