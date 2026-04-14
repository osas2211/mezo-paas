"use client"
import { EmptyComponent } from "@/components/utilities/empty-component"
import { PageHeader } from "@/components/utilities/page-header"
import { Rocket } from "lucide-react"
import React from "react"

const DeploymentsPage = () => {
  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Deployments"
        subtitle="View deployment history across all projects"
      />

      <div>
        <EmptyComponent
          icon={<Rocket className="text-white/40" size={40} />}
          description="No deployments yet"
          caption="Deploy a service to see deployment history here."
        />
      </div>
    </div>
  )
}

export default DeploymentsPage
