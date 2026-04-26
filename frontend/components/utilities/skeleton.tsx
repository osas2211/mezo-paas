"use client"
import React from "react"
import { motion } from "framer-motion"

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`bg-white/5 animate-pulse rounded-md ${className}`}
    />
  )
}

export const CardSkeleton = () => {
  return (
    <div className="border border-white/10 bg-white/5 p-1 rounded-sm">
      <div className="border border-white/20 bg-dark p-4 md:p-6 space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 shrink-0" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </div>
  )
}
