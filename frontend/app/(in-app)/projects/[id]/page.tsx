"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useProject } from "@/hooks/use-project"
import { PageHeader } from "@/components/utilities/page-header"
import { PageLoading } from "@/components/utilities/page-loading"
import { EmptyComponent } from "@/components/utilities/empty-component"
import { AlertCircle } from "lucide-react"
import { GithubOutlined } from "@ant-design/icons"
import Link from "next/link"

// Tab Components (we will create these)
import OverviewTab from "@/components/project/details/overview-tab"
import DeploymentsTab from "@/components/project/details/deployments-tab"
import LogsTab from "@/components/project/details/logs-tab"
import EnvVarsTab from "@/components/project/details/env-vars-tab"
import DomainsTab from "@/components/project/details/domains-tab"
import RunningTimeTab from "@/components/project/details/running-time-tab"
import CreditTab from "@/components/project/details/credit-tab"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000"

type statusType =
  | "PENDING_DEPLOYMENT"
  | "QUEUED_FOR_BUILDING"
  | "BUILDING"
  | "READY"
  | "ERROR"
  | "CANCELED"

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "deployments", label: "Deployments" },
  { id: "logs", label: "Logs" },
  { id: "domains", label: "Domains" },
  { id: "env", label: "Env Variables" },
  { id: "running-time", label: "Running Time" },
  { id: "credits", label: "Credit Consumption" },
]

export default function ProjectDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = params.id as string
  const activeTab = searchParams.get("tab") || "overview"

  const { data: project, isLoading, isError, refetch } = useProject(projectId)

  const [status, setStatus] = useState<statusType>(
    (project?.deployment?.status as statusType) || "PENDING_DEPLOYMENT",
  )

  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number>(0)

  const startTimeFromProject = project?.deployment?.deploymentStartedAt
    ? new Date(project?.deployment?.deploymentStartedAt).getTime()
    : 0

  useEffect(() => {
    if (project?.deployment?.status) {
      setStatus(project?.deployment?.status as statusType)
    }
  }, [project])

  useEffect(() => {
    // 1. Connect to the NestJS Gateway namespace
    const socket: Socket = io(`${SOCKET_URL}/deployments`)

    socket.on("connect", () => {
      // 2. Tell the backend we only want updates for THIS project
      socket.emit("join-project-room", projectId)
    })

    // 3. Listen for the broadcast events from NestJS
    socket.on("status-update", (data) => {
      setStatus(data.status)
      if (data.startTime) {
        setStartTime(data.startTime)
      }
    })

    return () => {
      socket.disconnect() // Cleanup when user leaves the page
    }
  }, [projectId])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined

    // Only run the high-speed timer if the status is actively building
    if (status === "BUILDING" && (startTime || startTimeFromProject)) {
      interval = setInterval(() => {
        // Calculate the difference between NOW and when the backend said it started
        setElapsedMs((Date.now() - (startTime || startTimeFromProject)) / 1000)
      }, 100) // 100ms makes it feel buttery smooth
    } else if (status === "READY" || status === "ERROR") {
      // If it finishes, the interval stops automatically, freezing the final time on screen
      clearInterval(interval)
      refetch()
    }

    return () => clearInterval(interval)
  }, [status, startTime, project])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <PageLoading />
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="mt-10">
        <EmptyComponent
          icon={<AlertCircle size={40} className="text-red-400" />}
          description="Project not found"
          caption="This project may have been deleted or you don't have access to it."
        />
      </div>
    )
  }

  const handleTabChange = (tabId: string) => {
    router.push(`/projects/${projectId}?tab=${tabId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageHeader
            title={project.name}
            subtitle={
              <div className="flex items-center gap-2 mt-2 text-white/50 text-sm">
                <GithubOutlined size={14} />
                <span>
                  {project.gitRepositoryOwner}/{project.gitRepositoryName}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="capitalize">{project.framework}</span>
              </div>
            }
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`${project.deployment?.url || "#"}`}
            target="_blank"
            className="px-4 py-2 bg-primary text-black font-medium text-sm rounded-md transition-transform hover:scale-105 active:scale-95"
          >
            Visit Site
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-white/10">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4 max-w-6xl mx-auto">
        {activeTab === "overview" && (
          <OverviewTab
            project={project}
            status={status}
            elapsedMs={elapsedMs}
          />
        )}
        {activeTab === "deployments" && <DeploymentsTab project={project} />}
        {activeTab === "logs" && <LogsTab project={project} />}
        {activeTab === "domains" && <DomainsTab project={project} />}
        {activeTab === "env" && <EnvVarsTab project={project} />}
        {activeTab === "running-time" && <RunningTimeTab project={project} />}
        {activeTab === "credits" && <CreditTab project={project} />}
      </div>
    </div>
  )
}
