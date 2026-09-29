/**
 * Export the IDE workspace as a Hardhat 3 or Foundry project.
 *
 * The export reproduces the IDE's compiler settings (solc version, optimizer,
 * default EVM version) and OpenZeppelin version, and pre-configures Mezo
 * networks (documented RPCs) and Blockscout verification, so a team can move
 * from the IDE to a repo without changing behaviour.
 */

import type { AbiParameter } from "viem"
import { sanitizeProjectName } from "./dapp-templates/shared"
import { MEZO_EXPLORERS, MEZO_FAUCET_URL, MEZO_RPC_URLS } from "./mezo-network"

export type ExportFramework = "hardhat" | "foundry"

export interface ExportInput {
  framework: ExportFramework
  projectName: string
  /** Every .sol file in the workspace (name as in the IDE, content) */
  files: { name: string; content: string }[]
  /** The contract the deploy script deploys */
  main: { fileName: string; contractName: string; constructorInputs: readonly AbiParameter[] }
  compiler: { version: string; optimizer: { enabled: boolean; runs: number } }
}

export interface ExportFile {
  path: string
  content: string
}

/**
 * EVM version the IDE compiles for. The IDE leaves solc's default, which for
 * solc 0.8.28 is "cancun". We pin it explicitly: Foundry defaults to the newest
 * EVM ("prague") regardless of solc, and newer solc versions change the default.
 */
export const EVM_VERSION = "cancun"

/** OpenZeppelin version the IDE resolves imports from (lib/ide/openzeppelin-resolver.ts) */
export const OZ_VERSION = "5.0.2"

const VERSIONS = {
  hardhat: "^3.18.0",
  toolboxViem: "^5.0.7",
  ignition: "^3.1.8",
  verify: "^3.1.1",
  viem: "^2.56.9",
  typescript: "~5.9.3",
  typesNode: "^22.19.0",
}

const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n"

/** "v0.8.28+commit.7893614a" -> "0.8.28" */
export function solcShortVersion(full: string): string {
  return full.replace(/^v/, "").split("+")[0]
}

/** Safe identifier for generated code */
function ident(name: string | undefined, index: number): string {
  const cleaned = (name ?? "").replace(/[^A-Za-z0-9_]/g, "")
  if (!cleaned || /^\d/.test(cleaned)) return `arg${index}`
  return cleaned
}

function usesOpenZeppelin(files: ExportInput["files"]): boolean {
  return files.some((f) => /["']@openzeppelin\/contracts\//.test(f.content))
}

/* ------------------------------------------------------------------ */
/* Placeholder values for constructor arguments                         */
/* ------------------------------------------------------------------ */

/** JSON value for Ignition parameters (bigints as "123n" strings, per Ignition) */
function jsonPlaceholder(param: AbiParameter): unknown {
  const t = param.type
  if (t.endsWith("]")) {
    // Fixed-size arrays (T[N]) need exactly N entries; dynamic arrays start empty
    const fixed = /\[(\d+)\]$/.exec(t)
    if (!fixed) return []
    const inner = { ...param, type: t.slice(0, t.lastIndexOf("[")) } as AbiParameter
    return Array.from({ length: Number(fixed[1]) }, () => jsonPlaceholder(inner))
  }
  if (t.startsWith("tuple")) {
    const comps = (param as { components?: readonly AbiParameter[] }).components ?? []
    return Object.fromEntries(comps.map((c, i) => [c.name || `field${i}`, jsonPlaceholder(c)]))
  }
  if (t.startsWith("uint") || t.startsWith("int")) return "0n"
  if (t === "bool") return false
  if (t === "address") return "0x0000000000000000000000000000000000000000"
  if (t === "bytes") return "0x"
  if (t.startsWith("bytes")) return "0x" + "00".repeat(Number(t.slice(5)) || 32)
  return ""
}

/** Solidity type + default expression for Foundry's deploy script */
function solidityDeclaration(param: AbiParameter, index: number, contractName: string): string {
  const name = ident(param.name, index)
  const t = param.type
  const internal = (param as { internalType?: string }).internalType ?? ""

  if (t.startsWith("tuple")) {
    // internalType: "struct Foo.Bar" (or "struct Bar") [+ array suffix]
    const struct = /struct\s+([\w.]+)/.exec(internal)?.[1] ?? `${contractName}.Struct`
    const qualified = struct.includes(".") ? struct : `${contractName}.${struct}`
    const suffix = t.slice("tuple".length)
    return suffix
      ? `${qualified}${suffix} memory ${name}; // TODO: populate`
      : `${qualified} memory ${name}; // TODO: set fields`
  }
  if (t.endsWith("]")) {
    const base = t.slice(0, t.lastIndexOf("["))
    const fixed = /\[(\d+)\]$/.exec(t)
    if (fixed) return `${t} memory ${name}; // TODO: fill ${fixed[1]} values`
    return `${t} memory ${name} = new ${base}[](0); // TODO: add values`
  }
  if (t === "string") return `string memory ${name} = ""; // TODO`
  if (t === "bytes") return `bytes memory ${name} = ""; // TODO`
  if (t === "address") return `address ${name} = address(0); // TODO`
  if (t === "bool") return `bool ${name} = false; // TODO`
  if (t.startsWith("bytes")) return `${t} ${name} = ${t}(0); // TODO`
  return `${t} ${name} = 0; // TODO`
}

function paramsTable(inputs: readonly AbiParameter[]): string {
  if (inputs.length === 0) return "_This contract has no constructor arguments._"
  return [
    "| # | Name | Type |",
    "| --- | --- | --- |",
    ...inputs.map((p, i) => `| ${i + 1} | \`${ident(p.name, i)}\` | \`${p.type}\` |`),
  ].join("\n")
}

/* ------------------------------------------------------------------ */
/* Hardhat 3                                                            */
/* ------------------------------------------------------------------ */

function hardhatProject(input: ExportInput, name: string): ExportFile[] {
  const { main, compiler } = input
  const solc = solcShortVersion(compiler.version)
  const moduleName = `${main.contractName}Module`
  const argNames = main.constructorInputs.map((p, i) => ident(p.name, i))

  const parameters = {
    [moduleName]: Object.fromEntries(main.constructorInputs.map((p, i) => [argNames[i], jsonPlaceholder(p)])),
  }

  const verifyArgs = argNames.map((a) => `<${a}>`).join(" ")

  return [
    {
      path: "package.json",
      content: json({
        name,
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
          compile: "hardhat build",
          test: "hardhat test",
          "deploy:testnet": `hardhat ignition deploy ignition/modules/${main.contractName}.ts --network mezoTestnet --parameters ignition/parameters.json`,
          "deploy:mainnet": `hardhat ignition deploy ignition/modules/${main.contractName}.ts --network mezoMainnet --parameters ignition/parameters.json`,
        },
        dependencies: usesOpenZeppelin(input.files) ? { "@openzeppelin/contracts": OZ_VERSION } : {},
        devDependencies: {
          "@nomicfoundation/hardhat-ignition": VERSIONS.ignition,
          "@nomicfoundation/hardhat-toolbox-viem": VERSIONS.toolboxViem,
          "@nomicfoundation/hardhat-verify": VERSIONS.verify,
          "@types/node": VERSIONS.typesNode,
          hardhat: VERSIONS.hardhat,
          typescript: VERSIONS.typescript,
          viem: VERSIONS.viem,
        },
      }),
    },
    {
      path: "hardhat.config.ts",
      content: `import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    // Same settings the Mezo IDE compiled with, so bytecode matches
    version: "${solc}",
    settings: {
      optimizer: { enabled: ${compiler.optimizer.enabled}, runs: ${compiler.optimizer.runs} },
      evmVersion: "${EVM_VERSION}",
    },
  },
  networks: {
    mezoTestnet: {
      type: "http",
      chainType: "l1",
      chainId: 31611,
      url: "${MEZO_RPC_URLS.testnet[0]}",
      accounts: [configVariable("MEZO_PRIVATE_KEY")],
    },
    mezoMainnet: {
      type: "http",
      chainType: "l1",
      chainId: 31612,
      url: "${MEZO_RPC_URLS.mainnet[0]}",
      accounts: [configVariable("MEZO_PRIVATE_KEY")],
    },
  },
  // Blockscout explorers for \`hardhat verify blockscout\`
  chainDescriptors: {
    31611: {
      name: "Mezo Testnet",
      blockExplorers: {
        blockscout: {
          name: "Mezo Testnet Explorer",
          url: "${MEZO_EXPLORERS.testnet.url}",
          apiUrl: "${MEZO_EXPLORERS.testnet.api}/api",
        },
      },
    },
    31612: {
      name: "Mezo",
      blockExplorers: {
        blockscout: {
          name: "Mezo Explorer",
          url: "${MEZO_EXPLORERS.mainnet.url}",
          apiUrl: "${MEZO_EXPLORERS.mainnet.api}/api",
        },
      },
    },
  },
});
`,
    },
    {
      path: "tsconfig.json",
      content: json({
        compilerOptions: {
          lib: ["es2023"],
          module: "node16",
          target: "es2022",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          moduleResolution: "node16",
          outDir: "dist",
        },
      }),
    },
    ...input.files.map((f) => ({ path: `contracts/${f.name}`, content: f.content })),
    {
      path: `ignition/modules/${main.contractName}.ts`,
      content: `import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Deploys ${main.contractName}. Constructor arguments come from ignition/parameters.json.
export default buildModule("${moduleName}", (m) => {
${argNames.map((a) => `  const ${a} = m.getParameter("${a}");`).join("\n")}${argNames.length ? "\n\n" : ""}  const contract = m.contract("${main.contractName}", [${argNames.join(", ")}]);

  return { contract };
});
`,
    },
    { path: "ignition/parameters.json", content: json(parameters) },
    {
      path: ".gitignore",
      content: "node_modules\nartifacts\ncache\ntypes\ncoverage\nignition/deployments/chain-31337\n.env\n",
    },
    {
      path: "README.md",
      content: `# ${name}

Hardhat 3 project exported from Mezo IDE.

- Contract: \`${main.contractName}\` (\`contracts/${main.fileName}\`)
- Compiler: solc ${solc}, optimizer ${compiler.optimizer.enabled ? `on (${compiler.optimizer.runs} runs)` : "off"}, EVM ${EVM_VERSION} — same as the IDE${usesOpenZeppelin(input.files) ? `\n- OpenZeppelin Contracts ${OZ_VERSION} (the version the IDE compiled against)` : ""}
- Networks: \`mezoTestnet\` (31611) and \`mezoMainnet\` (31612)

## Setup

Requires Node.js 22+.

\`\`\`bash
npm install
npx hardhat compile
\`\`\`

Store the deployer key in Hardhat's encrypted keystore (recommended):

\`\`\`bash
npx hardhat keystore set MEZO_PRIVATE_KEY
\`\`\`

or set the \`MEZO_PRIVATE_KEY\` environment variable. Get testnet BTC for gas from the [Mezo faucet](${MEZO_FAUCET_URL}).

## Deploy

1. Set the constructor arguments in \`ignition/parameters.json\`:

${paramsTable(main.constructorInputs)}

   Integers are strings ending in \`n\` (e.g. \`"1000000000000000000n"\`); arrays and structs are JSON.

2. Deploy to Mezo Testnet:

\`\`\`bash
npm run deploy:testnet
\`\`\`

Ignition records the deployment in \`ignition/deployments/\` — commit it so your team knows the address.

## Verify

\`\`\`bash
npx hardhat verify blockscout --network mezoTestnet <DEPLOYED_ADDRESS>${verifyArgs ? " " + verifyArgs : ""}
\`\`\`

The Mezo explorer (Blockscout) needs no API key. Mainnet: use \`--network mezoMainnet\`.

> Contracts you already deployed from the IDE were compiled from different file paths, so they won't match this project's metadata byte-for-byte. The IDE verifies those automatically; use this project for new deployments.
`,
    },
  ]
}

/* ------------------------------------------------------------------ */
/* Foundry                                                              */
/* ------------------------------------------------------------------ */

function foundryProject(input: ExportInput, name: string): ExportFile[] {
  const { main, compiler } = input
  const solc = solcShortVersion(compiler.version)
  const oz = usesOpenZeppelin(input.files)
  const argNames = main.constructorInputs.map((p, i) => ident(p.name, i))
  const importPath = `../src/${main.fileName}`
  const ctorSig = main.constructorInputs.map((p) => p.type).join(",")

  const verifyCmd = (net: "testnet" | "mainnet") =>
    `forge verify-contract <DEPLOYED_ADDRESS> src/${main.fileName}:${main.contractName} \\
  --chain ${net === "testnet" ? 31611 : 31612} \\
  --verifier blockscout --verifier-url ${MEZO_EXPLORERS[net].api}/api/${
      main.constructorInputs.length
        ? ` \\
  --constructor-args $(cast abi-encode "constructor(${ctorSig})" ${argNames.map((a) => `<${a}>`).join(" ")})`
        : ""
    }`

  return [
    {
      path: "foundry.toml",
      content: `[profile.default]
src = "src"
out = "out"
libs = ["lib"]
# Same settings the Mezo IDE compiled with, so bytecode matches
solc_version = "${solc}"
optimizer = ${compiler.optimizer.enabled}
optimizer_runs = ${compiler.optimizer.runs}
evm_version = "${EVM_VERSION}"
remappings = [
  "forge-std/=lib/forge-std/src/",${oz ? `\n  "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",` : ""}
]

[rpc_endpoints]
mezo_testnet = "${MEZO_RPC_URLS.testnet[0]}"
mezo_mainnet = "${MEZO_RPC_URLS.mainnet[0]}"
`,
    },
    ...input.files.map((f) => ({ path: `src/${f.name}`, content: f.content })),
    {
      path: "script/Deploy.s.sol",
      content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {${main.contractName}} from "${importPath}";

/// Deploys ${main.contractName}. Set the constructor arguments below before broadcasting.
contract Deploy${main.contractName} is Script {
    function run() external returns (${main.contractName} deployed) {
${main.constructorInputs.map((p, i) => `        ${solidityDeclaration(p, i, main.contractName)}`).join("\n")}${main.constructorInputs.length ? "\n\n" : ""}        vm.startBroadcast();
        deployed = new ${main.contractName}(${argNames.join(", ")});
        vm.stopBroadcast();

        console.log("${main.contractName} deployed at", address(deployed));
    }
}
`,
    },
    {
      path: ".gitignore",
      content: "cache/\nout/\nbroadcast/*/31337/\n.env\n",
    },
    {
      path: "README.md",
      content: `# ${name}

Foundry project exported from Mezo IDE.

- Contract: \`${main.contractName}\` (\`src/${main.fileName}\`)
- Compiler: solc ${solc}, optimizer ${compiler.optimizer.enabled ? `on (${compiler.optimizer.runs} runs)` : "off"}, EVM ${EVM_VERSION} — same as the IDE${oz ? `\n- OpenZeppelin Contracts ${OZ_VERSION} (the version the IDE compiled against)` : ""}
- RPC aliases: \`mezo_testnet\` (31611) and \`mezo_mainnet\` (31612)

## Setup

Install [Foundry](https://book.getfoundry.sh/getting-started/installation), then:

\`\`\`bash
git init
forge install foundry-rs/forge-std${oz ? ` OpenZeppelin/openzeppelin-contracts@v${OZ_VERSION}` : ""}
forge build
\`\`\`

Import your deployer key into Foundry's encrypted keystore (recommended):

\`\`\`bash
cast wallet import mezo-deployer --interactive
\`\`\`

Get testnet BTC for gas from the [Mezo faucet](${MEZO_FAUCET_URL}).

## Deploy

1. Set the constructor arguments at the top of \`script/Deploy.s.sol\`:

${paramsTable(main.constructorInputs)}

2. Deploy and verify on Mezo Testnet in one step:

\`\`\`bash
forge script script/Deploy.s.sol --rpc-url mezo_testnet --account mezo-deployer --broadcast \\
  --verify --verifier blockscout --verifier-url ${MEZO_EXPLORERS.testnet.api}/api/
\`\`\`

Mainnet: \`--rpc-url mezo_mainnet\` and \`--verifier-url ${MEZO_EXPLORERS.mainnet.api}/api/\`.

## Verify an existing deployment

\`\`\`bash
${verifyCmd("testnet")}
\`\`\`

The Mezo explorer (Blockscout) needs no API key.

> Contracts you already deployed from the IDE were compiled from different file paths, so they won't match this project's metadata byte-for-byte. The IDE verifies those automatically; use this project for new deployments.
`,
    },
  ]
}

export function generateExportProject(input: ExportInput): ExportFile[] {
  const name = sanitizeProjectName(input.projectName)
  return input.framework === "foundry" ? foundryProject(input, name) : hardhatProject(input, name)
}
