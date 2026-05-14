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
import { ReactNode } from "react"

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

  const { data: project, isLoading, isError } = useProject(projectId)

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
      <div className="py-4">
        {activeTab === "overview" && <OverviewTab project={project} />}
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
