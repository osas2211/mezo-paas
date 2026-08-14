export interface AdminAnalyticsSummary {
  totalUsers: number
  proUsers: number
  regularUsers: number
  totalProjects: number
  activeProjects: number
  inactiveProjects: number
  totalCredits: string
  totalStaked: string
}

export interface AdminUserProject {
  id: string
  name: string
  framework: string
  active: boolean
  dailyCreditCost: string
  creditUsedThisMonth: string
  createdAt: string
  deploymentStatus: string | null
  deploymentUrl: string | null
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: "REGULAR_DEVELOPER" | "PRO_DEVELOPER"
  createdAt: string
  wallet: {
    address: string
    creditBalance: string
    stakedBalance: string
  } | null
  projectCount: number
  transactionCount: number
  activeProjectCount: number
  projects: AdminUserProject[]
}

export interface AdminAnalyticsResponse {
  summary: AdminAnalyticsSummary
  users: AdminUser[]
  message: string
}
