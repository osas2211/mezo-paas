import React, { useMemo } from "react"
import { ProjectCard, ProjectCardSkeleton } from "./project-card"
import { ProjectI } from "@/types/project"
import { EmptyComponent } from "@/components/utilities/empty-component"
import { FolderKanban, Search } from "lucide-react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ProjectListProps {
  projects: ProjectI[]
  isLoading: boolean
  searchQuery: string
}

export const ProjectList = ({
  projects,
  isLoading,
  searchQuery,
}: ProjectListProps) => {
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.gitRepositoryName.toLowerCase().includes(query) ||
        p.gitRepositoryOwner.toLowerCase().includes(query),
    )
  }, [projects, searchQuery])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <EmptyComponent
        icon={<FolderKanban className="text-white/40" size={40} />}
        description="No projects yet"
        caption="Projects are created automatically when you deploy"
        action={
          <Link
            href="/projects/create"
            className="inline-flex gap-2 items-center px-4 py-2 bg-primary text-black rounded-md font-medium transition-transform hover:scale-105 active:scale-95"
          >
            Create Project <ArrowUpRight className="text-black" size={18} />
          </Link>
        }
      />
    )
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Search className="text-white/30" size={24} />
        </div>
        <h3 className="text-lg font-medium text-white/90 mb-1">
          No results found
        </h3>
        <p className="text-sm text-white/50 text-center max-w-sm">
          We couldn't find any projects matching "{searchQuery}". Try adjusting
          your search query.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {filteredProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
