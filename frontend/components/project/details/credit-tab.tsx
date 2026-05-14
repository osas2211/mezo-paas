import React from "react"
import { ProjectI } from "@/types/project"
import { CreditCard, Zap, Coins } from "lucide-react"

export default function CreditTab({ project }: { project: ProjectI }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Credit Consumption</h2>
          <p className="text-white/50 text-sm">Track your compute credits and bandwidth usage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
          
          <Coins size={32} className="text-primary mb-4 relative z-10" />
          <h3 className="text-sm font-medium text-white/70 mb-2 relative z-10">Current Balance</h3>
          <div className="flex items-end gap-1 relative z-10">
            <span className="text-5xl font-light text-white tracking-tight">2,450</span>
            <span className="text-xl text-white/40 font-medium mb-1">cr</span>
          </div>
          <button className="mt-8 px-6 py-2 bg-white text-black font-medium text-sm rounded-full hover:bg-white/90 transition-colors">
            Buy Credits
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Compute Usage</span>
              <span className="text-sm text-white/50">142h / 500h</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-primary rounded-full" style={{ width: '28%' }} />
            </div>
            <p className="text-xs text-white/40">~28% of monthly allowance used</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Bandwidth Usage</span>
              <span className="text-sm text-white/50">4.2GB / 100GB</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: '4%' }} />
            </div>
            <p className="text-xs text-white/40">~4% of monthly allowance used</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white/90 mb-4">Recent Charges</h3>
        <div className="divide-y divide-white/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-md">
                  <Zap size={14} className="text-white/60" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Automated Build</p>
                  <p className="text-xs text-white/40">Commit a1b2c3d</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">-5 cr</p>
                <p className="text-xs text-white/40">May {10 - i}, 2026</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
