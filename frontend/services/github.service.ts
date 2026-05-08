import { GithubRepoI } from "@/types/github"
import { api } from "./api.instance"

export const installGithubApp = async () => {
  const response = await api.get('/github/install')
  const { url } = response.data
  window.location.href = url
}

export const getGithubRepos = async (search?: string, limit?: number): Promise<GithubRepoI[]> => {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (limit) params.append('limit', limit.toString())

  const queryString = params.toString() ? `?${params.toString()}` : ''
  const response = await api.get(`/github/repos${queryString}`)
  return response.data
}


export const getGithubUser = async (): Promise<{ login: string, avatar_url: string }> => {
  const response = await api.get(`/github/user`)
  return response.data
}

export const uninstallGithubApp = async () => {
  const response = await api.delete('/github/uninstall')
  return response.data
}

export const importRepo = async ({ repoName }: { repoName: string }) => {
  const response = await api.post('/github/import', { repoName })
  return response.data as { folder_name: string }
}


