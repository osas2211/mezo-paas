"use client"
import React from "react"

export const PageHeader = ({ title = "", subtitle = "" }) => {
  return (
    <div className="">
      <h2 className="text-xl md:text-2xl font-medium">{title}</h2>
      <p className="text-white/60 text-sm mt-1">{subtitle}</p>
    </div>
  )
}
