/* eslint-disable react/no-unescaped-entities */
"use client"
import React from "react"
import { Button, Form, Input } from "antd"
import { useForm } from "antd/es/form/Form"
import { MdMailOutline } from "react-icons/md"
import { BiLockAlt } from "react-icons/bi"
import { useRouter } from "next/navigation"
import { LoadingOutlined } from "@ant-design/icons"
import Link from "next/link"
import { User } from "lucide-react"
import { useSignup } from "@/hooks/use-auth"

export const SignupForm = () => {
  const [form] = useForm<{ password: string; email: string; name: string }>()
  const { mutate: signup, isPending } = useSignup()
  const handleSubmit = async (data: {
    password: string
    email: string
    name: string
  }) => {
    signup(data)
  }
  return (
    <div className="md:max-w-[474px] mx-auto bg-dark-alt/40 shadow-2x; shadow-primary/5 md:rounded-[12px] rounded-[8px] md:p-[3rem] p-[1.5rem]">
      <p className="md:text-[24px] text-lg font-medium ">Sign Up</p>
      <p className="text-white/60 mt-2 text-sm">
        Welcome, time to create an account
      </p>

      <div className="mt-5">
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          disabled={isPending}
          autoComplete="off"
        >
          <Form.Item
            name={"name"}
            label="Username"
            rules={[{ required: true }]}
          >
            <Input
              className="h-[40px] w-full"
              placeholder="Enter name"
              prefix={<User size={18} />}
              autoFocus
            />
          </Form.Item>
          <Form.Item
            name={"email"}
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input
              className="h-[40px] w-full"
              placeholder="Enter Email"
              prefix={<MdMailOutline size={18} />}
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            name={"password"}
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password
              className="h-[40px] w-full"
              placeholder="Enter Password"
              prefix={<BiLockAlt size={18} />}
              autoComplete=""
            />
          </Form.Item>

          <Button
            htmlType="submit"
            className="h-10! w-full  "
            type="primary"
            disabled={isPending}
          >
            {isPending ? <LoadingOutlined /> : "Sign In"}
          </Button>
          <p className="text-white/60 text-xs font-normal  mt-4">
            By clicking “Sign Up, you agree to our Terms of Use and Privacy
            Policy.
          </p>
          <p className="text-white/60 text-sm  mt-3 font-normal">
            Have an account? {""}{" "}
            <Link
              href="/login"
              className="text-md font-medium px-1 text-primary!"
            >
              Login
            </Link>
          </p>
        </Form>
      </div>
    </div>
  )
}
