import React from "react"
import { ProjectI } from "@/types/project"
import { ExternalLink, Activity, ShieldCheck, BarChart3 } from "lucide-react"
import { GithubOutlined } from "@ant-design/icons"
import DeploymentTracker from "../deployment-tracker"
import { IoIosGitBranch } from "react-icons/io"

type statusType =
  | "PENDING_DEPLOYMENT"
  | "QUEUED_FOR_BUILDING"
  | "BUILDING"
  | "READY"
  | "ERROR"
  | "CANCELED"

export default function OverviewTab({
  project,
  status,
  elapsedMs,
}: {
  project: ProjectI
  status: statusType
  elapsedMs: number
}) {
  return (
    <div className="space-y-6">
      {/* Production Deployment Card */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-sm font-semibold text-white/90">
            Production Deployment
          </h2>
          <div className="flex gap-3">
            <a
              href={`https://github.com/${project.gitRepositoryOwner}/${project.gitRepositoryName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/10 hover:border-white/20"
            >
              <GithubOutlined style={{ fontSize: 14 }} /> Repository
            </a>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-[550px_1fr] gap-8">
          {/* Preview Window Mock */}
          <div className="relative aspect-auto bg-black border border-white/10 rounded-lg overflow-hidden group flex items-center justify-center">
            {/* Browser Dots */}
            <div className="absolute top-0 left-0 w-full h-8 bg-white/5 border-b border-white/10 flex items-center px-3 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-red-400/50 transition-colors" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-amber-400/50 transition-colors" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-emerald-400/50 transition-colors" />
            </div>

            {/* Placeholder Preview Image / Text */}
            <div className="text-center mt-8">
              <h1 className="text-6xl font-light text-white tracking-tighter mix-blend-screen opacity-80">
                {project.name.substring(0, 3).toUpperCase()}
              </h1>
            </div>

            {/* View Overlay */}
            {project.deployment?.url && (
              <a
                href={`${project.deployment.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full font-medium shadow-xl">
                  Visit Site <ExternalLink size={16} />
                </div>
              </a>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-white/60 capitalize tracking-wider mb-2 font-normal">
                Deployment
              </p>
              <a
                href={`${project.deployment?.url || "#"}`}
                target="_blank"
                className="text-sm text-white hover:underline truncate block"
              >
                {project.deployment?.id || "Waiting for deployment..."}
              </a>
            </div>

            {/* <DeploymentTracker
              projectId={project.id}
              defaultStatus={project.deployment?.status}
            /> */}

            <div>
              <p className="text-xs text-white/60 capitalize tracking-wider mb-2 font-normal">
                Domains
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={`${project.deployment?.url || "#"}`}
                  target="_blank"
                  className="text-sm text-white/90 hover:underline flex items-center gap-1.5"
                >
                  {project.deployment?.url || `N/A`}{" "}
                  <ExternalLink size={12} className="text-white/40" />
                </a>
              </div>
            </div>

            <DeploymentTracker
              projectId={project.id}
              project={project}
              status={status}
              elapsedMs={elapsedMs}
            />

            <div>
              <p className="text-xs text-white/60 capitalize tracking-wider mb-2 font-normal">
                Source
              </p>
              <div className="flex flex-col gap-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <IoIosGitBranch size={20} className="text-white/40" />
                  <span>
                    {project.gitRepositoryOwner}/{project.gitRepositoryName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Firewall Mock */}
        <div className="bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
              <ShieldCheck size={16} className="text-blue-400" />
              Firewall{" "}
              <span className="text-xs text-white/40 font-normal ml-1">
                24h
              </span>
            </div>
          </div>
          <div className="text-sm text-blue-400 mb-6">
            Active · All systems normal
          </div>
          <div className="h-[60px] flex items-center justify-center border border-dashed border-white/10 rounded-lg bg-black/20 group-hover:bg-black/40 transition-colors">
            <span className="text-xs text-white/30">No recent events</span>
          </div>
        </div>

        {/* Observability Mock */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
              <Activity size={16} className="text-white/60" />
              Observability{" "}
              <span className="text-xs text-white/40 font-normal ml-1">6h</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Edge Requests</span>
              <span className="text-sm font-medium text-white">0</span>
            </div>
            <div className="h-px bg-white/5 w-full" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">
                Function Invocations
              </span>
              <span className="text-sm font-medium text-white">0</span>
            </div>
            <div className="h-px bg-white/5 w-full" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Error Rate</span>
              <span className="text-sm font-medium text-white">0%</span>
            </div>
          </div>
        </div>

        {/* Analytics Mock */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors cursor-pointer flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
              <BarChart3 size={16} className="text-white/60" />
              Analytics
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <BarChart3 size={24} className="text-white/20 mb-3" />
            <p className="text-sm text-white/60 mb-2">
              Track visitors and page views
            </p>
            <button className="text-sm font-medium text-white hover:text-primary transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
