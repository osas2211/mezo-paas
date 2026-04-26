import { useQuery } from "@tanstack/react-query"
import { getProfile } from "../services/user.service"

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => getProfile(),
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 1000 * 60 * 30,
    refetchIntervalInBackground: true,
  })
}