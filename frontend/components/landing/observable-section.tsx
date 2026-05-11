"use client"

import { Target, Search, Clock, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react"

export default function ObservableSection() {
  return (
    <section className="relative w-full py-24 sm:py-32 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        {/* Left Side: Text and Features */}
        <div className="flex flex-col gap-10 max-w-xl">
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center px-3 py-1 rounded bg-primary/20 text-primary text-xs font-semibold tracking-wider uppercase w-fit">
              Console
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight leading-tight">
              Deployments, but actually observable
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              We fill the gap others left: quickly seeing what's happening in your
              deployment pipeline when something goes wrong.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <Target size={20} className="text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-zinc-100">Spot failing deployments instantly</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You'll be able to spot misconfigurations and fix issues before they reach production.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <Search size={20} className="text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-zinc-100">Debug with advanced search</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You'll be able to run a global search across all your deployment logs and metrics.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <Clock size={20} className="text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-zinc-100">Track performance over time</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You'll be able to see deployment duration trends and optimize your build times.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Mock UI */}
        <div className="relative w-full h-full min-h-[500px] flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[560px] bg-[#0a0a0c] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            {/* Window Header */}
            <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-[#111112]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col gap-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 transition-colors">
                  All projects <ChevronDown size={14} className="text-zinc-500" />
                </button>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    0.42% failure rate
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Clock size={12} className="text-zinc-500" />
                    18s P99
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  className="w-full bg-transparent border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                  readOnly
                />
              </div>

              {/* Logs */}
              <div className="flex flex-col gap-1.5 font-mono text-[11px] sm:text-[12px] mt-2">
                <div className="flex gap-3 items-center px-3 py-2 rounded bg-zinc-900/50 text-zinc-400">
                  <span className="text-primary/70 shrink-0">12/9/2025, 2:34:12 PM</span>
                  <span className="text-zinc-500 shrink-0">[info]</span>
                  <span className="text-zinc-300 truncate">Starting deployment...</span>
                </div>
                <div className="flex gap-3 items-center px-3 py-2 rounded bg-zinc-900/50 text-zinc-400">
                  <span className="text-primary/70 shrink-0">12/9/2025, 2:34:15 PM</span>
                  <span className="text-zinc-500 shrink-0">[info]</span>
                  <span className="text-zinc-300 truncate">Building application</span>
                </div>
                <div className="flex gap-3 items-center px-3 py-2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  <span className="text-red-400/80 shrink-0">12/9/2025, 2:34:18 PM</span>
                  <span className="text-red-500/70 shrink-0">[error]</span>
                  <span className="font-medium truncate">Build failed: Module not found</span>
                </div>
              </div>

              {/* Glowing Card */}
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                <div className="flex items-center gap-2 text-primary font-medium text-sm mb-3">
                  <AlertCircle size={14} />
                  Failures Found
                </div>
                <ul className="flex flex-col gap-2 text-xs text-zinc-300 list-disc list-inside">
                  <li>Build: Missing dependency</li>
                  <li>Deploy: Timeout exceeded</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
