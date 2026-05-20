export const convertCreditsToUSD = (amount: string): string => {
  const num_amount = Number(amount)

  return `$${(num_amount / 50).toFixed(2)}`
}
