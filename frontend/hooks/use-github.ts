import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getGithubRepos, getGithubUser, importRepo, installGithubApp, uninstallGithubApp } from "@/services/github.service"
import { useToastify } from "./use-toastify"

export const useInstallGithubApp = () => {
  const { successToast, errorToast } = useToastify()
  return useMutation({
    mutationKey: ["github-install"],
    mutationFn: installGithubApp,
    retry: false,
    gcTime: 0,
    onSuccess: () => {
      successToast("Github App installation initiated", "bottom-right")
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Something went wrong", "bottom-right")
    },
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
  const { successToast, errorToast } = useToastify()
  return useMutation({
    mutationKey: ["github-uninstall"],
    mutationFn: uninstallGithubApp,
    retry: false,
    gcTime: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-user"] })
      queryClient.invalidateQueries({ queryKey: ["github-repos"] })
      successToast("Github App uninstalled successfully", "bottom-right")
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Something went wrong", "bottom-right")
    },
  })
}

export const useImportRepo = () => {
  const { successToast, errorToast } = useToastify()
  return useMutation({
    mutationKey: ["github-import"],
    mutationFn: importRepo,
    retry: false,
    gcTime: 0,
    onSuccess: () => {
      successToast("Repo imported successfully", "bottom-right")
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Something went wrong", "bottom-right")
    },
  })
}