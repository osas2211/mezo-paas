import React, { useState } from "react"
import { ProjectI } from "@/types/project"
import { Plus, Eye, EyeOff, MoreVertical, Search, Lock } from "lucide-react"

export default function EnvVarsTab({ project }: { project: ProjectI }) {
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})

  const toggleValue = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Placeholder data as requested
  const mockEnvVars = [
    { key: "DATABASE_URL", value: "postgresql://user:password@localhost:5432/db", target: ["Production", "Preview", "Development"] },
    { key: "API_SECRET_KEY", value: "sk_live_1234567890abcdef", target: ["Production"] },
    { key: "NEXT_PUBLIC_SITE_URL", value: `https://${project.name}.mezo.app`, target: ["Production", "Preview", "Development"] },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Environment Variables</h2>
        <p className="text-white/50 text-sm">
          Manage environment variables for your deployments. These are securely encrypted in our database.
        </p>
      </div>

      {/* Add New Variable Form (UI Only) */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white mb-4">Add New Variable</h3>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium ml-1">Key</label>
            <input 
              type="text" 
              placeholder="e.g. DATABASE_URL" 
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium ml-1">Value</label>
            <input 
              type="password" 
              placeholder="e.g. postgresql://..." 
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5 md:pt-[22px]">
            <button className="h-[42px] px-6 bg-white text-black font-medium text-sm rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Existing Variables List */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Search variables..." 
              className="bg-black border border-white/10 rounded-md pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors w-64"
            />
          </div>
          <button className="text-xs font-medium text-white/60 hover:text-white border border-white/10 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors">
            Reveal All
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {mockEnvVars.map((env, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-sm font-semibold text-white truncate">{env.key}</span>
                  <div className="flex items-center gap-1">
                    {env.target.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={12} className="text-white/30" />
                  <span className="font-mono text-xs text-white/50 truncate">
                    {showValues[env.key] ? env.value : '••••••••••••••••••••••••'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => toggleValue(env.key)}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  {showValues[env.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
