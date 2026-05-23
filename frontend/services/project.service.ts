import { ProjectI } from "@/types/project";
import { api } from "./api.instance";

export const createProject = async (body: {
  repoName: string;
  envVariables: Record<string, string>;
}) => {
  const response = await api.post("/project/create", body);
  return response.data as ProjectI;
};

export const getProjects = async () => {
  const response = await api.get("/project/list");
  return response.data as ProjectI[];
};

export const getProject = async (projectId: string) => {
  const response = await api.get(`/project/${projectId}`);
  return response.data as ProjectI;
};

export const deploymentStats = async () => {
  const response = await api.get("/project/deployment-stats");
  return response.data as {
    successRate: number;
    totalDeployments: number;
    successfulDeployments: number;
    failedDeployments: number;
    totalServices: number;
    totalProjects: number;
  };
};

export const getDeployments = async (status?: string) => {
  const response = await api.get(`/project/deployments`, {
    params: { status },
  });
  return response.data as {
    id: string;
    status: string;
    url: string;
    port: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    deploymentStartedAt: string;
    deploymentFinishedAt: string;
    project: {
      name: string;
      id: string;
      gitRepositoryName: string;
      gitRepositoryOwner: string;
    };
  }[];
};

export const getEnvVariables = async (projectId: string) => {
  const response = await api.get(`/project/${projectId}/env-variables`);
  return response.data as Record<string, string>;
};

export const stopProject = async (projectId: string) => {
  const response = await api.patch(`/project/${projectId}/stop`);
  return response.data as { message: string; success: boolean };
};

export const restartProject = async (projectId: string) => {
  const response = await api.patch(`/project/${projectId}/restart`);
  return response.data as { message: string; success: boolean };
};
