import { describe, it } from "node:test";
import assert from "node:assert";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  backendEnvLine,
  renderDeploymentJson,
  updateFrontendConstants,
  writeDeploymentConfig,
  type DeploymentConfig,
} from "../scripts/lib/update-deployment-config.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REAL_CONSTANTS = readFileSync(
  path.join(REPO_ROOT, "frontend", "lib", "constants.ts"),
  "utf8"
);

const config: DeploymentConfig = {
  network: "mezoTestnet",
  chainId: 31611,
  owner: "0x1111111111111111111111111111111111111111",
  treasury: "0x2222222222222222222222222222222222222222",
  tokenAddress: "0x3333333333333333333333333333333333333333",
  billingAddress: "0x4444444444444444444444444444444444444444",
  tokenDeployed: false,
  timestamp: "2026-10-01T12:00:00.000Z",
  blockNumber: 123n,
};

describe("update-deployment-config", () => {
  it("updates the real frontend constants file", () => {
    const out = updateFrontendConstants(REAL_CONSTANTS, config);

    assert.match(
      out,
      /process\.env\.NEXT_PUBLIC_BILLING_CONTRACT_V2 \|\|\s*"0x4444444444444444444444444444444444444444"/
    );
    assert.match(out, /^export const TOKEN_ADDRESS = "0x3333333333333333333333333333333333333333"/m);
    assert.match(out, /\/\/ Deployed to Mezo Testnet \(2026-10-01\)/);
    assert.match(out, /^\/\/ Owner: 0x1111111111111111111111111111111111111111/m);
    assert.match(out, /^\/\/ Treasury: 0x2222222222222222222222222222222222222222/m);
  });

  it("leaves unrelated addresses untouched", () => {
    const out = updateFrontendConstants(REAL_CONSTANTS, config);

    // Commented-out V1 token and the V1 billing contract must not change
    const v1Token = REAL_CONSTANTS.match(/\/\/ export const TOKEN_ADDRESS = "0x[0-9a-fA-F]{40}"/)![0];
    const v1Billing = REAL_CONSTANTS.match(/BILLING_CONTRACT_ADDRESS =\s*"0x[0-9a-fA-F]{40}"/)![0];
    assert.ok(out.includes(v1Token));
    assert.ok(out.includes(v1Billing));

    // Only the targeted lines differ
    const before = REAL_CONSTANTS.split("\n");
    const after = out.split("\n");
    assert.strictEqual(after.length, before.length);
    const changed = after.filter((line, i) => line !== before[i]).length;
    assert.strictEqual(changed, 5);
  });

  it("preserves CRLF line endings", () => {
    const crlf = REAL_CONSTANTS.replace(/\r?\n/g, "\r\n");
    const out = updateFrontendConstants(crlf, config);
    assert.ok(!/[^\r]\n/.test(out), "no bare LF introduced");
    assert.match(out, /0x4444444444444444444444444444444444444444/);
    assert.match(out, /^\/\/ Owner: 0x1111111111111111111111111111111111111111\r$/m);
  });

  it("is idempotent", () => {
    const once = updateFrontendConstants(REAL_CONSTANTS, config);
    assert.strictEqual(updateFrontendConstants(once, config), once);
  });

  it("throws when the V2 address declaration is missing", () => {
    assert.throws(
      () => updateFrontendConstants('export const TOKEN_ADDRESS = "0x00"', config),
      /Could not find BILLING_CONTRACT_V2_ADDRESS/
    );
  });

  it("renders deployment.json with bigint as string", () => {
    const parsed = JSON.parse(renderDeploymentJson(config));
    assert.strictEqual(parsed.blockNumber, "123");
    assert.strictEqual(parsed.billingAddress, config.billingAddress);
    assert.deepStrictEqual(Object.keys(parsed), [
      "network", "chainId", "owner", "treasury", "tokenAddress",
      "billingAddress", "tokenDeployed", "timestamp", "blockNumber",
    ]);
  });

  it("writes deployment.json and constants.ts into a repo root", () => {
    const root = mkdtempSync(path.join(tmpdir(), "deploy-config-"));
    mkdirSync(path.join(root, "frontend", "lib"), { recursive: true });
    writeFileSync(path.join(root, "frontend", "lib", "constants.ts"), REAL_CONSTANTS);

    const written = writeDeploymentConfig(config, root);

    assert.deepStrictEqual(written, [
      path.join(root, "deployment.json"),
      path.join(root, "frontend", "lib", "constants.ts"),
    ]);
    const json = JSON.parse(readFileSync(path.join(root, "deployment.json"), "utf8"));
    assert.strictEqual(json.billingAddress, config.billingAddress);
    const constants = readFileSync(path.join(root, "frontend", "lib", "constants.ts"), "utf8");
    assert.match(constants, /0x4444444444444444444444444444444444444444/);

    // Second run: constants unchanged, so only deployment.json is reported
    assert.deepStrictEqual(writeDeploymentConfig(config, root), [
      path.join(root, "deployment.json"),
    ]);
  });

  it("prints the backend env line", () => {
    assert.strictEqual(
      backendEnvLine(config),
      "CONTRACT_ADDRESS_V2=0x4444444444444444444444444444444444444444"
    );
  });
});
