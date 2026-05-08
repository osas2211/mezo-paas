"use client"

import { PageHeader } from "@/components/utilities/page-header"
import { useState, useMemo } from "react"
import { useUser } from "@/hooks/use-user"
import { GithubRepoI } from "@/types/github"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  GitBranch,
  ChevronDown,
  ArrowUpRight,
  File,
  FolderPlus,
  Lock,
  Globe,
  Star,
  Clock,
  Loader2,
} from "lucide-react"
import { FaGithub } from "react-icons/fa"
import Link from "next/link"
import {
  useGetGithubRepos,
  useGetGithubUser,
  useImportRepo,
} from "@/hooks/use-github"
import { useDebounce } from "@/hooks/use-debounce"
import { useCreateProject } from "@/hooks/use-project"

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
}

const formatRelativeDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const CreateProjectPage = () => {
  const { data } = useGetGithubUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 500)
  const {
    data: repos,
    isLoading,
    isError,
  } = useGetGithubRepos(debouncedSearch, 7)

  const filteredRepos = repos || []
  const { mutateAsync: createproject, isPending: isImporting } =
    useCreateProject()

  const handleCreateProject = async (repo: GithubRepoI) => {
    setImportingId(repo.id)
    await createproject({ repoName: repo.name })
    setImportingId(null)
  }

  const username = data?.login || "user"

  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Create Project"
        subtitle="Import an existing repository or start from scratch"
      />

      <div className="flex items-center justify-center gap-5">
        {/* Import Git Repository Section */}
        <div>
          <div className="border border-white/10 bg-white/5 p-1">
            <div className="border border-white/20 bg-dark">
              {/* Section Header */}
              <div className="flex items-center gap-3 p-5 pb-4 border-b border-white/10">
                <div className="p-2 bg-white/5 border border-white/10">
                  <GitBranch size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium">
                    Import Git Repository
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Select a repository to deploy
                  </p>
                </div>
              </div>

              {/* Account Selector & Search */}
              <div className="p-4 flex flex-col sm:flex-row gap-3">
                {/* GitHub Account Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/5 border border-white/15 hover:border-white/25 transition-colors text-sm min-w-[180px] justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <FaGithub
                        size={16}
                        className="text-white/70 group-hover:text-white transition-colors"
                      />
                      <span className="text-white/90">{username}</span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-white/40 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 top-full mt-1.5 left-0 w-full bg-[#0e0e0e] border border-white/15 shadow-2xl shadow-black/40"
                      >
                        <div className="p-1">
                          <button
                            onClick={() => setIsDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/90 hover:bg-white/5 transition-colors"
                          >
                            <FaGithub size={14} className="text-white/60" />
                            {username}
                          </button>
                        </div>
                        <div className="border-t border-white/10 p-1">
                          <Link
                            href={"/integrations"}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
                          >
                            Update Account
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
              </div>

              {/* Repository List */}
              <div className="border-t border-white/10">
                {isLoading ? (
                  <div className="p-5 space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between animate-pulse"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-3.5 h-3.5 rounded-full bg-white/10" />
                          <div className="space-y-2 flex-1">
                            <div className="h-3.5 bg-white/10 rounded w-1/3" />
                            <div className="h-2.5 bg-white/[0.06] rounded w-1/4" />
                          </div>
                        </div>
                        <div className="h-7 w-16 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                ) : isError || !repos ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <FaGithub size={28} className="text-white/15" />
                    <p className="text-sm text-white/50">
                      Connect your GitHub account to see repositories
                    </p>
                    <Link
                      href="/integrations"
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Go to Integrations →
                    </Link>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredRepos.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16 gap-3"
                      >
                        <Search size={28} className="text-white/15" />
                        <p className="text-sm text-white/40">
                          No repositories found for &quot;{searchQuery}&quot;
                        </p>
                      </motion.div>
                    ) : (
                      filteredRepos.map((repo: GithubRepoI, index: number) => (
                        <motion.div
                          key={repo.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.02] transition-colors group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Repo icon & info */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="shrink-0">
                                {repo.private ? (
                                  <Lock
                                    size={14}
                                    className="text-amber-400/60"
                                  />
                                ) : (
                                  <Globe
                                    size={14}
                                    className="text-emerald-400/60"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white/90 truncate">
                                    {repo.name}
                                  </span>
                                  {repo.stargazers_count > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-white/30">
                                      <Star
                                        size={10}
                                        className="fill-current"
                                      />
                                      {repo.stargazers_count}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  {repo.language && (
                                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            LANGUAGE_COLORS[repo.language] ||
                                            "#888",
                                        }}
                                      />
                                      {repo.language}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1 text-xs text-white/30">
                                    <Clock size={10} />
                                    {formatRelativeDate(repo.updated_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Import Button */}
                          <button
                            onClick={() => handleCreateProject(repo)}
                            disabled={importingId === repo.id && isImporting}
                            className="shrink-0 ml-4 px-4 py-1.5 text-xs font-medium border border-white/20 text-white/80 hover:bg-white hover:text-black hover:border-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {importingId === repo.id && isImporting ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                Importing
                              </>
                            ) : (
                              "Import"
                            )}
                          </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                )}
              </div>
              <div className="border border-white/10 bg-white/5 p-1 mt-7">
                <div className="border border-white/20 bg-dark px-5 py-4  space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-3 items-center">
                      <File size={16} className="text-white/30" />
                      <div>
                        <p className="text-sm text-white/70">
                          Can&apos;t find your repository?
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          Make sure the GitHub App is installed and has access
                          to the correct repositories.
                        </p>
                      </div>
                      <div className="mt-3">
                        <Link
                          href="/integrations"
                          className="shrink-0 px-4 py-2 text-xs font-medium border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                        >
                          Configure GitHub App
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectPage
