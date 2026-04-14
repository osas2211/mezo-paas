"use client"
import { PageHeader } from "@/components/utilities/page-header"
import { ExternalLink, Trash2 } from "lucide-react"
import Image from "next/image"
import React from "react"
import { FiGithub } from "react-icons/fi"

const IntegrationsPage = () => {
  return (
    <div className="space-y-5 md:space-y-10 font-sans">
      <PageHeader
        title="Integrations"
        subtitle="Connect with third-party services to automate aspects of your workflow"
      />

      <div className="">
        <div>
          <div className="border border-white/10 bg-white/5 p-1">
            <div className="border border-white/20 bg-dark p-4 md:p-6 min-h-50 space-y-5">
              <div className="grid md:grid-cols-[40px_auto] gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-white">
                  <FiGithub className="text-dark" size={26} />
                </div>

                <div className="">
                  <h3 className="font-medium">Github</h3>
                  <p className="text-white/60 text-xs">
                    Connect your GitHub account to deploy private repositories.
                  </p>
                  <div className="p-2">
                    <div className="py-6 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2.5">
                        <img
                          src={
                            "https://img.freepik.com/free-photo/african-american-man-wearing-round-glasses_273609-10062.jpg"
                          }
                          alt="User Github profile"
                          className="rounded-full bg-white object-cover h-8 w-8"
                        />
                        <p className="text-sm">Osas2211</p>
                        <p className="text-white/60 text-xs">User</p>
                      </div>
                      <Trash2
                        size={16}
                        className="text-white/40 cursor-pointer"
                      />
                    </div>
                    <div className="">
                      <button className="flex gap-2 items-center cursor-pointer">
                        <ExternalLink size={16} className="text-white/70" />
                        <span className="text-sm text-white/70 font-medium">
                          Add another account
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationsPage
