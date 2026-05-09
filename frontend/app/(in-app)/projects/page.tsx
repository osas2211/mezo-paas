"use client"
import { useState } from "react"
import { PageHeader } from "@/components/utilities/page-header"
import { useProjects } from "@/hooks/use-project"
import { ProjectList } from "@/components/project/project-list"
import { Search } from "lucide-react"

const ProjectsPage = () => {
  const { data: projects = [], isLoading } = useProjects()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-5 md:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Projects"
          subtitle="Manage your infrastructure projects"
        />
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 focus:bg-white/[0.07] transition-all"
          />
        </div>
      </div>

      <div>
        <ProjectList projects={projects} isLoading={isLoading} searchQuery={searchQuery} />
      </div>
    </div>
  )
}
export default ProjectsPage
