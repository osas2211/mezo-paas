"use client"
import React from "react"

export const InfoCard = (props: {
  title: string
  subtitle?: string
  icon: React.ReactNode
  value: string | number
  status?: "active" | "pending" | "suspended"
}) => {
  return (
    <div>
      <div className="border border-white/10 bg-white/5 p-1">
        <div className="border border-white/20 bg-dark p-4 h-30">
          <div className="flex items-start gap-4 justify-between">
            <div className="space-y-2">
              <h3 className="font-medium uppercase text-xs text-white/80">
                {props.title}
              </h3>
              <p className="text-xl font-semibold font-sans">{props.value}</p>
              {props?.status ? (
                <div
                  className={`inline-block text-xs p-1 px-2 rounded-sm ${props.status === "active" ? "text-green-500 bg-green-200/10" : props.status === "suspended" ? "text-red-500 bg-red-200/10" : "text-amber-500 bg-amber-200/10"}`}
                >
                  {props.status}
                </div>
              ) : (
                <p className="text-xs text-white/50">{props.subtitle}</p>
              )}
            </div>
            <div className="p-2 bg-primary/5">{props.icon}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
