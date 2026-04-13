"use client"

import Header from "@/components/utilities/header"
import Sidebar from "@/components/utilities/sidebar"
import { usePathname } from "next/navigation"

export default function InAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-dark text-white relative font-sans">
      <Header />
      <div className="grid grid-cols-[290px_auto]">
        <div className="sticky top-0 h-[calc(100vh-3.5rem)] px-4 md:px-10 md:pr-4 py-4 md:py-6 border-r border-white/10">
          <Sidebar />
        </div>
        <div className="fixed top-0 left-6 bg-white/10 w-px h-screen"></div>
        <div className="fixed top-0 right-6 bg-white/10 w-px h-screen"></div>
        <main className="px-4 md:px-6 py-4 md:py-8 md:pr-12">{children}</main>
      </div>
    </div>
  )
}
