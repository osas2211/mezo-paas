import React from "react"
import { ProjectI } from "@/types/project"
import { Terminal, Download, Search, Settings2 } from "lucide-react"

export default function LogsTab({ project }: { project: ProjectI }) {
  // Mock logs
  const logs = [
    { ts: "12:04:01", level: "info", msg: "Starting deployment for a1b2c3d..." },
    { ts: "12:04:03", level: "info", msg: "Cloning repository MezoDeploy..." },
    { ts: "12:04:05", level: "info", msg: "Installing dependencies using npm..." },
    { ts: "12:04:15", level: "info", msg: "added 124 packages, and audited 125 packages in 10s" },
    { ts: "12:04:16", level: "warn", msg: "1 moderate severity vulnerability found. Run `npm audit` for details." },
    { ts: "12:04:18", level: "info", msg: "Building Next.js application..." },
    { ts: "12:04:45", level: "info", msg: "Route (app)                              Size     First Load JS" },
    { ts: "12:04:45", level: "info", msg: "┌ ○ /                                    1.2 kB         84.2 kB" },
    { ts: "12:04:45", level: "info", msg: "├ ○ /_not-found                          875 B          83.9 kB" },
    { ts: "12:04:46", level: "info", msg: "Uploading build artifacts to edge network..." },
    { ts: "12:04:48", level: "info", msg: "Success! Deployment ready." },
    { ts: "12:04:48", level: "info", msg: `Assigned domain: ${project.name}.mezo.app` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Runtime Logs</h2>
          <p className="text-white/50 text-sm">View logs from your latest deployment and runtime.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Filter logs..." 
              className="w-full sm:w-48 bg-[#0a0a0a] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="p-2 border border-white/10 text-white/60 hover:text-white rounded-md bg-[#0a0a0a] transition-colors">
            <Settings2 size={16} />
          </button>
          <button className="p-2 border border-white/10 text-white/60 hover:text-white rounded-md bg-[#0a0a0a] transition-colors">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/40 ml-4">
              <Terminal size={14} /> main
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>
        </div>

        {/* Log Window */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-[13px] leading-relaxed">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 hover:bg-white/[0.02] px-2 py-0.5 rounded transition-colors">
              <span className="text-white/30 shrink-0 select-none">{log.ts}</span>
              <span className={`shrink-0 w-12 select-none ${
                log.level === 'warn' ? 'text-amber-400' :
                log.level === 'error' ? 'text-red-400' :
                'text-blue-400'
              }`}>
                [{log.level}]
              </span>
              <span className={`whitespace-pre-wrap break-all ${
                log.level === 'warn' ? 'text-amber-200' :
                log.level === 'error' ? 'text-red-300' :
                'text-zinc-300'
              }`}>
                {log.msg}
              </span>
            </div>
          ))}
          <div className="flex gap-4 px-2 pt-2 animate-pulse">
            <span className="text-white/30 shrink-0">12:05:00</span>
            <span className="w-2 h-4 bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  )
}
