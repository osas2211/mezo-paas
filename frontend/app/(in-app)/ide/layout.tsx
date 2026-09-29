"use client"

import { PageHeader } from "@/components/utilities/page-header"
import { Frame } from "@/components/ide/ui"
import IdeWalletButton from "@/components/ide/wallet-button"

/**
 * The IDE lives inside the regular in-app shell (Header + Sidebar), so it only
 * adds a page header and a full-height framed workspace. Height = viewport
 * minus the app header (3.5rem) and the in-app main padding (2 x 2rem).
 */
export default function IDELayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-7.5rem)] min-h-[560px]">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="IDE"
          subtitle="Write, compile, deploy and interact with Solidity contracts on Mezo"
        />
        <IdeWalletButton />
      </div>

      <Frame
        className="flex-1 min-h-0 flex flex-col"
        innerClassName="flex-1 min-h-0 flex flex-col overflow-hidden"
      >
        {children}
      </Frame>
    </div>
  )
}
