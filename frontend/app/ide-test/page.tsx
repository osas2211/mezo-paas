"use client"

import dynamic from "next/dynamic"
import { Spin } from "antd"

// Dynamic import for IDE Container - Monaco doesn't support SSR
const IDEContainer = dynamic(() => import("@/components/ide/ide-container"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <Spin size="large" />
        <p className="text-white/60 text-sm">Loading Mezo IDE...</p>
      </div>
    </div>
  ),
})

export default function IDEPage() {
  return <IDEContainer />
}
