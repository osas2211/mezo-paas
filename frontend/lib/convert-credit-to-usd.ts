import { CREDITS_PER_MUSD, STAKED_CREDITS_PER_MUSD } from "./constants";

export const convertMUSDToCredits = (mBtcAmount: string | number): string => {
  const numAmount = Number(mBtcAmount);
  // 1 MUSD = 135 credits (regular top-up)
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(numAmount * CREDITS_PER_MUSD);
};

export const convertCreditsToUSD = (amount: string | number): string => {
  const num_amount = Number(amount);
  // Regular credits: 135 credits = 1 MUSD
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(num_amount / CREDITS_PER_MUSD);
};

export const convertStakedCreditsToUSD = (amount: string | number): string => {
  const num_amount = Number(amount);
  // Staked credits: 1350 credits = 1 MUSD (10x multiplier for locked collateral)
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(num_amount / STAKED_CREDITS_PER_MUSD);
};
