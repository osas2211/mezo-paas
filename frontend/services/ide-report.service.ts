import { api } from "./api.instance"

export type IdeReportCategory = "BUG" | "CONFUSING" | "FEATURE_REQUEST" | "OTHER"

export const submitIdeReport = async (body: {
  category: IdeReportCategory
  message: string
  diagnostics?: Record<string, unknown>
}) => {
  const res = await api.post<{ id: string; createdAt: string }>("/ide-reports", body)
  return res.data
}
