import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',

  },
})

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  if (match) return match[2]
  return null
}

const removeCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }
}

api.interceptors.request.use((config) => {
  if (config.url === '/auth/login' || config.url === '/auth/signup') {
    return config
  }

  const token = getCookie('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeCookie("access_token")
      if (typeof window !== 'undefined') {
        // window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)