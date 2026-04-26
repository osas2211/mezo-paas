"use client"

import React, { useState } from "react"
import { Modal, Button, Typography, message } from "antd"
import { useUser } from "@/hooks/use-user"
import { CopyOutlined } from "@ant-design/icons"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { useToastify } from "@/hooks/use-toastify"

const { Text } = Typography

export const FundWalletButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data } = useUser()
  const address = data?.user?.wallet?.address

  const showModal = () => setIsModalOpen(true)
  const handleOk = () => setIsModalOpen(false)
  const handleCancel = () => setIsModalOpen(false)
  const { successToast } = useToastify()

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      successToast("Address copied to clipboard!", "top-center")
    }
  }

  return (
    <>
      <button
        onClick={showModal}
        className="text-dark bg-primary px-6 py-2 text-[16px] cursor-pointer hover:bg-primary/90 transition-all font-medium"
      >
        Fund wallet
      </button>

      <Modal
        title={
          <span className="text-white text-lg font-medium">
            Fund Your Wallet
          </span>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        centered
        width={500}
        styles={{
          mask: {
            backdropFilter: "blur(4px)",
          },
          // content: {
          //   backgroundColor: "#0a0a0a",
          //   border: "1px solid rgba(255, 255, 255, 0.1)",
          // },
        }}
      >
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <p className="text-white/60 text-sm">
              Copy your wallet address below to receive <b>MUSD</b>.
            </p>
            <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center justify-between gap-4 group hover:border-primary/30 transition-all">
              <div className="overflow-hidden">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                  My Wallet Address
                </p>
                <Text className="text-white! font-mono break-all text-xs block">
                  {address || "Loading your wallet..."}
                </Text>
              </div>
              {address && (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CopyOutlined className="text-dark!" color="#000" />}
                  onClick={copyToClipboard}
                  className="shrink-0"
                />
              )}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-5 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
              <ExternalLink /> Quick Instructions
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary text-dark flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  First, get some **Testnet BTC** from the official{" "}
                  <Link
                    href="https://faucet.test.mezo.org/"
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    Mezo Faucet
                  </Link>
                  .
                </p>
              </div>

              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary text-dark flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Head to the{" "}
                  <Link
                    href="https://testnet.mezo.org/borrow"
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    Mezo Portal
                  </Link>{" "}
                  to deposit your BTC and borrow <b>MUSD</b>.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary text-dark flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Finally, transfer the <b>MUSD</b> to the address shown above.
                  Your balance will update automatically.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-white/30 text-center">
            MUSD is the stablecoin used for automated billing on the Mezo
            network.
          </p>
        </div>
      </Modal>
    </>
  )
}
