import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GithubRepoI } from "@/types/github"
import {
  ArrowLeft,
  ChevronRight,
  Terminal,
  Folder,
  Settings2,
  Plus,
  Trash2,
  Cpu,
  Database,
  Rocket,
  GitBranch,
} from "lucide-react"
import { GithubFilled } from "@ant-design/icons"

interface DeployProjectProps {
  repo: GithubRepoI
  onBack: () => void
  onDeploy: (config: any) => void
  isDeploying?: boolean
}

export const DeployProject = ({
  repo,
  onBack,
  onDeploy,
  isDeploying,
}: DeployProjectProps) => {
  const [projectName, setProjectName] = useState(repo.name)
  const [activeAccordion, setActiveAccordion] = useState<string | null>("build")
  const [envVars, setEnvVars] = useState([{ key: "", value: "" }])

  const [buildConfig, setBuildConfig] = useState({
    buildCommand: "",
    outputDirectory: "",
    installCommand: "",
  })

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id)
  }

  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }])
  }

  const handleRemoveEnvVar = (index: number) => {
    const newVars = [...envVars]
    newVars.splice(index, 1)
    if (newVars.length === 0) newVars.push({ key: "", value: "" })
    setEnvVars(newVars)
  }

  const handleEnvChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newVars = [...envVars]
    newVars[index][field] = value
    setEnvVars(newVars)
  }

  const handleDeploy = () => {
    onDeploy({
      projectName,
      buildConfig,
      envVars: envVars.filter((v) => v.key.trim() !== ""),
    })
  }

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-full group"
        >
          <ArrowLeft
            size={16}
            className="text-white/60 group-hover:text-white transition-colors"
          />
        </button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white/90">
            Deploy Project
          </h2>
          <p className="text-sm text-white/40 mt-1">
            Configure your deployment settings
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Repo Info Card */}
        <div className="p-1 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <div className="bg-[#0a0a0a] rounded-lg p-5 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                <GithubFilled size={24} className="text-white/70" />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-medium">
                  Selected Repository
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-white/90 font-medium">
                    {repo.owner.login}
                  </span>
                  <span className="text-white/30">/</span>
                  <span className="text-white font-semibold">{repo.name}</span>
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md flex items-center gap-2">
              <GitBranch size={14} className="text-white/50" />
              <span className="text-sm text-white/70 font-mono">
                {repo.default_branch}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Project Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="my-awesome-project"
                />
              </div>
            </div>

            {/* Application Preset */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Application Preset
              </label>
              <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm">
                <div className="p-1.5 bg-primary/10 rounded border border-primary/20">
                  <Cpu size={14} className="text-primary" />
                </div>
                <span className="text-white/80 font-medium">
                  Auto-detected Framework
                </span>
                <span className="ml-auto text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">
                  Optimized
                </span>
              </div>
            </div>
          </div>

          {/* Settings Accordions */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
            {/* Build Settings */}
            <div>
              <button
                onClick={() => toggleAccordion("build")}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Settings2
                    size={18}
                    className={
                      activeAccordion === "build"
                        ? "text-primary"
                        : "text-white/40"
                    }
                  />
                  <span className="text-sm font-medium text-white/80">
                    Build and Output Settings
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-white/40 transition-transform duration-300 ${activeAccordion === "build" ? "rotate-90" : ""}`}
                />
              </button>

              <AnimatePresence>
                {activeAccordion === "build" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-2 space-y-5 bg-white/[0.02]">
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 flex items-center gap-2">
                          <Terminal size={12} />
                          Build Command
                        </label>
                        <input
                          type="text"
                          value={buildConfig.buildCommand}
                          onChange={(e) =>
                            setBuildConfig({
                              ...buildConfig,
                              buildCommand: e.target.value,
                            })
                          }
                          placeholder="npm run build (default)"
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary/40 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 flex items-center gap-2">
                          <Folder size={12} />
                          Output Directory
                        </label>
                        <input
                          type="text"
                          value={buildConfig.outputDirectory}
                          onChange={(e) =>
                            setBuildConfig({
                              ...buildConfig,
                              outputDirectory: e.target.value,
                            })
                          }
                          placeholder=".next, dist, build (default)"
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary/40 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 flex items-center gap-2">
                          <Database size={12} />
                          Install Command
                        </label>
                        <input
                          type="text"
                          value={buildConfig.installCommand}
                          onChange={(e) =>
                            setBuildConfig({
                              ...buildConfig,
                              installCommand: e.target.value,
                            })
                          }
                          placeholder="npm install (default)"
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary/40 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Environment Variables */}
            <div>
              <button
                onClick={() => toggleAccordion("env")}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Database
                    size={18}
                    className={
                      activeAccordion === "env"
                        ? "text-primary"
                        : "text-white/40"
                    }
                  />
                  <span className="text-sm font-medium text-white/80">
                    Environment Variables
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-white/40 transition-transform duration-300 ${activeAccordion === "env" ? "rotate-90" : ""}`}
                />
              </button>

              <AnimatePresence>
                {activeAccordion === "env" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-2 space-y-3 bg-white/[0.02]">
                      {envVars.map((env, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="KEY"
                            value={env.key}
                            onChange={(e) =>
                              handleEnvChange(idx, "key", e.target.value)
                            }
                            className="flex-1 bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary/40 focus:outline-none font-mono uppercase"
                          />
                          <span className="text-white/20">=</span>
                          <input
                            type="text"
                            placeholder="VALUE"
                            value={env.value}
                            onChange={(e) =>
                              handleEnvChange(idx, "value", e.target.value)
                            }
                            className="flex-[2] bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary/40 focus:outline-none font-mono"
                          />
                          <button
                            onClick={() => handleRemoveEnvVar(idx)}
                            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddEnvVar}
                        className="flex items-center gap-2 text-xs text-white/50 hover:text-primary transition-colors py-2"
                      >
                        <Plus size={14} />
                        Add another variable
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Deploy Button */}
        <div className="pt-4 border-t border-white/10 mt-2">
          <button
            onClick={handleDeploy}
            disabled={isDeploying || !projectName.trim()}
            className="w-full relative group overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-colors duration-500" />

            <div className="relative bg-primary text-black font-semibold text-lg py-4 px-6 flex items-center justify-center gap-3 transition-transform duration-200 group-hover:scale-[1.01] active:scale-[0.99]">
              {isDeploying ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket size={20} className="fill-black/20" />
                  Deploy Project
                </>
              )}
            </div>
          </button>
          <p className="text-center text-[11px] text-white/30 mt-4">
            By deploying, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
