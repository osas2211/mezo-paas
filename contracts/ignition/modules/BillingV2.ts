import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deployment module for MezoHostBillingV2
 *
 * Required environment variables:
 * - TOKEN_ADDRESS: The ERC20 token address (e.g., MockBTC, MUSD)
 * - TREASURY_ADDRESS: The treasury wallet address
 *
 * Usage:
 * npx hardhat ignition deploy ./ignition/modules/BillingV2.ts --network mezo-testnet
 */
const BillingV2Module = buildModule("BillingV2Module", (m) => {
  // Get deployment parameters from environment or use defaults for testing
  const tokenAddress = m.getParameter(
    "tokenAddress",
    process.env.TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000"
  );

  const treasuryAddress = m.getParameter(
    "treasuryAddress",
    process.env.TREASURY_ADDRESS || "0x0000000000000000000000000000000000000000"
  );

  // Deploy the BillingContractV2
  const billingV2 = m.contract("MezoHostBillingV2", [
    tokenAddress,
    treasuryAddress,
  ]);

  return { billingV2 };
});

export default BillingV2Module;
