"use client"
import { DashboardInfoCard } from "@/components/dashboard/dashboard-info-card"
import { DashboardListCard } from "@/components/dashboard/dashboard-list-card"
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
      <div className="">
        <h2 className="text-xl md:text-2xl font-medium">Dashboard</h2>
        <p className="text-white/60 text-sm mt-1">
          Overview of your infrastructure
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <DashboardInfoCard
          title="Projects"
          icon={<FolderKanban className="text-primary" size={20} />}
          value={0}
        />

        <DashboardInfoCard
          title="Services"
          subtitle="0 healthy"
          icon={<Server className="text-primary" size={20} />}
          value={0}
        />

        <DashboardInfoCard
          title="Deployments"
          subtitle="100% success rate"
          icon={<Rocket className="text-primary" size={20} />}
          value={0}
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <DashboardInfoCard
          title="Healthy services"
          icon={<CheckCircle className="text-primary" size={20} />}
          value={0}
        />

        <DashboardInfoCard
          title="Unhealthy services"
          icon={<XCircle className="text-primary" size={20} />}
          value={0}
        />

        <DashboardInfoCard
          title="Active addons"
          subtitle="Postgres & Redis"
          icon={<Database className="text-primary" size={20} />}
          value={0}
        />

        <DashboardInfoCard
          title="Credits"
          subtitle="$0.00/mo"
          icon={<CreditCard className="text-primary" size={20} />}
          value={"$1.00"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <DashboardListCard title="Projects" link="/projects">
          <div className="flex flex-col gap-1.5 justify-center items-center font-normal md:pt-4 h-40">
            <FolderKanban className="text-white/40" size={30} />
            <p className="text-sm text-white/60">No projects yet</p>
            <Link href={"/projects"} className="text-sm text-primary">
              Create a new project
            </Link>
          </div>
        </DashboardListCard>
        <DashboardListCard title="Recent Activitys" link="/deployments">
          <div className="flex flex-col gap-1.5 justify-center items-center font-normal md:pt-4 h-40">
            <Activity className="text-white/40" size={30} />
            <p className="text-sm text-white/70">No recent deployments</p>
            <Link href={"/projects"} className="text-xs text-white/60">
              Deploy a service to get started
            </Link>
          </div>
        </DashboardListCard>
      </div>
    </div>
  )
}

export default DashboardPage
