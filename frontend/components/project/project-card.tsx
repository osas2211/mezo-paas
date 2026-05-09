import React from "react"
import Link from "next/link"
import { ProjectI } from "@/types/project"
import {
  Folder,
  Clock,
  GitBranch,
  Cpu,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock3,
} from "lucide-react"
import { GithubFilled } from "@ant-design/icons"
import { SUPPORTED_FRAMEWORKS } from "@/lib/framework-icons"

const statusConfig: Record<string, any> = {
  PENDING_DEPLOYMENT: {
    icon: Clock3,
    color: "text-amber-400/80",
    bg: "bg-amber-400/10",
    label: "Pending",
  },
  QUEUED: {
    icon: Clock3,
    color: "text-amber-400/80",
    bg: "bg-amber-400/10",
    label: "Queued",
  },
  QUEUED_FOR_BUILDING: {
    icon: Clock3,
    color: "text-amber-400/80",
    bg: "bg-amber-400/10",
    label: "Queued",
  },
  BUILDING: {
    icon: Loader2,
    color: "text-blue-400/80",
    bg: "bg-blue-400/10",
    label: "Building",
    spin: true,
  },
  READY: {
    icon: CheckCircle2,
    color: "text-emerald-400/80",
    bg: "bg-emerald-400/10",
    label: "Ready",
  },
  ERROR: {
    icon: XCircle,
    color: "text-red-400/80",
    bg: "bg-red-400/10",
    label: "Error",
  },
  CANCELED: {
    icon: XCircle,
    color: "text-gray-400/80",
    bg: "bg-gray-400/10",
    label: "Canceled",
  },
}

const formatRelativeDate = (timestamp: number | string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const ProjectCard = ({ project }: { project: ProjectI }) => {
  const status = project.deployment?.status || "PENDING_DEPLOYMENT"
  const StatusIcon = statusConfig[status]?.icon || Clock3
  const isSpinning = statusConfig[status]?.spin
  const framework = SUPPORTED_FRAMEWORKS.find(
    (framework) => framework.id === project.framework,
  )

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block relative pt-[14px]"
    >
      {/* Folder Tab Overlay Effect */}
      <div className="absolute top-0 left-0 w-1/3 h-[14px] bg-white/[0.03] border-t border-l border-r border-white/10 rounded-t-lg transition-colors group-hover:bg-white/[0.05]" />
      <div className="absolute top-0 left-1/3 w-[14px] h-[14px] overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-full h-[200%] bg-white/[0.03] border-r border-white/10 rounded-br-[14px] transition-colors group-hover:bg-white/[0.05]"
          style={{ transform: "skewX(30deg)", transformOrigin: "bottom left" }}
        />
      </div>

      {/* Main Folder Body */}
      <div className="relative bg-[#0a0a0a] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-b-xl rounded-tr-xl p-6 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-white/[0.05] group-hover:shadow-[0_0_30px_-10px_rgba(179,236,17,0.15)] overflow-hidden">
        {/* Top Section: Title & Status */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor:
                  framework?.brandColor == "#000000"
                    ? "#ffffffa1"
                    : framework?.brandColor + "1A",
              }}
              className="p-2.5  rounded-lg border border-white/10 group-hover:border-primary/20 transition-colors"
            >
              <img
                src={framework?.iconUrl}
                alt={framework?.name}
                className="w-5 h-5 text-white/60 group-hover:text-primary transition-colors"
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Cpu size={12} className="text-white/40" />
                <span className="text-xs text-white/50 capitalize">
                  {project.framework || "Node.js"}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/5 ${statusConfig[status]?.bg || ""}`}
          >
            <StatusIcon
              size={12}
              className={`${statusConfig[status]?.color || ""} ${isSpinning ? "animate-spin" : ""}`}
            />
            <span
              className={`text-[10px] font-medium uppercase tracking-wider ${statusConfig[status]?.color || ""}`}
            >
              {statusConfig[status]?.label || status}
            </span>
          </div>
        </div>

        {/* Middle Section: Repo details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-black/40 rounded-md border border-white/5">
            <GithubFilled size={14} className="text-white/40" />
            <span className="text-xs font-mono text-white/60 truncate">
              {project.gitRepositoryOwner}/{project.gitRepositoryName}
            </span>
          </div>
        </div>

        {/* Bottom Section: Meta */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>Created {formatRelativeDate(project.createdAt)}</span>
          </div>

          {/* View Details Text (appears on hover) */}
          <div className="flex items-center gap-1 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-primary">
            <span>View Details</span>
            <GitBranch size={12} />
          </div>
        </div>
      </div>
    </Link>
  )
}

export const ProjectCardSkeleton = () => {
  return (
    <div className="relative pt-[14px]">
      <div className="absolute top-0 left-0 w-1/3 h-[14px] bg-white/[0.02] border-t border-l border-r border-white/5 rounded-t-lg" />
      <div className="bg-white/[0.02] border border-white/5 rounded-b-xl rounded-tr-xl p-6 h-[190px] animate-pulse">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-lg" />
            <div className="space-y-2">
              <div className="w-24 h-4 bg-white/5 rounded" />
              <div className="w-16 h-3 bg-white/5 rounded" />
            </div>
          </div>
          <div className="w-20 h-6 bg-white/5 rounded-full" />
        </div>
        <div className="w-full h-8 bg-white/5 rounded-md mb-6" />
        <div className="pt-4 border-t border-white/5">
          <div className="w-32 h-3 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  )
}
