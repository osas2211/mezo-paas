/* eslint-disable react/no-unescaped-entities */
"use client"
import React from "react"
import { Button, Form, Input } from "antd"
import { useForm } from "antd/es/form/Form"
import { MdMailOutline } from "react-icons/md"
import { BiLockAlt } from "react-icons/bi"
import { LoadingOutlined } from "@ant-design/icons"
import Link from "next/link"
import { useLogin } from "@/hooks/use-auth"

export const LoginForm = () => {
  const [form] = useForm<{ password: string; email: string }>()
  const { mutateAsync: loginUser, isPending } = useLogin()
  return (
    <div className="md:max-w-[474px] mx-auto bg-dark-alt/40 shadow-2x; shadow-primary/5 md:rounded-[12px] rounded-[8px] md:p-[3rem] p-[1.5rem]">
      <p className="md:text-[24px] text-lg font-medium ">Sign In</p>
      <p className="text-white/60 mt-2 text-sm">
        Welcome back, Please enter your details
      </p>

      <div className="mt-5">
        <Form
          layout="vertical"
          form={form}
          onFinish={loginUser}
          disabled={isPending}
          autoComplete="off"
        >
          <Form.Item
            name={"email"}
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input
              className="h-[40px] w-full"
              placeholder="Enter Email"
              prefix={<MdMailOutline size={18} />}
              autoFocus
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
          <div className="mb-3 text-sm flex justify-between ">
            <label htmlFor="remember" className="text-gray-300">
              Remember me
            </label>
            <Link href="" className="text-sm font-medium text-gray-400!">
              Forgot password?
            </Link>
          </div>

          <Button
            htmlType="submit"
            className="h-10! w-full  text-dark!"
            type="primary"
            disabled={isPending}
          >
            {isPending ? <LoadingOutlined /> : "Sign In"}
          </Button>
          <p className="text-white/60 text-xs font-normal  mt-4">
            By clicking “Sign In”, you agree to our Terms of Use and Privacy
            Policy.
          </p>
          <p className="text-white/60 text-sm  mt-3 font-normal">
            Don't have an account yet? {""}{" "}
            <Link
              href="/sign-up"
              className="text-md font-medium px-1 text-primary!"
            >
              Sign Up
            </Link>
          </p>
        </Form>
      </div>
    </div>
  )
}
