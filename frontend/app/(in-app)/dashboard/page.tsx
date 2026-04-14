"use client"
import { InfoCard } from "@/components/utilities/info-card"
import { ListCard } from "@/components/utilities/list-card"
import { PageHeader } from "@/components/utilities/page-header"
import {
  Activity,
  CheckCircle,
  CreditCard,
  Database,
  FolderKanban,
  Rocket,
  Server,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import React from "react"

const DashboardPage = () => {
  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your infrastructure"
      />

      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard
          title="Projects"
          icon={<FolderKanban className="text-primary" size={20} />}
          value={0}
        />

        <InfoCard
          title="Services"
          subtitle="0 healthy"
          icon={<Server className="text-primary" size={20} />}
          value={0}
        />

        <InfoCard
          title="Deployments"
          subtitle="100% success rate"
          icon={<Rocket className="text-primary" size={20} />}
          value={0}
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <InfoCard
          title="Healthy services"
          icon={<CheckCircle className="text-primary" size={20} />}
          value={0}
        />

        <InfoCard
          title="Unhealthy services"
          icon={<XCircle className="text-primary" size={20} />}
          value={0}
        />

        <InfoCard
          title="Active addons"
          subtitle="Postgres & Redis"
          icon={<Database className="text-primary" size={20} />}
          value={0}
        />

        <InfoCard
          title="Credits"
          subtitle="$0.00/mo"
          icon={<CreditCard className="text-primary" size={20} />}
          value={"$1.00"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ListCard title="Projects" link="/projects">
          <div className="flex flex-col gap-1.5 justify-center items-center font-normal md:pt-4 md:h-40">
            <FolderKanban className="text-white/40" size={30} />
            <p className="text-sm text-white/60">No projects yet</p>
            <Link href={"/projects"} className="text-sm text-primary">
              Create a new project
            </Link>
          </div>
        </ListCard>
        <ListCard title="Recent Activitys" link="/deployments">
          <div className="flex flex-col gap-1.5 justify-center items-center font-normal md:pt-4 md:h-40">
            <Activity className="text-white/40" size={30} />
            <p className="text-sm text-white/70">No recent deployments</p>
            <Link href={"/projects"} className="text-xs text-white/60">
              Deploy a service to get started
            </Link>
          </div>
        </ListCard>
      </div>
    </div>
  )
}

export default DashboardPage
