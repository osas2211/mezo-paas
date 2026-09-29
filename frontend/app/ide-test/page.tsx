"use client"

import dynamic from "next/dynamic"
import { PageLoading } from "@/components/utilities/page-loading"

// Dynamic import for IDE Container - Monaco doesn't support SSR
const IDEContainer = dynamic(() => import("@/components/ide/ide-container"), {
  ssr: false,
  loading: () => (
    <PageLoading label="Loading IDE" className="h-full" />
  ),
})

export default function IDEPage() {
  return <IDEContainer />
}
