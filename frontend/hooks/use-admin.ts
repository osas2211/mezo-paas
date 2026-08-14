import { useQuery } from "@tanstack/react-query"
import { getAdminAnalytics } from "@/services/admin.service"

export const useAdminAnalytics = (adminKey: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-analytics", adminKey],
    queryFn: () => getAdminAnalytics(adminKey),
    enabled: enabled && !!adminKey,
    retry: false,
    refetchOnWindowFocus: false,
  })
}
