"use client"
import { EmptyComponent } from "@/components/utilities/empty-component"
import { InfoCard } from "@/components/utilities/info-card"
import { PageHeader } from "@/components/utilities/page-header"
import { ArrowDownRight, Clock, CreditCard, Package } from "lucide-react"
import Link from "next/link"
import React from "react"

const BillingPage = () => {
  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Billing"
        subtitle="Manage your credits and recurring payment"
      />

      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard
          title="Credit Balance"
          subtitle="$0.25 per service/month"
          icon={<CreditCard className="text-primary" size={20} />}
          value={"$1.00"}
        />

        <InfoCard
          title="Monthly costs"
          subtitle="0 total services"
          icon={<Package className="text-primary" size={20} />}
          value={"$0.00"}
        />

        <InfoCard
          title="Next billing"
          icon={<Clock className="text-primary" size={20} />}
          value={"June 5, 2026"}
          status="active"
        />
      </div>

      <div className="">
        <div>
          <div className="border border-white/10 bg-white/5 p-1">
            <div className="border border-white/20 bg-dark p-4 md:p-6 text-sm">
              <div className="flex items-center gap-4 justify-between">
                <div className="space-y-5">
                  <h3>Add Credits</h3>
                  <div className="space-y-3">
                    <ol className="list-decimal pl-4">
                      <li>
                        <p>
                          Fund your wallet with MUSD at{" "}
                          <Link
                            href={"https://faucet.test.mezo.org/"}
                            target="_blank"
                            className="text-primary"
                          >
                            https://faucet.test.mezo.org/
                          </Link>
                        </p>
                      </li>
                    </ol>
                    <p>
                      Billing is done automatically. So, you don&apos;t have to
                      sign transactions every time. You&apos;ll be notified once
                      credit is exhausted.
                    </p>
                  </div>
                </div>

                <div className="">
                  <button className="text-dark bg-primary px-6 py-2 text-[16px] cursor-pointer">
                    Fund wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <EmptyComponent
            icon={<Package size={30} className="text-white/60" />}
            description={<p className="text-white/60">No billable services</p>}
            title="Services"
          />
        </div>

        <div className="">
          <div className="border border-white/10 bg-white/5 p-1">
            <div className="border border-white/20 bg-dark p-6 min-h-50 space-y-5">
              <div className="text-xl font-semibold font-sans">
                <h3 className="text-[16px] font-medium">Transaction History</h3>

                <div className="space-y-2 font-normal md:h-50 py-7 text-xs">
                  {/* Transaction Record */}
                  <div className="flex items-center gap-4 justify-between">
                    <div className="">
                      <div className="inline-flex gap-2 items-center">
                        <ArrowDownRight className="text-green-500" size={18} />
                        <div>
                          <p className="text-sm mb-0.5">Welcome credit</p>
                          <p className="text-white/60">Mar 30, 9:43 PM</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm mb-0.5 text-green-500">+$1.00</p>
                      <p className="text-white/60 text-end">$1.00</p>
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

export default BillingPage
