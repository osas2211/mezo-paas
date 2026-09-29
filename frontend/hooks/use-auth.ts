import { useMutation } from "@tanstack/react-query"
import { loginService, signupService } from "../services/auth.service"
import { useRouter } from "next/navigation"
import { useToastify } from "./use-toastify"
import { removeCookie } from "@/services/api.instance"
import { RoleEnum } from "@/types/user"

/** Post-login destination from ?next=, limited to same-site relative paths */
function nextPath(): string {
  if (typeof window === "undefined") return "/dashboard"
  const next = new URLSearchParams(window.location.search).get("next")
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/dashboard"
  return next
}

export const useLogin = () => {
  const router = useRouter()
  const { successToast, errorToast } = useToastify()
  return useMutation({
    mutationFn: (data: { email: string, password: string }) => loginService(data),
    onSuccess: (data: any) => {
      successToast(data?.message || "Logged in successfully", "bottom-left")
      router.push(nextPath())
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Invalid Credentials", "bottom-left")
    }
  })
}
export const useSignup = () => {
  const router = useRouter()
  const { successToast, errorToast } = useToastify()
  return useMutation({
    mutationFn: (data: { email: string, password: string, name: string, role: RoleEnum }) => signupService(data),
    onSuccess: (data: any) => {
      successToast(data?.message || "Account created successfully", "bottom-right")
      router.push("/login")
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Something went wrong", "bottom-right")
    }
  })
}

export const useLogout = () => {
  const router = useRouter()
  const { successToast, errorToast } = useToastify()
  return useMutation({
    mutationFn: () => {
      removeCookie("access_token")
      return Promise.resolve()
    },
    onSuccess: () => {
      successToast("Logged out successfully", "bottom-left")
      router.push("/login")
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Something went wrong", "bottom-left")
    }
  })
}