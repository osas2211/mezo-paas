"use client"

import React, { useState } from "react"
import { Modal, Form, Input, InputNumber } from "antd"
import { useTransferCredits, useUser } from "@/hooks/use-user"
import {
  Mail,
  Coins,
  Send,
  Info,
  ArrowLeftRight,
  CreditCard,
} from "lucide-react"

export const TransferCredit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm<{ email: string; amount: number }>()

  const { data: userData } = useUser()
  const { mutateAsync: transferCredits, isPending } = useTransferCredits()

  const currentCredits = Number(userData?.user?.wallet?.creditBalance || 0)

  const showModal = () => {
    setIsModalOpen(true)
    form.resetFields()
  }

  const handleCancel = () => {
    if (isPending) return
    setIsModalOpen(false)
    form.resetFields()
  }

  const onFinish = async (values: { email: string; amount: number }) => {
    try {
      await transferCredits({
        email: values.email,
        amount: values.amount,
      })
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error("Transfer credits error:", error)
    }
  }

  const setPercentageAmount = (percentage: number) => {
    const calculated = parseFloat((currentCredits * percentage).toFixed(2))
    form.setFieldsValue({ amount: calculated })
  }

  return (
    <>
      <button
        onClick={showModal}
        className="text-primary border border-primary/50 px-6 py-2 text-[16px] cursor-pointer hover:bg-primary/10 hover:border-primary transition-all font-medium duration-300 rounded-sm"
      >
        Transfer credits
      </button>

      <Modal
        title={
          <span className="text-white text-lg font-medium flex items-center gap-2">
            <ArrowLeftRight className="text-primary h-5 w-5" />
            <span>Transfer Credits</span>
          </span>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={500}
        styles={{
          mask: {
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={isPending}
          requiredMark={false}
          className="mt-6 space-y-5"
        >
          {/* Info Card displaying Available Balance */}
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl group hover:border-primary/20 transition-all duration-300">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">
                Available Balance
              </p>
              <p className="text-white font-semibold text-lg font-mono">
                {currentCredits.toFixed(2)} MHCredit
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <CreditCard className="text-primary h-5 w-5" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Recipient Email Input */}
            <Form.Item
              name="email"
              label={
                <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                  Recipient Email
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter the recipient's email address",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
              className="mb-0"
            >
              <Input
                prefix={<Mail className="text-white/30 h-4 w-4 mr-2" />}
                placeholder="e.g. user@example.com"
                className="h-[45px] w-full bg-white/5 border-white/10 text-white! rounded-lg hover:border-primary/50 focus:border-primary/50! focus:bg-transparent! transition-all"
                autoFocus
              />
            </Form.Item>

            {/* Amount Input */}
            <Form.Item
              name="amount"
              label={
                <div className="flex justify-between items-center w-full flex-col gap-3">
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    Amount (Credits)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPercentageAmount(0.25)}
                      className="text-[10px] bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 text-white/50 hover:text-primary px-2 py-0.5 rounded transition-all cursor-pointer font-medium"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPercentageAmount(0.5)}
                      className="text-[10px] bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 text-white/50 hover:text-primary px-2 py-0.5 rounded transition-all cursor-pointer font-medium"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPercentageAmount(1.0)}
                      className="text-[10px] bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 text-white/50 hover:text-primary px-2 py-0.5 rounded transition-all cursor-pointer font-medium"
                    >
                      Max
                    </button>
                  </div>
                </div>
              }
              rules={[
                {
                  required: true,
                  message: "Please specify the amount to transfer",
                },
                {
                  validator: async (_, value) => {
                    if (value === undefined || value === null) return
                    if (value <= 0) {
                      throw new Error("Amount must be greater than 0")
                    }
                    if (value > currentCredits) {
                      throw new Error(
                        `Amount exceeds available balance of ${currentCredits.toFixed(2)} MHCredit`,
                      )
                    }
                  },
                },
              ]}
              className="mb-0"
            >
              <InputNumber
                prefix={<Coins className="text-white/30 h-4 w-4 mr-2" />}
                placeholder="0.00"
                min={0.01}
                step={0.01}
                className="w-40! h-[45px] flex items-center bg-white/5 border-white/10 text-white! rounded-lg hover:border-primary/50 focus:border-primary/50! transition-all [&_.ant-input-number-input]:text-white"
              />
            </Form.Item>
          </div>

          {/* Warning / Caution Box */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-lg flex gap-3 text-xs text-amber-200/80 leading-normal">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              Transfers are completed in real-time and cannot be undone. Please
              ensure the recipient&apos;s email is correct.
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-medium border border-white/10 hover:border-white/20 text-white rounded cursor-pointer transition-all disabled:opacity-50 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-medium bg-primary text-dark hover:bg-primary/90 rounded cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 disabled:bg-primary/50"
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-dark border-t-transparent animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Transfer Credits</span>
                </>
              )}
            </button>
          </div>
        </Form>
      </Modal>
    </>
  )
}
