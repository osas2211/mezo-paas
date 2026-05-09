import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createProject, getProjects } from "@/services/project.service"
import { ProjectI } from "@/types/project"
import { useToastify } from "@/hooks/use-toastify"

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToastify()
  return useMutation({
    mutationFn: ({ repoName }: { repoName: string }) => createProject(repoName),
    onSuccess: (data: ProjectI) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      successToast('Project created successfully', "bottom-right")
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Failed to create project', "bottom-right")
    }
  })
}

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  })
}

