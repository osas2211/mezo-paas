import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getGithubRepos, getGithubUser, installGithubApp, uninstallGithubApp } from "@/services/github.service"

export const useInstallGithubApp = () => {
  return useMutation({
    mutationKey: ["github-install"],
    mutationFn: installGithubApp,
    retry: false,
    gcTime: 0,
  })


}

export const useGetGithubRepos = (search?: string, limit?: number) => {
  return useQuery({
    queryKey: ["github-repos", search, limit],
    queryFn: () => getGithubRepos(search, limit),
  })
}

export const useGetGithubUser = () => {
  return useQuery({
    queryKey: ["github-user"],
    queryFn: () => getGithubUser(),
  })
}

export const useUninstallGithubApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["github-uninstall"],
    mutationFn: uninstallGithubApp,
    retry: false,
    gcTime: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-user"] })
      queryClient.invalidateQueries({ queryKey: ["github-repos"] })
    },
  })
}