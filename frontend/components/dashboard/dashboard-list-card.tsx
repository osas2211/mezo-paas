"use client"
import Link from "next/link"
import React from "react"

export const DashboardListCard = (props: {
  title: string
  link: string
  children: React.ReactNode
}) => {
  return (
    <div>
      <div className="border border-white/10 bg-white/5 p-1">
        <div className="border border-white/20 bg-dark p-4 min-h-50 space-y-5">
          <div className="flex items-center gap-4 justify-between">
            <h3 className="font-medium text-white">{props.title}</h3>
            <Link href={props.link} className="text-primary text-sm">
              view all
            </Link>
          </div>

          <div className="text-xl font-semibold font-sans">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  )
}
