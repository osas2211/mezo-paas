import axios from "axios"
import { AdminAnalyticsResponse, IdeReport, IdeReportStatus, IdeReportsResponse } from "@/types/admin"

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const getAdminAnalytics = async (
  adminKey: string
): Promise<AdminAnalyticsResponse> => {
  const res = await adminApi.get<AdminAnalyticsResponse>("/user/admin/analytics", {
    headers: {
      "x-admin-key": adminKey,
    },
  })
  return res.data
}

export const getIdeReports = async (
  adminKey: string,
  status?: IdeReportStatus
): Promise<IdeReportsResponse> => {
  const res = await adminApi.get<IdeReportsResponse>("/ide-reports", {
    headers: { "x-admin-key": adminKey },
    params: status ? { status } : undefined,
  })
  return res.data
}

export const updateIdeReport = async (
  adminKey: string,
  id: string,
  data: { status?: IdeReportStatus; adminNotes?: string }
): Promise<IdeReport> => {
  const res = await adminApi.patch<IdeReport>(`/ide-reports/${id}`, data, {
    headers: { "x-admin-key": adminKey },
  })
  return res.data
}
