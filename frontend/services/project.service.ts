import { ProjectI } from "@/types/project"
import { api } from "./api.instance"

export const createProject = async (body: {
  repoName: string
  envVariables: Record<string, string>
}) => {
  const response = await api.post("/project/create", body)
  return response.data as ProjectI
}

export const getProjects = async () => {
  const response = await api.get("/project/list")
  return response.data as ProjectI[]
}

export const getProject = async (projectId: string) => {
  const response = await api.get(`/project/${projectId}`)
  return response.data as ProjectI
}

export const stopProject = async (projectId: string) => {
  const response = await api.patch(`/project/${projectId}/stop`)
  return response.data as { message: string; success: boolean }
}

export const restartProject = async (projectId: string) => {
  const response = await api.patch(`/project/${projectId}/restart`)
  return response.data as { message: string; success: boolean }
}
