import { api } from "./api.instance"

export const loginService = async (data: { email: string; password: string }) => {
  const res = await api.post<{ access_token: string }>('/auth/login', data)
  if (typeof window !== 'undefined') {
    document.cookie = `access_token=${res.data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`
  }
  return res
}
export const signupService = async (data: { email: string; password: string; name: string }) => {
  const res = await api.post('/auth/signup', data)
  return res
}
