"use client"
import { PageHeader } from "@/components/utilities/page-header"
import { Shield, User } from "lucide-react"
import React from "react"
import { useLogout } from "@/hooks/use-auth"
import { LoadingOutlined } from "@ant-design/icons"

const SettingsPage = () => {
  const { mutate: logout, isPending } = useLogout()
  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader title="Settings" subtitle="Manage your account" />

      <div className="">
        <div>
          <div className="border border-white/10 bg-white/5 p-1">
            <div className="border border-white/20 bg-dark p-4 md:p-6 space-y-5">
              <div className="grid md:grid-cols-[40px_auto] gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-primary/10">
                  <User className="text-primary" size={26} />
                </div>

                <div className="">
                  <h3 className="font-medium">Account</h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-white/60 w-24">Email</dt>
                      <dd className="text-white/90">user@mezo-org.com</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-white/60 w-24">User ID</dt>
                      <dd className="text-white/90 font-mono text-xs">
                        73dgate-524b-092l-fs83-3828ba527fde89
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-white/60 w-24">Name</dt>
                      <dd className="text-white/90">Mezo User</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="border border-white/10 bg-white/5 p-1">
          <div className="border border-white/20 bg-dark p-4 md:p-6 space-y-5">
            <div className="grid md:grid-cols-[40px_auto] gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-red-500/10">
                <Shield className="text-red-500" size={26} />
              </div>

              <div className="">
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-xs text-white/60 mt-1">
                  Clear your session and return to the login page.
                </p>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center justify-center gap-1.5 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed py-1.5 px-3 text-sm bg-red-600 hover:bg-red-700 text-white mt-3"
                >
                  {isPending ? <LoadingOutlined /> : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
