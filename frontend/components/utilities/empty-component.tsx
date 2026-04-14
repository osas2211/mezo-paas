"use client"
import React from "react"

export const EmptyComponent = (props: {
  children?: React.ReactNode
  description?: React.ReactNode
  caption?: string
  icon?: React.ReactNode
  title?: string
}) => {
  return (
    <div>
      <div className="border border-white/10 bg-white/5 p-1">
        <div className="border border-white/20 bg-dark p-6 min-h-50 space-y-5">
          <div className="text-xl font-semibold font-sans">
            <h3 className="text-[16px] font-medium">{props.title}</h3>
            {props.children || (
              <>
                <div className="flex flex-col gap-1.5 justify-center items-center font-normal md:h-50">
                  <div className="pb-4">{props?.icon}</div>
                  <div className="text-sm text-white font-medium">
                    {props?.description}
                  </div>
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
