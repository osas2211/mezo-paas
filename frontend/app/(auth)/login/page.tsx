import { UserLogin } from "@/components/auth/login"

export const metadata = {
  title: "Login | Mezo Deploy",
}

const LoginPage = () => {
  return (
    <div className="text-white!">
      <UserLogin />
    </div>
  )
}

export default LoginPage
