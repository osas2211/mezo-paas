import React, { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000"

export default function BuildLogs({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<string[]>([])
  // We use this ref to anchor to the bottom of the log list
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socket: Socket = io(`${SOCKET_URL}/deployments`)

    socket.on("connect", () => {
      socket.emit("join-project-room", projectId)
    })

    // Listen for the live chunks of text from 'spawn'
    socket.on("build-log", (newLogChunk: string) => {
      // Add the new chunk to our array of logs
      setLogs((prevLogs) => [...prevLogs, newLogChunk])
    })

    return () => {
      socket.disconnect()
    }
  }, [projectId])

  // --- THE AUTO-SCROLL TRICK ---
  useEffect(() => {
    // Every time the 'logs' array changes, instantly scroll the dummy div into view
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  return (
    <div className="w-full max-w-3xl rounded-lg overflow-hidden border border-gray-700 bg-[#0d1117] shadow-xl">
      {/* Mac Window Header */}
      <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="ml-4 text-xs text-gray-400 font-mono">
          Build Logs: {projectId}
        </span>
      </div>

      {/* The actual terminal window */}
      <div className="h-96 overflow-y-auto p-4 font-mono text-sm text-green-400 whitespace-pre-wrap">
        {logs.length === 0 ? (
          <span className="text-gray-500">Waiting for build to start...</span>
        ) : (
          logs.map((log, index) => <span key={index}>{log}</span>)
        )}
        {/* This invisible div sits at the very bottom and pulls the scrollbar down */}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
