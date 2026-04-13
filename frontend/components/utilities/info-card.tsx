"use client"
import React from "react"

export const InfoCard = (props: {
  title: string
  subtitle?: string
  icon: React.ReactNode
  value: string | number
}) => {
  return (
    <div>
      <div className="border border-white/10 bg-white/5 p-1">
        <div className="border border-white/20 bg-dark p-4 h-28">
          <div className="flex items-start gap-4 justify-between">
            <div className="space-y-2">
              <h3 className="font-medium uppercase text-xs text-white/80">
                {props.title}
              </h3>
              <p className="text-xl font-semibold font-sans">{props.value}</p>
              <p className="text-xs text-white/50">{props.subtitle}</p>
            </div>
            <div className="p-2 bg-primary/5">{props.icon}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
