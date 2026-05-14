"use client"
import React from "react"

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
}

export const PageHeader = ({ title = "", subtitle = "" }: PageHeaderProps) => {
  return (
    <div className="">
      <h2 className="text-xl md:text-2xl font-medium">{title}</h2>
      <div className="text-white/60 text-sm mt-1">{subtitle}</div>
    </div>
  )
}
