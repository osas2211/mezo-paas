import axios from "axios"
import { AdminAnalyticsResponse } from "@/types/admin"

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
