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
import { useGetGithubRepos } from "@/hooks/use-github"
import { useDebounce } from "@/hooks/use-debounce"

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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const CreateProjectPage = () => {
  const { data } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 500)
  const {
    data: repos,
    isLoading,
    isError,
  } = useGetGithubRepos(debouncedSearch, 5)

  const filteredRepos = repos || []

  const handleImport = (repoId: number) => {
    setImportingId(repoId)
    // Simulate import action
    setTimeout(() => {
      setImportingId(null)
    }, 2000)
  }

  const username =
    data?.user?.name || data?.user?.email?.split("@")[0] || "user"

  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Create Project"
        subtitle="Import an existing repository or start from scratch"
      />

      <div className="grid lg:grid-cols-[1fr_340px] gap-5">
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
                          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors">
                            + Add GitHub Account
                          </button>
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
                            onClick={() => handleImport(repo.id)}
                            disabled={importingId === repo.id}
                            className="shrink-0 ml-4 px-4 py-1.5 text-xs font-medium border border-white/20 text-white/80 hover:bg-white hover:text-black hover:border-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {importingId === repo.id ? (
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
            </div>
          </div>
        </div>

        {/* Quick Setup Panel (replaces Clone Template) */}
        <div className="flex flex-col gap-5">
          {/* Quick Config Card */}
          <div className="border border-white/10 bg-white/5 p-1">
            <div className="border border-white/20 bg-dark p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 border border-primary/20">
                  <FolderPlus size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium">Quick Setup</h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Start without a repository
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Project Name Input */}
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="my-awesome-project"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                {/* Framework Selection */}
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
                    Framework
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Next.js", icon: "▲" },
                      { name: "Vite", icon: "⚡" },
                      { name: "Remix", icon: "💿" },
                      { name: "Other", icon: "•••" },
                    ].map((fw) => (
                      <button
                        key={fw.name}
                        className="px-3 py-2.5 bg-white/[0.03] border border-white/10 text-xs text-white/60 hover:border-primary/30 hover:text-white/90 hover:bg-primary/5 transition-all duration-200 text-left flex items-center gap-2"
                      >
                        <span className="text-sm">{fw.icon}</span>
                        {fw.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/projects/create"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-black text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create Empty Project
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          {/* Git Provider Connect Card */}
          <div className="border border-white/10 bg-white/5 p-1">
            <div className="border border-white/20 bg-dark p-5 space-y-4">
              <h4 className="text-xs text-white/50 uppercase tracking-wider">
                Connect Provider
              </h4>
              <div className="space-y-2">
                {[
                  {
                    name: "GitHub",
                    icon: <FaGithub size={16} />,
                    connected: true,
                  },
                  {
                    name: "GitLab",
                    icon: (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
                      </svg>
                    ),
                    connected: false,
                  },
                  {
                    name: "Bitbucket",
                    icon: (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646L23.984 2.1a.77.77 0 00-.765-.89H.778zm13.505 13.96h-4.56l-1.243-6.52h6.985l-1.182 6.52z" />
                      </svg>
                    ),
                    connected: false,
                  },
                ].map((provider) => (
                  <button
                    key={provider.name}
                    className="w-full flex items-center justify-between px-3.5 py-3 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group"
                  >
                    <span className="flex items-center gap-2.5 text-sm text-white/70 group-hover:text-white/90 transition-colors">
                      <span className="text-white/50 group-hover:text-white/70 transition-colors">
                        {provider.icon}
                      </span>
                      {provider.name}
                    </span>
                    {provider.connected ? (
                      <span className="text-[10px] font-medium text-primary/80 bg-primary/10 px-2 py-0.5 border border-primary/20">
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-white/30 group-hover:text-white/50 transition-colors">
                        Connect
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="border border-white/10 bg-white/5 p-1">
        <div className="border border-white/20 bg-dark px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File size={16} className="text-white/30" />
            <div>
              <p className="text-sm text-white/70">
                Can&apos;t find your repository?
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Make sure the GitHub App is installed and has access to the
                correct repositories.
              </p>
            </div>
          </div>
          <button className="shrink-0 px-4 py-2 text-xs font-medium border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors">
            Configure GitHub App
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectPage
