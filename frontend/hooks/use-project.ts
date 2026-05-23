import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deploymentStats,
  getDeployments,
  getProject,
  getProjects,
  restartProject,
  stopProject,
} from "@/services/project.service";
import { ProjectI } from "@/types/project";
import { useToastify } from "@/hooks/use-toastify";

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { successToast, errorToast } = useToastify();
  return useMutation({
    mutationFn: ({
      repoName,
      envVariables,
    }: {
      repoName: string;
      envVariables: Record<string, string>;
    }) => createProject({ repoName, envVariables }),
    onSuccess: (data: ProjectI) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      successToast("Project created successfully", "bottom-right");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message || "Failed to create project",
        "bottom-right",
      );
    },
  });
};

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
  });
};

export const useGetDeployments = (status?: string) => {
  return useQuery({
    queryKey: ["deployments", status],
    queryFn: () => getDeployments(status),
  });
};

export const useDeploymentStats = () => {
  return useQuery({
    queryKey: ["deployment-stats"],
    queryFn: () => deploymentStats(),
  });
};

export const useStopProject = () => {
  const queryClient = useQueryClient();
  const { successToast, errorToast } = useToastify();
  return useMutation({
    mutationFn: (projectId: string) => stopProject(projectId),
    onSuccess: (data: { message: string; success: boolean }, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      successToast("Project stopped successfully", "bottom-right");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message || "Failed to stop project",
        "bottom-right",
      );
    },
  });
};

export const useRestartProject = () => {
  const queryClient = useQueryClient();
  const { successToast, errorToast } = useToastify();
  return useMutation({
    mutationFn: (projectId: string) => restartProject(projectId),
    onSuccess: (data: { message: string; success: boolean }, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      successToast("Project restarted successfully", "bottom-right");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message || "Failed to restart project",
        "bottom-right",
      );
    },
  });
};
