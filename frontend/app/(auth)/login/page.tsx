import { UserLogin } from "@/components/auth/login"

export const metadata = {
  title: "Login | Mezo Host",
}

const LoginPage = () => {
  return (
    <div className="text-white!">
      <UserLogin />
    </div>
  )
}

export default LoginPage
