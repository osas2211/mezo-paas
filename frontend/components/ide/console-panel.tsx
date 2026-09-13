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
} from "lucide-react"
import type { ConsoleLog } from "@/types/ide"

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
        return <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
      case "error":
        return <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
      case "warning":
        return <AlertTriangle size={12} className="text-yellow-500 flex-shrink-0" />
      default:
        return <Info size={12} className="text-blue-400 flex-shrink-0" />
    }
  }

  const getLogColor = (type: ConsoleLog["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
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
      className="h-full flex flex-col bg-[#0a0a0a] border-t border-white/10 relative"
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 left-0 right-0 h-1 cursor-ns-resize group flex items-center justify-center z-10 ${
          isResizing ? "bg-primary/30" : "hover:bg-primary/20"
        }`}
      >
        <div
          className={`w-12 h-1 rounded-full transition-colors ${
            isResizing ? "bg-primary" : "bg-white/20 group-hover:bg-primary/50"
          }`}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <GripHorizontal size={12} className="text-white/20" />
          <span className="text-white/60 text-xs font-medium">Console</span>
          {logs.length > 0 && (
            <span className="text-white/40 text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
              {logs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Clear Console"
          >
            <Trash2 size={12} className="text-white/40" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title={height >= maxHeight ? "Restore" : "Maximize"}
          >
            {height >= maxHeight ? (
              <Minimize2 size={12} className="text-white/40" />
            ) : (
              <Maximize2 size={12} className="text-white/40" />
            )}
          </button>
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title={isCollapsed ? "Expand Console" : "Collapse Console"}
          >
            {isCollapsed ? (
              <ChevronUp size={12} className="text-white/40" />
            ) : (
              <ChevronDown size={12} className="text-white/40" />
            )}
          </button>
        </div>
      </div>

      {/* Logs */}
      {!isCollapsed && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto p-2 font-mono text-xs space-y-1"
        >
          {logs.length === 0 ? (
            <p className="text-white/30 text-center py-4">
              Console output will appear here
            </p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-0.5">
                <span className="text-white/30 select-none">
                  [{formatTimestamp(log.timestamp)}]
                </span>
                {getLogIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <span className={getLogColor(log.type)}>{log.message}</span>
                  {log.details && (
                    <pre className="text-white/50 mt-0.5 whitespace-pre-wrap break-all">
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
