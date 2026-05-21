"use client"
import { EmptyComponent } from "@/components/utilities/empty-component"
import { InfoCard } from "@/components/utilities/info-card"
import { PageHeader } from "@/components/utilities/page-header"
import { useUser } from "@/hooks/use-user"
import { Clock, CreditCard, Package } from "lucide-react"
import Link from "next/link"
import React from "react"
import { FundWalletButton } from "@/components/billing/fund-wallet"
import { TransferCredit } from "@/components/billing/transfer-credit"
import { TopUpButton } from "@/components/billing/top-up"
import { TransactionHistory } from "@/components/transactions/transaction-history"
import { convertCreditsToUSD } from "@/lib/convert-credit-to-usd"
import moment from "moment"

const BillingPage = () => {
  const { data } = useUser()
  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Billing"
        subtitle="Manage your credits and recurring payment"
      />

      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard
          title="Credit Balance"
          subtitle={`~${convertCreditsToUSD(data?.user?.wallet?.creditBalance ?? "")} billable credits in MUSD`}
          icon={<CreditCard className="text-primary" size={20} />}
          value={`${Number(data?.user?.wallet?.creditBalance).toFixed(2)} MHCredit`}
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
          value={`${moment().add(1, "day").format("MMM DD, YYYY")}`}
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
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>
                        <p>
                          Fund your wallet with BTC at{" "}
                          <Link
                            href={"https://faucet.test.mezo.org/"}
                            target="_blank"
                            className="text-primary"
                          >
                            https://faucet.test.mezo.org/
                          </Link>
                        </p>
                      </li>
                      <li>
                        <p>
                          Borrow MUSD against your BTC at{" "}
                          <Link
                            href={"https://testnet.mezo.org/borrow"}
                            target="_blank"
                            className="text-primary"
                          >
                            https://testnet.mezo.org/borrow
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

                <div className="flex items-center gap-3">
                  {/* <FundWalletButton /> */}
                  <TopUpButton />
                  <TransferCredit />
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

        <TransactionHistory />
      </div>
    </div>
  )
}

export default BillingPage
