import { ProjectI } from '@/types/project'
import { api } from "./api.instance"

export const createProject = async (repoName: string) => {
  const response = await api.post('/project/create', { repoName })
  return response.data as ProjectI
}

export const getProjects = async () => {
  const response = await api.get('/project/list')
  return response.data as ProjectI[]
}

export const getProject = async (projectId: string) => {
  const response = await api.get(`/project/${projectId}`)
  return response.data as ProjectI
}

