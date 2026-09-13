"use client"

import Header from "@/components/utilities/header"
import { useUser } from "@/hooks/use-user"
import { PageLoading } from "@/components/utilities/page-loading"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function IDELayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark text-white relative font-sans">
      {/* Mobile Blocker */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center md:hidden">
        <div className="w-16 h-16 mb-6 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/60"
          >
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <line x1="8" x2="16" y1="21" y2="21" />
            <line x1="12" x2="12" y1="17" y2="21" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-3">Desktop Required</h2>
        <p className="text-white/60 text-sm leading-relaxed max-w-sm">
          The Mezo IDE is designed for a larger screen experience. Please access
          on your desktop or laptop.
        </p>
      </div>

      {/* Desktop IDE - Full Width */}
      <div className="hidden md:flex flex-col h-screen">
        {/* Slim IDE Header */}
        <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-primary font-semibold text-sm">Mezo IDE</span>
          </div>
        </div>

        {/* IDE Content - Full Height */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
