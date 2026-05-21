export const CREDIT_PACKAGES = [
    { label: "Starter", amount: "0.001", credits: "50", popular: false },
    { label: "Builder", amount: "0.005", credits: "250", popular: true },
    { label: "Pro", amount: "0.01", credits: "500", popular: false },
    { label: "Scale", amount: "0.05", credits: "2,500", popular: false },
]

export type TopUpStep = "input" | "approving" | "topup" | "success"
