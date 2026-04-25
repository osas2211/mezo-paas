import { Signup } from "@/components/auth/sign-up"
import React from "react"

export const metadata = {
  title: "Signup | Mezo Deploy",
}

const SignUpPage = () => {
  return (
    <div className="text-white!">
      <Signup />
    </div>
  )
}

export default SignUpPage
