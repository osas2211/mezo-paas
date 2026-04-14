"use client"
import { EmptyComponent } from "@/components/utilities/empty-component"
import { PageHeader } from "@/components/utilities/page-header"
import { Globe } from "lucide-react"
import React from "react"

const DeomainsPage = () => {
  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Domains"
        subtitle="Manage custom domains across all projects"
      />

      <div>
        <EmptyComponent
          icon={<Globe className="text-white/40" size={40} />}
          description="No domains yet"
          caption="Add custom domains to projects to see them here"
        />
      </div>
    </div>
  )
}

export default DeomainsPage
