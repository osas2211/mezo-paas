export const convertMUSDToCredits = (mBtcAmount: string | number): string => {
  const numAmount = Number(mBtcAmount);
  // Assuming 1 MUSD = 135 credits
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(numAmount * 135);
};

export const convertCreditsToUSD = (amount: string | number): string => {
  const num_amount = Number(amount);

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(num_amount / 135);
};
