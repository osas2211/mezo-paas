import React from "react"
import { ProjectI } from "@/types/project"
import {
  Globe,
  Plus,
  AlertCircle,
  ExternalLink,
  MoreVertical,
} from "lucide-react"

export default function DomainsTab({ project }: { project: ProjectI }) {
  // Mock domains
  const domains = [
    {
      domain: `${project.name}.mezo.app`,
      status: "Valid Configuration",
      type: "Default",
      target: "Production",
    },
    {
      domain: "www.my-custom-domain.com",
      status: "Invalid Configuration",
      type: "Custom",
      target: "Production",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Domains</h2>
        <p className="text-white/50 text-sm">
          Manage the domains pointing to your deployments. We automatically
          provision SSL certificates.
        </p>
      </div>

      {/* Add New Domain */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs text-white/50 font-medium ml-1">
            Domain
          </label>
          <div className="relative">
            <Globe
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="e.g. my-app.com"
              className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
        <button className="h-[42px] px-6 bg-white text-black font-medium text-sm rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shrink-0">
          <Plus size={16} /> Add Domain
        </button>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        {domains.map((d, i) => (
          <div
            key={i}
            className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <a
                  href={`${d.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-white hover:underline flex items-center gap-2"
                >
                  {d.domain}{" "}
                  <ExternalLink size={14} className="text-white/30" />
                </a>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${d.type === "Default" ? "bg-white/10 text-white/70" : "bg-primary/20 text-primary"}`}
                >
                  {d.type}
                </span>
              </div>
              <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors self-end sm:self-auto">
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-t border-white/5 pt-4">
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase font-semibold tracking-wider">
                  Status
                </p>
                <div className="flex items-center gap-2 text-sm">
                  {d.status === "Valid Configuration" ? (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />{" "}
                      {d.status}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <AlertCircle size={14} /> {d.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase font-semibold tracking-wider">
                  Branch
                </p>
                <p className="text-sm text-white/80 font-mono">main</p>
              </div>

              {d.status === "Invalid Configuration" && (
                <div className="flex-1 sm:text-right mt-2 sm:mt-0">
                  <button className="text-sm text-amber-400 hover:text-amber-300 hover:underline">
                    View Configuration Instructions &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
