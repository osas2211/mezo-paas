"use client"

import { X, FileCode } from "lucide-react"
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
    <div className="flex items-stretch h-9 border-b border-white/10 overflow-x-auto shrink-0">
      {openFiles.map((file) => {
        const isActive = file.id === activeFileId
        return (
          <div
            key={file.id}
            className={`group relative flex items-center gap-2 px-3 border-r border-white/10 cursor-pointer transition-colors text-xs min-w-[120px] max-w-[200px] ${
              isActive ? "bg-white/5 text-white" : "text-white/50 hover:text-white hover:bg-white/[0.03]"
            }`}
            onClick={() => onTabClick(file.id)}
          >
            <FileCode size={13} className={isActive ? "text-primary shrink-0" : "text-white/30 shrink-0"} />
            <span className="truncate flex-1">{file.name}</span>
            {file.isDirty && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 group-hover:hidden"
                title="Unsaved changes"
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(file.id)
              }}
              aria-label={`Close ${file.name}`}
              className={`p-0.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
                isActive ? "" : "opacity-0 group-hover:opacity-100"
              } ${file.isDirty ? "hidden group-hover:block" : ""}`}
            >
              <X size={12} />
            </button>
            {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </div>
        )
      })}
    </div>
  )
}
