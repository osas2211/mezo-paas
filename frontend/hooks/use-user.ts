import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getProfile,
  getTransactionHistory,
  transferCredits,
} from "../services/user.service"
import { useToastify } from "@/hooks/use-toastify"

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => getProfile(),
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 1000 * 60 * 30,
    refetchIntervalInBackground: true,
  })
}

export const useGetTransactionHistory = () => {
  return useQuery({
    queryKey: ["tx-history"],
    queryFn: () => getTransactionHistory(),
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 1000 * 60 * 30,
    refetchIntervalInBackground: true,
  })
}

export const useTransferCredits = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToastify()
  return useMutation({
    mutationFn: ({ email, amount }: { email: string; amount: number }) =>
      transferCredits({ email, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tx-history"] })
      queryClient.invalidateQueries({ queryKey: ["user"] })
      successToast("Funds Transfer successfull", "bottom-right")
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message || "Failed to transfer funds",
        "bottom-right",
      )
    },
  })
}
