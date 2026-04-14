"use client"
import { EmptyComponent } from "@/components/utilities/empty-component"
import { PageHeader } from "@/components/utilities/page-header"
import { FolderKanban } from "lucide-react"
import React from "react"

const ProjectsPage = () => {
  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Projects"
        subtitle="Manage your infrastructure projects"
      />

      <div>
        <EmptyComponent
          icon={<FolderKanban className="text-white/40" size={40} />}
          description="No projects yet"
          caption="Projects are created automatically when you deploy"
        />
      </div>
    </div>
  )
}

export default ProjectsPage
