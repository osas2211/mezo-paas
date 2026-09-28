/**
 * Deployment Script for MezoHostBillingV2 - Testnet
 *
 * This script deploys the security-fixed BillingContractV2 to the Mezo testnet.
 *
 * CRITICAL SECURITY REQUIREMENTS:
 * 1. Owner and Treasury MUST be different addresses
 * 2. Owner controls admin functions (pause, treasury moves, emergency withdraw)
 * 3. Treasury receives funds from collateral moves
 *
 * Environment Variables Required:
 * - MEZO_RPC_URL: Mezo testnet RPC endpoint
 * - MEZO_OWNER_PRIVATE_KEY: Private key for owner/deployer
 * - MEZO_TREASURY_PRIVATE_KEY: Private key for treasury wallet
 * - TOKEN_ADDRESS: (Optional) ERC20 token address. If not set, deploys MockBTC
 * - SKIP_CONFIG_UPDATE: (Optional) "true" to skip writing config files
 *
 * On non-local networks this writes <repo>/deployment.json and updates
 * <repo>/frontend/lib/constants.ts. Backend .env files are NOT edited; the
 * CONTRACT_ADDRESS_V2 line to set is printed at the end.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-v2-testnet.ts --network mezoTestnet
 *
 * For local testing:
 *   npx hardhat run scripts/deploy-v2-testnet.ts --network hardhatMainnet
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { network } from "hardhat";
import { formatEther, type Address } from "viem";
import {
  backendEnvLine,
  renderDeploymentJson,
  writeDeploymentConfig,
} from "./lib/update-deployment-config.js";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);
const LOCAL_CHAIN_ID = 31337;

interface DeploymentResult {
  network: string;
  chainId: number;
  owner: Address;
  treasury: Address;
  tokenAddress: Address;
  billingAddress: Address;
  tokenDeployed: boolean;
  timestamp: string;
  blockNumber: bigint;
}

async function main(): Promise<DeploymentResult> {
  console.log("\n" + "=".repeat(60));
  console.log("  MezoHostBillingV2 Deployment - Security Audit Fix");
  console.log("=".repeat(60) + "\n");

  // Create network connection
  const networkConnection = await network.create();
  const { viem } = networkConnection;
  const publicClient = await viem.getPublicClient();

  // Get wallet clients
  const walletClients = await viem.getWalletClients();

  if (walletClients.length < 2) {
    throw new Error(
      "ERROR: Need at least 2 wallet clients (owner and treasury).\n" +
        "Ensure MEZO_OWNER_PRIVATE_KEY and MEZO_TREASURY_PRIVATE_KEY are set."
    );
  }

  const [owner, treasury] = walletClients;
  const ownerAddress = owner.account!.address;
  const treasuryAddress = treasury.account!.address;

  // CRITICAL SECURITY CHECK: Owner and Treasury must be different
  console.log("Security Checks:");
  console.log("-".repeat(40));

  if (ownerAddress.toLowerCase() === treasuryAddress.toLowerCase()) {
    console.error("\n" + "!".repeat(60));
    console.error("  CRITICAL ERROR: Owner and Treasury are the SAME address!");
    console.error("  This was the root cause of the security vulnerability.");
    console.error("  Deployment ABORTED for security reasons.");
    console.error("!".repeat(60) + "\n");
    throw new Error(
      "SECURITY: Owner and Treasury must be different addresses.\n" +
        `Owner:    ${ownerAddress}\n` +
        `Treasury: ${treasuryAddress}\n` +
        "Please configure separate private keys."
    );
  }

  console.log("  [PASS] Owner != Treasury");
  console.log(`         Owner:    ${ownerAddress}`);
  console.log(`         Treasury: ${treasuryAddress}`);

  // Get balances
  const ownerBalance = await publicClient.getBalance({ address: ownerAddress });
  const treasuryBalance = await publicClient.getBalance({
    address: treasuryAddress,
  });

  console.log(`\n  Owner balance:    ${formatEther(ownerBalance)} ETH`);
  console.log(`  Treasury balance: ${formatEther(treasuryBalance)} ETH`);

  if (ownerBalance === 0n) {
    throw new Error("Owner has no ETH for gas. Please fund the owner wallet.");
  }

  // Get network info
  const chainId = await publicClient.getChainId();
  const blockNumber = await publicClient.getBlockNumber();

  console.log(`\nNetwork Information:`);
  console.log("-".repeat(40));
  console.log(`  Network:      ${networkConnection.networkName}`);
  console.log(`  Chain ID:     ${chainId}`);
  console.log(`  Block Number: ${blockNumber}`);

  // Determine token address
  let tokenAddress: Address;
  let tokenDeployed = false;

  if (process.env.TOKEN_ADDRESS) {
    tokenAddress = process.env.TOKEN_ADDRESS as Address;
    console.log(`\nUsing existing token: ${tokenAddress}`);

    // Verify token exists
    const code = await publicClient.getCode({ address: tokenAddress });
    if (!code || code === "0x") {
      throw new Error(`No contract found at token address: ${tokenAddress}`);
    }
    console.log("  [PASS] Token contract verified");
  } else {
    console.log("\nNo TOKEN_ADDRESS set. Deploying MockBTC for testing...");

    const mockBTC = await viem.deployContract("MockBTC", [], {
      walletClient: owner,
    });
    tokenAddress = mockBTC.address;
    tokenDeployed = true;

    console.log(`  MockBTC deployed to: ${tokenAddress}`);

    // Transfer some tokens to treasury for testing
    const testAmount = 1000000n * 10n ** 18n; // 1M tokens
    await mockBTC.write.transfer([treasuryAddress, testAmount], {
      account: owner.account!,
    });
    console.log(`  Transferred ${formatEther(testAmount)} MockBTC to treasury`);
  }

  // Deploy BillingContractV2
  console.log("\nDeploying MezoHostBillingV2...");
  console.log("-".repeat(40));

  const billing = await viem.deployContract(
    "MezoHostBillingV2",
    [tokenAddress, treasuryAddress],
    { walletClient: owner }
  );

  const billingAddress = billing.address;
  console.log(`  Contract deployed to: ${billingAddress}`);

  // Verify deployment
  console.log("\nPost-Deployment Verification:");
  console.log("-".repeat(40));

  const deployedOwner = await billing.read.owner();
  const deployedTreasury = await billing.read.treasury();
  const deployedToken = await billing.read.token();
  const reserveRatio = await billing.read.reserveRatioBps();
  const isPaused = await billing.read.paused();

  console.log(`  [CHECK] owner():         ${deployedOwner}`);
  console.log(`  [CHECK] treasury():      ${deployedTreasury}`);
  console.log(`  [CHECK] token():         ${deployedToken}`);
  console.log(`  [CHECK] reserveRatioBps: ${reserveRatio} (${Number(reserveRatio) / 100}%)`);
  console.log(`  [CHECK] paused():        ${isPaused}`);

  // Final security verification
  if (deployedOwner.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw new Error("Owner mismatch after deployment!");
  }
  if (deployedTreasury.toLowerCase() !== treasuryAddress.toLowerCase()) {
    throw new Error("Treasury mismatch after deployment!");
  }
  if (deployedOwner.toLowerCase() === deployedTreasury.toLowerCase()) {
    throw new Error("CRITICAL: Owner equals Treasury after deployment!");
  }

  console.log("\n  [PASS] All verifications passed!");

  // Summary
  const timestamp = new Date().toISOString();
  const result: DeploymentResult = {
    network: networkConnection.networkName,
    chainId,
    owner: ownerAddress,
    treasury: treasuryAddress,
    tokenAddress,
    billingAddress,
    tokenDeployed,
    timestamp,
    blockNumber,
  };

  console.log("\n" + "=".repeat(60));
  console.log("  DEPLOYMENT SUCCESSFUL");
  console.log("=".repeat(60));
  console.log(`
  Network:          ${result.network}
  Chain ID:         ${result.chainId}
  Block:            ${result.blockNumber}
  Timestamp:        ${result.timestamp}

  Contracts:
  - BillingV2:      ${result.billingAddress}
  - Token:          ${result.tokenAddress} ${result.tokenDeployed ? "(newly deployed)" : "(existing)"}

  Addresses:
  - Owner:          ${result.owner}
  - Treasury:       ${result.treasury}

  SECURITY:         Owner != Treasury [VERIFIED]
`);

  // Update deployment.json and frontend constants. Skipped for local chains
  // so a dry run never points the app at a throwaway contract.
  console.log("Config Updates:");
  console.log("-".repeat(40));
  if (chainId === LOCAL_CHAIN_ID || process.env.SKIP_CONFIG_UPDATE === "true") {
    console.log(
      `  [SKIP] ${chainId === LOCAL_CHAIN_ID ? "Local chain" : "SKIP_CONFIG_UPDATE=true"} - no files written`
    );
  } else {
    for (const file of writeDeploymentConfig(result, REPO_ROOT)) {
      console.log(`  [WROTE] ${path.relative(REPO_ROOT, file)}`);
    }
  }

  console.log("\nNext Steps:");
  console.log("-".repeat(40));
  console.log("1. Set in backend/.env and backend/.env-prod (not edited automatically):");
  console.log(`     ${backendEnvLine(result)}`);
  console.log("   then restart the backend");
  console.log("2. If NEXT_PUBLIC_BILLING_CONTRACT_V2 is set in the frontend env, update it too");
  console.log("3. Treasury wallet: approve the new contract so funds can be returned");
  console.log("4. Run integration tests on testnet");
  console.log("5. Request re-audit from Mezo security team");
  console.log("6. Only accept real collateral after audit passes\n");

  // Output JSON for automated pipelines
  console.log("Deployment JSON (for CI/CD):");
  console.log(renderDeploymentJson(result));

  return result;
}

main()
  .then((result) => {
    console.log("\nDeployment completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:", error.message);
    process.exit(1);
  });
