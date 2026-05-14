import React from "react"
import { ProjectI } from "@/types/project"
import { Search, GitCommit, GitBranch, Clock, MoreHorizontal } from "lucide-react"

export default function DeploymentsTab({ project }: { project: ProjectI }) {
  // Mock deployment list
  const deployments = [
    {
      id: project.deployment?.id || "dep_1",
      status: project.deployment?.status || "READY",
      url: project.deployment?.url || `${project.name}.mezo.app`,
      branch: "main",
      commitMessage: "Update hero section",
      commitHash: "a1b2c3d",
      duration: "1m 12s",
      createdAt: project.deployment?.createdAt || Date.now(),
    },
    {
      id: "dep_2",
      status: "READY",
      url: `old-${project.name}.mezo.app`,
      branch: "main",
      commitMessage: "Fix styling bugs",
      commitHash: "e4f5g6h",
      duration: "45s",
      createdAt: Date.now() - 86400000, // 1 day ago
    },
    {
      id: "dep_3",
      status: "ERROR",
      url: "",
      branch: "feature/auth",
      commitMessage: "Add next-auth integration",
      commitHash: "i7j8k9l",
      duration: "2m 04s",
      createdAt: Date.now() - 172800000, // 2 days ago
    }
  ]

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Deployments</h2>
          <p className="text-white/50 text-sm">History of all your deployments and builds.</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input 
            type="text" 
            placeholder="Search deployments..." 
            className="w-full sm:w-64 bg-[#0a0a0a] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] border-b border-white/10 text-white/50">
              <tr>
                <th className="px-6 py-3 font-medium">Deployment</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Branch</th>
                <th className="px-6 py-3 font-medium">Duration</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {deployments.map((dep) => (
                <tr key={dep.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-white">{dep.url || "Failed deployment"}</span>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <GitCommit size={12} />
                        <span>{dep.commitHash}</span>
                        <span className="truncate max-w-[200px]">{dep.commitMessage}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border
                      ${dep.status === 'READY' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 
                        dep.status === 'ERROR' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 
                        'text-blue-400 bg-blue-400/10 border-blue-400/20'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full bg-current ${dep.status === 'BUILDING' ? 'animate-pulse' : ''}`} />
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-white/70">
                      <GitBranch size={14} className="text-white/40" />
                      {dep.branch}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    {dep.duration}
                  </td>
                  <td className="px-6 py-4 text-white/60 flex items-center gap-1.5">
                    <Clock size={14} className="text-white/30" />
                    {formatTime(dep.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
