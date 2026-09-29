"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import {
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  GripHorizontal,
  Terminal,
} from "lucide-react"
import type { ConsoleLog } from "@/types/ide"
import { IconButton, ide } from "./ui"

interface ConsolePanelProps {
  logs: ConsoleLog[]
  onClear: () => void
  height: number
  onHeightChange: (height: number) => void
  minHeight?: number
  maxHeight?: number
}

const MIN_HEIGHT_DEFAULT = 32
const MAX_HEIGHT_DEFAULT = 400
const COLLAPSED_HEIGHT = 32
const DEFAULT_EXPANDED_HEIGHT = 150

export default function ConsolePanel({
  logs,
  onClear,
  height,
  onHeightChange,
  minHeight = MIN_HEIGHT_DEFAULT,
  maxHeight = MAX_HEIGHT_DEFAULT,
}: ConsolePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [preCollapseHeight, setPreCollapseHeight] = useState(DEFAULT_EXPANDED_HEIGHT)

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, isCollapsed])

  // Handle resize
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)

      const startY = e.clientY
      const startHeight = height

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = startY - moveEvent.clientY
        const newHeight = Math.min(maxHeight, Math.max(minHeight, startHeight + delta))
        onHeightChange(newHeight)

        if (newHeight > COLLAPSED_HEIGHT) {
          setIsCollapsed(false)
        }
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "ns-resize"
      document.body.style.userSelect = "none"
    },
    [height, minHeight, maxHeight, onHeightChange]
  )

  // Toggle collapse
  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      onHeightChange(preCollapseHeight)
      setIsCollapsed(false)
    } else {
      setPreCollapseHeight(height)
      onHeightChange(COLLAPSED_HEIGHT)
      setIsCollapsed(true)
    }
  }, [isCollapsed, height, preCollapseHeight, onHeightChange])

  // Maximize console
  const handleMaximize = useCallback(() => {
    if (height < maxHeight) {
      setPreCollapseHeight(height)
      onHeightChange(maxHeight)
      setIsCollapsed(false)
    } else {
      onHeightChange(preCollapseHeight || DEFAULT_EXPANDED_HEIGHT)
    }
  }, [height, maxHeight, preCollapseHeight, onHeightChange])

  const getLogIcon = (type: ConsoleLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" />
      case "error":
        return <AlertCircle size={12} className="text-red-500 shrink-0 mt-0.5" />
      case "warning":
        return <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
      default:
        return <Info size={12} className="text-white/40 shrink-0 mt-0.5" />
    }
  }

  const getLogColor = (type: ConsoleLog["type"]) => {
    switch (type) {
      case "success":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "warning":
        return "text-amber-500"
      default:
        return "text-white/70"
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col border-t border-white/10 relative"
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 left-0 right-0 h-1 cursor-ns-resize group flex items-center justify-center z-10 ${
          isResizing ? "bg-primary/30" : "hover:bg-primary/20"
        }`}
      >
        <div
          className={`w-12 h-0.5 rounded-full transition-colors ${
            isResizing ? "bg-primary" : "bg-white/20 group-hover:bg-primary/50"
          }`}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between h-8 px-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <GripHorizontal size={12} className="text-white/20" />
          <Terminal size={12} className="text-white/40" />
          <span className={`${ide.label} text-white/60`}>Console</span>
          {logs.length > 0 && (
            <span className="text-[10px] text-white/40 bg-white/10 px-1.5 py-0.5 rounded-sm">
              {logs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <IconButton onClick={onClear} title="Clear Console" aria-label="Clear Console" className="h-6! w-6!">
            <Trash2 size={12} />
          </IconButton>
          <IconButton
            onClick={handleMaximize}
            title={height >= maxHeight ? "Restore" : "Maximize"}
            aria-label={height >= maxHeight ? "Restore" : "Maximize"}
            className="h-6! w-6!"
          >
            {height >= maxHeight ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </IconButton>
          <IconButton
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand Console" : "Collapse Console"}
            aria-label={isCollapsed ? "Expand Console" : "Collapse Console"}
            className="h-6! w-6!"
          >
            {isCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </IconButton>
        </div>
      </div>

      {/* Logs */}
      {!isCollapsed && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto px-3 py-2 font-mono text-xs space-y-0.5"
        >
          {logs.length === 0 ? (
            <p className="text-white/30 font-sans py-2">
              Console output will appear here
            </p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-0.5">
                <span className="text-white/25 select-none shrink-0">
                  [{formatTimestamp(log.timestamp)}]
                </span>
                {getLogIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <span className={getLogColor(log.type)}>{log.message}</span>
                  {log.details && (
                    <pre className="text-white/40 mt-0.5 whitespace-pre-wrap break-all">
                      {log.details}
                    </pre>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
