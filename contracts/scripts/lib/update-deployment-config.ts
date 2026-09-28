/**
 * Post-deploy config updates for MezoHostBillingV2.
 *
 * Writes:
 *   - <repo>/deployment.json
 *   - <repo>/frontend/lib/constants.ts  (BILLING_CONTRACT_V2_ADDRESS fallback,
 *     TOKEN_ADDRESS, and the owner/treasury/date comments above it)
 *
 * Backend .env files hold private keys, so they are never edited here —
 * the caller prints the CONTRACT_ADDRESS_V2 line to paste instead.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface DeploymentConfig {
  network: string;
  chainId: number;
  owner: string;
  treasury: string;
  tokenAddress: string;
  billingAddress: string;
  tokenDeployed: boolean;
  timestamp: string;
  blockNumber: bigint | string;
}

const ADDRESS = "0x[0-9a-fA-F]{40}";

const BILLING_V2_RE = new RegExp(
  `(export const BILLING_CONTRACT_V2_ADDRESS =\\s*process\\.env\\.NEXT_PUBLIC_BILLING_CONTRACT_V2 \\|\\|\\s*)"${ADDRESS}"`
);
// Anchored to line start so the commented-out V1 TOKEN_ADDRESS is left alone
const TOKEN_RE = new RegExp(`^(export const TOKEN_ADDRESS = )"${ADDRESS}"`, "m");
const DEPLOYED_COMMENT_RE = /\/\/ Deployed to Mezo Testnet \([^)]*\)/;
const OWNER_COMMENT_RE = new RegExp(`^// Owner: ${ADDRESS}`, "m");
const TREASURY_COMMENT_RE = new RegExp(`^// Treasury: ${ADDRESS}`, "m");

export function renderDeploymentJson(config: DeploymentConfig): string {
  return (
    JSON.stringify(
      config,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2
    ) + "\n"
  );
}

/**
 * Returns the updated constants.ts source. Throws if the V2 billing address
 * declaration can't be found, so a changed file layout fails loudly instead
 * of silently leaving the frontend on the old contract.
 */
export function updateFrontendConstants(
  source: string,
  config: DeploymentConfig
): string {
  if (!BILLING_V2_RE.test(source)) {
    throw new Error(
      "Could not find BILLING_CONTRACT_V2_ADDRESS fallback in frontend constants"
    );
  }

  const date = config.timestamp.slice(0, 10);

  return source
    .replace(BILLING_V2_RE, `$1"${config.billingAddress}"`)
    .replace(TOKEN_RE, `$1"${config.tokenAddress}"`)
    .replace(DEPLOYED_COMMENT_RE, `// Deployed to Mezo Testnet (${date})`)
    .replace(OWNER_COMMENT_RE, `// Owner: ${config.owner}`)
    .replace(TREASURY_COMMENT_RE, `// Treasury: ${config.treasury}`);
}

export function writeDeploymentConfig(
  config: DeploymentConfig,
  repoRoot: string
): string[] {
  const written: string[] = [];

  const deploymentPath = path.join(repoRoot, "deployment.json");
  writeFileSync(deploymentPath, renderDeploymentJson(config));
  written.push(deploymentPath);

  const constantsPath = path.join(repoRoot, "frontend", "lib", "constants.ts");
  const source = readFileSync(constantsPath, "utf8");
  const updated = updateFrontendConstants(source, config);
  if (updated !== source) {
    writeFileSync(constantsPath, updated);
    written.push(constantsPath);
  }

  return written;
}

export function backendEnvLine(config: DeploymentConfig): string {
  return `CONTRACT_ADDRESS_V2=${config.billingAddress}`;
}
