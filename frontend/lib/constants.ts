// V1 Contract Addresses (deprecated)
// export const TOKEN_ADDRESS = "0xaa81f53cA7990B69C0FBe72aC6Ad919CF567f9E9";
// export const BILLING_CONTRACT_ADDRESS = "0x86D7f42fE5F8F6538AF6664bc10B297AB8A01b5B";

export const TOKEN_ADDRESS = "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";

// V1 Billing Contract (for backwards compatibility)
export const BILLING_CONTRACT_ADDRESS =
  "0x31435dCa932F66cf1754a54467dA34F29F52482a";

// V2 Billing Contract with Treasury Management & Yield Support
// Deployed to Mezo Testnet
export const BILLING_CONTRACT_V2_ADDRESS =
  process.env.NEXT_PUBLIC_BILLING_CONTRACT_V2 ||
  "0xCE9B5Becc65dED06D60aa7914d5b3782e0fDcF16";

// Yield configuration
export const ANNUAL_YIELD_BPS = 800; // 8% APY in basis points
export const RESERVE_RATIO_BPS = 2000; // 20% reserve ratio
