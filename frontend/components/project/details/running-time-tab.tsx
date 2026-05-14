import React from "react"
import { ProjectI } from "@/types/project"
import { Clock, Activity, ArrowUpRight } from "lucide-react"

export default function RunningTimeTab({ project }: { project: ProjectI }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Running Time</h2>
          <p className="text-white/50 text-sm">Monitor container uptime and compute usage metrics.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/40">Period:</span>
          <select className="bg-[#0a0a0a] border border-white/10 text-white rounded-md px-3 py-1.5 focus:outline-none focus:border-primary/50">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This month</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 text-white/50 mb-4">
            <Clock size={16} /> <span className="text-sm font-medium">Total Execution Time</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-light text-white tracking-tight">142<span className="text-2xl text-white/50">h</span> 15<span className="text-2xl text-white/50">m</span></span>
          </div>
          <p className="text-xs text-emerald-400 mt-3 flex items-center gap-1"><ArrowUpRight size={12} /> 12% vs last week</p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 text-white/50 mb-4">
            <Activity size={16} /> <span className="text-sm font-medium">Cold Starts</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-light text-white tracking-tight">24</span>
          </div>
          <p className="text-xs text-red-400 mt-3 flex items-center gap-1"><ArrowUpRight size={12} /> 5% vs last week</p>
        </div>
        
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/90">Optimize Performance</p>
            <p className="text-xs text-white/50 leading-relaxed">Consider upgrading your instance tier to eliminate cold starts and improve response times for critical deployments.</p>
          </div>
          <button className="text-sm text-primary hover:underline self-start mt-4">Upgrade Tier &rarr;</button>
        </div>
      </div>

      {/* Mock Chart Area */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 h-[300px] flex flex-col">
        <h3 className="text-sm font-medium text-white/90 mb-6">Usage Over Time</h3>
        <div className="flex-1 flex items-end justify-between gap-2 border-b border-white/5 pb-2">
          {/* Generate some random bars for a fake chart */}
          {Array.from({ length: 30 }).map((_, i) => {
            const height = 20 + Math.random() * 80
            return (
              <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative group cursor-pointer" style={{ height: `${height}%` }}>
                {/* Tooltip mock */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                  Day {i + 1}: {Math.round(height)}h
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-3 text-[10px] text-white/30 uppercase tracking-wider font-semibold">
          <span>May 1</span>
          <span>May 15</span>
          <span>May 30</span>
        </div>
      </div>
    </div>
  )
}
