export const convertMBtcToUSD = (mBtcAmount: string | number): string => {
  const numAmount = Number(mBtcAmount)
  // Assuming 1 mBTC = $60 USD
  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(numAmount * 60)
}

export const convertCreditsToUSD = (amount: string | number): string => {
  const num_amount = Number(amount)

  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(num_amount / 50)
}
