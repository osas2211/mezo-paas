import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAdminAnalytics, getIdeReports, updateIdeReport } from "@/services/admin.service"
import type { IdeReportStatus } from "@/types/admin"

export const useAdminAnalytics = (adminKey: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-analytics", adminKey],
    queryFn: () => getAdminAnalytics(adminKey),
    enabled: enabled && !!adminKey,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export const useIdeReports = (adminKey: string, status?: IdeReportStatus) => {
  return useQuery({
    queryKey: ["admin-ide-reports", adminKey, status ?? "all"],
    queryFn: () => getIdeReports(adminKey, status),
    enabled: !!adminKey,
    retry: false,
    refetchInterval: 30000, // live-ish triage during events
  })
}

export const useUpdateIdeReport = (adminKey: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: IdeReportStatus; adminNotes?: string }) =>
      updateIdeReport(adminKey, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-ide-reports", adminKey] }),
  })
}
