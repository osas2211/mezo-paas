"use client"

import Header from "@/components/utilities/header"
import Sidebar from "@/components/utilities/sidebar"
import { usePathname } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { PageLoading } from "@/components/utilities/page-loading"
import { useDeploymentStats } from "@/hooks/use-project"

export default function InAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isLoading } = useUser()
  const {isLoading: isLoadingDeploymentStats} = useDeploymentStats()
  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/sign-up"

  if (isAuthPage) {
    return <>{children}</>
  }

  if (isLoading || isLoadingDeploymentStats) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <PageLoading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark text-white relative font-sans">
      {/* Mobile Blocker */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center md:hidden">
        <div className="w-16 h-16 mb-6 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        </div>
        <h2 className="text-xl font-semibold mb-3">Desktop Required</h2>
        <p className="text-white/60 text-sm leading-relaxed max-w-sm">
          The Mezo PaaS console is designed for a larger screen experience. Please access the console on your desktop or laptop.
        </p>
      </div>

      {/* Desktop App */}
      <div className="hidden md:block">
        <Header />
        <div className="grid grid-cols-[290px_auto]">
          <div className="sticky top-0 h-[calc(100vh-3.5rem)] px-10 pr-4 py-6 border-r border-white/10">
            <Sidebar />
          </div>
          <div className="fixed top-0 left-6 bg-white/10 w-px h-screen"></div>
          <div className="fixed top-0 right-6 bg-white/10 w-px h-screen"></div>
          <main className="px-6 py-8 pr-12">{children}</main>
        </div>
      </div>
    </div>
  )
}
