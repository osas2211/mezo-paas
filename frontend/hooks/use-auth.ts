import { useMutation } from "@tanstack/react-query"
import { loginService, signupService } from "../services/auth.service"
import { useRouter } from "next/navigation"
import { useToastify } from "./use-toastify"
import { removeCookie } from "@/services/api.instance"

export const useLogin = () => {
  const router = useRouter()
  const { successToast, errorToast } = useToastify()
  return useMutation({
    mutationFn: (data: { email: string, password: string }) => loginService(data),
    onSuccess: (data: any) => {
      successToast(data?.message || "Logged in successfully", "bottom-left")
      router.push("/dashboard")
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
    mutationFn: (data: { email: string, password: string, name: string }) => signupService(data),
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