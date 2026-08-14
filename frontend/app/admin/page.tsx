"use client"

import React, { useState } from "react"
import { Button, Form, Input, Table, Tag, Collapse } from "antd"
import { useForm } from "antd/es/form/Form"
import { LoadingOutlined, LockOutlined } from "@ant-design/icons"
import { useAdminAnalytics } from "@/hooks/use-admin"
import { PageHeader } from "@/components/utilities/page-header"
import { InfoCard } from "@/components/utilities/info-card"
import {
  Users,
  FolderKanban,
  CreditCard,
  Package,
  Shield,
  UserCheck,
} from "lucide-react"
import { AdminUser, AdminUserProject } from "@/types/admin"
import { convertCreditsToUSD, convertStakedCreditsToUSD } from "@/lib/convert-credit-to-usd"
import moment from "moment"

const AdminKeyForm = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (key: string) => void
  isLoading: boolean
}) => {
  const [form] = useForm<{ adminKey: string }>()

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="md:max-w-[474px] w-full mx-auto bg-dark-alt/40 shadow-2xl shadow-primary/5 md:rounded-[12px] rounded-[8px] md:p-[3rem] p-[1.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-primary" size={28} />
          <p className="md:text-[24px] text-lg font-medium">Admin Access</p>
        </div>
        <p className="text-white/60 mt-2 text-sm">
          Enter your admin key to access the analytics dashboard
        </p>

        <div className="mt-5">
          <Form
            layout="vertical"
            form={form}
            onFinish={(values: { adminKey: string }) => onSubmit(values.adminKey)}
            disabled={isLoading}
            autoComplete="off"
          >
            <Form.Item
              name="adminKey"
              label="Admin Key"
              rules={[{ required: true, message: "Admin key is required" }]}
            >
              <Input.Password
                className="h-[40px] w-full"
                placeholder="Enter Admin Key"
                prefix={<LockOutlined />}
                autoFocus
              />
            </Form.Item>

            <Button
              htmlType="submit"
              className="h-10! w-full text-dark!"
              type="primary"
              disabled={isLoading}
            >
              {isLoading ? <LoadingOutlined /> : "Access Dashboard"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}

const ProjectsTable = ({ projects }: { projects: AdminUserProject[] }) => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Framework",
      dataIndex: "framework",
      key: "framework",
      render: (framework: string) => (
        <Tag color="blue">{framework}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Deployment",
      dataIndex: "deploymentStatus",
      key: "deploymentStatus",
      render: (status: string | null) => (
        <Tag color={status === "READY" ? "green" : status === "ERROR" ? "red" : "orange"}>
          {status || "Not deployed"}
        </Tag>
      ),
    },
    {
      title: "Daily Cost",
      dataIndex: "dailyCreditCost",
      key: "dailyCreditCost",
      render: (cost: string) => `${Number(cost).toFixed(2)} MHCredit`,
    },
    {
      title: "Monthly Usage",
      dataIndex: "creditUsedThisMonth",
      key: "creditUsedThisMonth",
      render: (usage: string) => `${Number(usage).toFixed(2)} MHCredit`,
    },
  ]

  return (
    <Table
      dataSource={projects}
      columns={columns}
      rowKey="id"
      pagination={false}
      size="small"
      className="admin-table"
    />
  )
}

const UserCard = ({ user }: { user: AdminUser }) => {
  const items = [
    {
      key: "projects",
      label: (
        <span className="text-white/80">
          Projects ({user.projectCount})
        </span>
      ),
      children: user.projects.length > 0 ? (
        <ProjectsTable projects={user.projects} />
      ) : (
        <p className="text-white/50 text-sm">No projects</p>
      ),
    },
  ]

  return (
    <div className="border border-white/10 bg-white/5 p-1 mb-4">
      <div className="border border-white/20 bg-dark p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-white">{user.name}</h3>
              <p className="text-white/60 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Tag color={user.role === "PRO_DEVELOPER" ? "gold" : "default"}>
              {user.role === "PRO_DEVELOPER" ? "Pro" : "Regular"}
            </Tag>
            <Tag color="blue">{user.projectCount} projects</Tag>
            <Tag color="purple">{user.activeProjectCount} active</Tag>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white/5 p-3 rounded">
            <p className="text-white/50 text-xs uppercase">Credit Balance</p>
            <p className="text-white font-medium">
              {Number(user.wallet?.creditBalance || 0).toFixed(2)} MHCredit
            </p>
            <p className="text-white/40 text-xs">
              ~{convertCreditsToUSD(user.wallet?.creditBalance || 0)}
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-white/50 text-xs uppercase">Staked Balance</p>
            <p className="text-white font-medium">
              {Number(user.wallet?.stakedBalance || 0).toFixed(2)} MHCredit
            </p>
            <p className="text-white/40 text-xs">
              ~{convertStakedCreditsToUSD(user.wallet?.stakedBalance || 0)}
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-white/50 text-xs uppercase">Transactions</p>
            <p className="text-white font-medium">{user.transactionCount}</p>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <p className="text-white/50 text-xs uppercase">Joined</p>
            <p className="text-white font-medium text-sm">
              {moment(user.createdAt).format("MMM DD, YYYY")}
            </p>
          </div>
        </div>

        {user.wallet && (
          <p className="text-white/40 text-xs mb-3 font-mono break-all">
            Wallet: {user.wallet.address}
          </p>
        )}

        <Collapse
          items={items}
          ghost
          className="admin-collapse"
        />
      </div>
    </div>
  )
}

const AdminDashboard = ({ adminKey }: { adminKey: string }) => {
  const { data, isLoading, isError, error } = useAdminAnalytics(adminKey)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <LoadingOutlined className="text-4xl text-primary mb-4" />
          <p className="text-white/60">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Shield className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-red-400 mb-2">Access Denied</p>
          <p className="text-white/60 text-sm">
            {(error as any)?.response?.data?.message || "Invalid admin key"}
          </p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const summary = data?.summary

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <PageHeader
          title="Admin Analytics"
          subtitle="Overview of all users and their activities"
        />

        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <InfoCard
            title="Total Users"
            icon={<Users className="text-primary" size={20} />}
            value={summary?.totalUsers ?? 0}
            subtitle={`${summary?.proUsers ?? 0} Pro, ${summary?.regularUsers ?? 0} Regular`}
          />
          <InfoCard
            title="Pro Users"
            icon={<UserCheck className="text-primary" size={20} />}
            value={summary?.proUsers ?? 0}
          />
          <InfoCard
            title="Total Projects"
            icon={<FolderKanban className="text-primary" size={20} />}
            value={summary?.totalProjects ?? 0}
            subtitle={`${summary?.activeProjects ?? 0} active, ${summary?.inactiveProjects ?? 0} inactive`}
          />
          <InfoCard
            title="Active Projects"
            icon={<FolderKanban className="text-primary" size={20} />}
            value={summary?.activeProjects ?? 0}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <InfoCard
            title="Total Credits"
            icon={<CreditCard className="text-primary" size={20} />}
            value={`${Number(summary?.totalCredits || 0).toFixed(2)} MHCredit`}
            subtitle={`~${convertCreditsToUSD(summary?.totalCredits || 0)}`}
          />
          <InfoCard
            title="Total Staked"
            icon={<Package className="text-primary" size={20} />}
            value={`${Number(summary?.totalStaked || 0).toFixed(2)} MHCredit`}
            subtitle={`~${convertStakedCreditsToUSD(summary?.totalStaked || 0)}`}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-medium mb-4">
            Users ({data?.users?.length ?? 0})
          </h2>

          {data?.users?.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}

          {(!data?.users || data.users.length === 0) && (
            <div className="border border-white/10 bg-white/5 p-8 text-center">
              <Users className="text-white/40 mx-auto mb-2" size={32} />
              <p className="text-white/60">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const AdminPage = () => {
  const [adminKey, setAdminKey] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (key: string) => {
    setIsLoading(true)
    setAdminKey(key)
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  if (!isAuthenticated) {
    return <AdminKeyForm onSubmit={handleSubmit} isLoading={isLoading} />
  }

  return <AdminDashboard adminKey={adminKey} />
}

export default AdminPage
