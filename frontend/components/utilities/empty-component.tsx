"use client"
import React from "react"

export const EmptyComponent = (props: {
  children?: React.ReactNode
  description?: string
  caption?: string
  icon?: React.ReactNode
}) => {
  return (
    <div>
      <div className="border border-white/10 bg-white/5 p-1">
        <div className="border border-white/20 bg-dark p-4 min-h-50 space-y-5">
          <div className="text-xl font-semibold font-sans">
            {props.children || (
              <>
                <div className="flex flex-col gap-1.5 justify-center items-center font-normal md:h-50">
                  <div className="pb-4">{props?.icon}</div>
                  <p className="text-sm text-white font-medium">
                    {props?.description}
                  </p>
                  <p className="text-xs text-white/60">{props?.caption}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
