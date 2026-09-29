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

export type IdeReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "WONT_FIX"
export type IdeReportCategory = "BUG" | "CONFUSING" | "FEATURE_REQUEST" | "OTHER"

export interface IdeReport {
  id: string
  userId: string | null
  email: string | null
  category: IdeReportCategory
  message: string
  diagnostics: Record<string, any> | null
  status: IdeReportStatus
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; email: string } | null
}

export interface IdeReportsResponse {
  reports: IdeReport[]
  counts: Record<IdeReportStatus, number>
}
