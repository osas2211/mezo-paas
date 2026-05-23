"use client"
import { DeploymentCard } from "@/components/deployment/deployment-card"
import { EmptyComponent } from "@/components/utilities/empty-component"
import { PageHeader } from "@/components/utilities/page-header"
import { PageLoading } from "@/components/utilities/page-loading"
import { useGetDeployments } from "@/hooks/use-project"
import { Rocket } from "lucide-react"
import React from "react"

const DeploymentsPage = () => {
  const {data, isLoading} = useGetDeployments()
  if(isLoading){
    return <PageLoading />
  }
  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Deployments"
        subtitle="View deployment history across all projects"
      />

      {
        data?.length === 0 && <div>
        <EmptyComponent
          icon={<Rocket className="text-white/40" size={40} />}
          description="No deployments yet"
          caption="Deploy a service to see deployment history here."
        />
      </div>
      }

      <div className="space-y-3">
        {
          data?.slice(0,20)?.map((item)=> {
            return <DeploymentCard key={item.id} {...item} />
          })
        }
      </div>
    </div>
  )
}

export default DeploymentsPage
