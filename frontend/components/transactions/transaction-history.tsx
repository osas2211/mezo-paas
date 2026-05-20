import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import React from "react"
import { useGetTransactionHistory } from "@/hooks/use-user"
import { LoadingOutlined } from "@ant-design/icons"
import moment from "moment"
import { TransactionType } from "@/types/user"
import { convertCreditsToUSD } from "@/lib/convert-credit-to-usd"

export const TransactionHistory = () => {
  const { data, isLoading } = useGetTransactionHistory()
  if (isLoading) {
    return (
      <div className="">
        <div className="border border-white/10 bg-white/5 p-1">
          <div className="border border-white/20 bg-dark p-6 min-h-50 space-y-5">
            <div className="text-xl font-semibold font-sans">
              <h3 className="text-[16px] font-medium">Transaction History</h3>

              <div className="space-y-2 font-normal md:h-50 py-7 text-xs flex items-center justify-center gap-2">
                <LoadingOutlined />
                <p>Loading history...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="">
      <div className="border border-white/10 bg-white/5 p-1">
        <div className="border border-white/20 bg-dark p-6 min-h-50 space-y-5">
          <div className="text-xl font-semibold font-sans">
            <h3 className="text-[16px] font-medium">Transaction History</h3>

            <div className="space-y-2 font-normal md:h-50 py-7 text-xs">
              {/* Transaction Record */}
              {data?.slice(0, 4)?.map((transaction) => {
                return (
                  <div
                    className="flex items-center gap-4 justify-between"
                    key={transaction.id}
                  >
                    <div className="">
                      <div className="inline-flex gap-2 items-center">
                        {transaction.type === TransactionType.CREDIT ? (
                          <ArrowDownRight
                            className="text-green-500"
                            size={18}
                          />
                        ) : (
                          <ArrowUpRight className="text-red-500" size={18} />
                        )}
                        <div>
                          <p className="text-sm mb-0.5">{transaction.title}</p>
                          <p className="text-white/60">
                            {moment(transaction.createdAt).format("MMM DD, LT")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p
                        className={`text-sm mb-0.5 ${transaction.type === TransactionType.CREDIT ? "text-green-500" : "text-red-500"}`}
                      >
                        {transaction.type === TransactionType.CREDIT
                          ? "+"
                          : "-"}
                        {Number(transaction.amount).toFixed(2)} MHCredit
                      </p>
                      <p className="text-white/60 text-end">
                        ~{convertCreditsToUSD(transaction.amount)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
