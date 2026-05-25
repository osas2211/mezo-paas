export const CREDIT_PACKAGES = [
  { label: "Starter", amount: "5", credits: `${5 * 135}`, popular: false },
  { label: "Builder", amount: "25", credits: `${25 * 135}`, popular: true },
  { label: "Pro", amount: "50", credits: `${50 * 135}`, popular: false },
  { label: "Scale", amount: "250", credits: `${250 * 135}`, popular: false },
];

export type TopUpStep = "input" | "approving" | "topup" | "success";
