"use client"
import { EmptyComponent } from "@/components/utilities/empty-component"
import { PageHeader } from "@/components/utilities/page-header"
import { ArrowUpRight, FolderKanban } from "lucide-react"
import Link from "next/link"
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
          action={
            <Link
              href="/projects/create"
              className="inline-flex gap-2 items-center px-4 py-2 bg-primary text-black rounded-md"
            >
              Create Project <ArrowUpRight className="text-black" size={18} />
            </Link>
          }
        />
      </div>
    </div>
  )
}

export default ProjectsPage
