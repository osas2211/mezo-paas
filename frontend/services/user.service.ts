import { UserI } from "@/types/user"
import { api } from "./api.instance"

export const getProfile = async () => {
  const res = await api.get<UserI>("/user/me")
  return res.data
}