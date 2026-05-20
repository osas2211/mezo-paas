import { UserI, TransactionI } from "@/types/user"
import { api } from "./api.instance"

export const getProfile = async () => {
  const res = await api.get<UserI>("/user/me")
  return res.data
}

export const getTransactionHistory = async () => {
  const res = await api.get<{ transactions: TransactionI[] }>(
    "/user/tx-history",
  )
  return res.data.transactions
}

export const transferCredits = async (body: {
  email: string
  amount: number
}) => {
  const response = api.post("/user/transfer-credits", body)
  return response
}
