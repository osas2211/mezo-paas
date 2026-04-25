"use client"
import React from "react"
import { LoginForm } from "./login-form"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export const UserLogin = () => {
  return (
    <div className="w-screen h-screen grid lg:grid-cols-2 bg-dark">
      <motion.div
        initial={{ x: "100%", opacity: 0.2 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ ease: "easeOut", duration: 0.3 }}
        className="w-full h-screen md:p-[3rem] p-[1.5rem]"
      >
        <div className="md:mb-[0] mb-[4rem]">
          <p>Mezo Deploy</p>
        </div>
        <div className="h-full md:flex md:flex-col md:items-center md:justify-center">
          <LoginForm />
          {/* <div className="mt-7 text-center text-sm">
            <p>
              Don’t have an account yet?{" "}
              <Link
                href={"/auth/signup"}
                className="text-[#0A3901] font-medium underline"
              >
                Sign Up here
              </Link>
            </p>
            <p className="mt-4">
              <Link href={"/auth/forgot-password"}>Forgot password?</Link>
            </p>
          </div> */}
        </div>
      </motion.div>
      <motion.div
        initial={{ x: "-100%", opacity: 0.2 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ ease: "easeOut", duration: 0.3 }}
        className="w-full h-screen bg-[#000] lg:block hidden relative z-[50]"
      >
        <div className="absolute top-[50%] left-[50%] w-full h-full translate-x-[-50%] translate-y-[-50%] z-[0]">
          <Image
            fill
            className="w-full h-full object-cover opacity-40"
            src={"/assets/login.jpg"}
            alt=""
          />
        </div>

        <div className=" text-white z-[50] absolute bottom-[5vh] left-[5%]">
          <div className="w-[430px] mx-auto">
            <h2 className="text-5xl leading-normal mb-[12px]">Welcome back,</h2>
            <p className="text-[16px] font-normal leading-relaxed text-[#e6e2e2]">
              Let&apos;s continue from where we stopped, deploy and manage your
              software applications smoothly and effectively. Powered by Mezo.
            </p>
          </div>
        </div>

        <div className="absolute bottom-[5vh] right-[5%] z-[50] text-primary-60/40 text-sm">
          <div className="flex gap-3">
            <Link href={"/"}>Privacy</Link>
            <Link href={"/"}>Terms & Condition</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
