"use client"

import { useUser } from "@/hooks/use-user"

export default function Header() {
  const { data } = useUser()
  return (
    <header className="border-white/10 px-4 md:px-6 w-full border-b">
      <div className="flex items-center justify-between py-2 px-4 relative">
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-px bg-white/10"></div>

        <div className="flex items-center gap-2 ">
          <h1 className="bg-dark relative font-thin text-lg">Mezo deploy</h1>
        </div>
        <div className="flex items-center gap-2 text-sm px-4 py-2 border border-white/10 bg-dark! relative">
          <div className="flex items-center gap-3">
            <span className="">{data?.user?.email}</span>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="h-2 w-2 bg-primary/60 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
