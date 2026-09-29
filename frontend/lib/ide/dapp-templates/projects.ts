/**
 * Project assemblers for each starter template.
 * (No backticks or "${" in generated code — see shared.ts.)
 */

import {
  VERSIONS,
  abiHelpersFile,
  chainsFile,
  contractFile,
  contractPanelFile,
  escapeText,
  gitignoreFile,
  pageBody,
  readmeFile,
  stylesFile,
  type TemplateContext,
} from "./shared"
import {
  viemActionsFile,
  viemWalletFile,
  wagmiActionsFile,
  wagmiConfigFile,
  wagmiProvidersFile,
} from "./adapters"

export interface GeneratedFile {
  path: string
  content: string
}

const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n"

/* ------------------------------------------------------------------ */
/* Next.js (App Router) shared scaffolding                              */
/* ------------------------------------------------------------------ */

function nextPackageJson(ctx: TemplateContext, deps: Record<string, string>) {
  return json({
    name: ctx.projectName,
    version: "0.1.0",
    private: true,
    engines: { node: ">=20.9.0" },
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      typecheck: "tsc --noEmit",
    },
    dependencies: {
      next: VERSIONS.next,
      react: VERSIONS.react,
      "react-dom": VERSIONS.reactDom,
      viem: VERSIONS.viem,
      ...deps,
    },
    devDependencies: {
      "@tailwindcss/postcss": VERSIONS.tailwindPostcss,
      "@types/node": VERSIONS.typesNode,
      "@types/react": VERSIONS.typesReact,
      "@types/react-dom": VERSIONS.typesReactDom,
      tailwindcss: VERSIONS.tailwind,
      typescript: VERSIONS.typescript,
    },
  })
}

function nextCommonFiles(ctx: TemplateContext, opts: { wagmi: boolean }): GeneratedFile[] {
  return [
    {
      path: "tsconfig.json",
      content: json({
        compilerOptions: {
          target: "ES2020",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "react-jsx",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
        exclude: ["node_modules"],
      }),
    },
    {
      path: "next.config.ts",
      content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,${
        opts.wagmi
          ? `
  // wagmi's Base Account connector loads Coinbase's Node SDK during server rendering,
  // which lazily imports optional packages (x402, Solana) that aren't installed.
  // Loading these at runtime instead of bundling them avoids "Module not found".
  serverExternalPackages: ["@base-org/account", "@coinbase/cdp-sdk"],`
          : ""
      }
};

export default nextConfig;
`,
    },
    {
      path: "postcss.config.mjs",
      content: `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`,
    },
    { path: "app/globals.css", content: stylesFile() },
    {
      path: "app/layout.tsx",
      content: `import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "${escapeText(ctx.projectName)}",
  description: "${escapeText(ctx.contract.name)} dApp on Mezo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
`,
    },
    { path: "lib/chains.ts", content: chainsFile() },
    { path: "lib/contract.ts", content: contractFile(ctx) },
    { path: "lib/abi.ts", content: abiHelpersFile() },
    { path: "components/contract-panel.tsx", content: contractPanelFile(ctx) },
    { path: ".gitignore", content: gitignoreFile() },
  ]
}

const nextStructure = `- \`app/\` — Next.js App Router (layout, page, providers)
- \`components/contract-panel.tsx\` — read/write UI generated from the ABI
- \`lib/contract.ts\` — contract address, ABI and chain
- \`lib/chains.ts\` — Mezo chains with Mezo's documented RPCs (with fallback)
- \`lib/abi.ts\` — argument parsing and result formatting
- \`lib/actions.ts\` — how the panel reads, simulates and writes`

/* ------------------------------------------------------------------ */
/* Next.js + wagmi + RainbowKit                                         */
/* ------------------------------------------------------------------ */

export function nextjsWagmi(ctx: TemplateContext): GeneratedFile[] {
  return [
    ...nextCommonFiles(ctx, { wagmi: true }),
    {
      path: "package.json",
      content: nextPackageJson(ctx, {
        wagmi: VERSIONS.wagmi,
        "@rainbow-me/rainbowkit": VERSIONS.rainbowkit,
        "@tanstack/react-query": VERSIONS.reactQuery,
      }),
    },
    { path: "app/providers.tsx", content: wagmiProvidersFile(ctx) },
    {
      path: "app/page.tsx",
      content: `"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ContractPanel } from "@/components/contract-panel";

export default function Home() {
  return (
${pageBody(ctx, "<ConnectButton />")}
  );
}
`,
    },
    {
      path: "lib/wagmi.ts",
      content: wagmiConfigFile(ctx, { envExpr: "process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID", ssr: true }),
    },
    { path: "lib/actions.ts", content: wagmiActionsFile(ctx) },
    {
      path: ".env.example",
      content: `# Optional — enables WalletConnect / mobile wallets. Free at https://cloud.reown.com
# Without it, browser wallets (MetaMask, Rabby, OKX, ...) still work.
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
`,
    },
    {
      path: "README.md",
      content: readmeFile(ctx, {
        stack: "Next.js 16, React 19, wagmi 2, viem 2, RainbowKit, Tailwind CSS 4",
        envVar: "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
        devUrl: "http://localhost:3000",
        structure: nextStructure + "\n- `lib/wagmi.ts` — wagmi / RainbowKit config",
        walletSection: `## Wallets

Browser wallets (MetaMask, Rabby, OKX, ...) work out of the box. To enable WalletConnect
and mobile wallets, create a free project ID at https://cloud.reown.com and set
\`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID\` in \`.env.local\`.`,
      }),
    },
  ]
}

/* ------------------------------------------------------------------ */
/* Next.js + viem (no wagmi)                                            */
/* ------------------------------------------------------------------ */

export function nextjsViem(ctx: TemplateContext): GeneratedFile[] {
  return [
    ...nextCommonFiles(ctx, { wagmi: false }),
    { path: "package.json", content: nextPackageJson(ctx, {}) },
    {
      path: "app/providers.tsx",
      content: `"use client";

import type { ReactNode } from "react";
import { WalletProvider } from "@/lib/wallet";

export function Providers({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
`,
    },
    {
      path: "app/page.tsx",
      content: `"use client";

import { ContractPanel } from "@/components/contract-panel";
import { ConnectButton } from "@/lib/wallet";

export default function Home() {
  return (
${pageBody(ctx, "<ConnectButton />")}
  );
}
`,
    },
    { path: "lib/wallet.tsx", content: viemWalletFile(ctx) },
    { path: "lib/actions.ts", content: viemActionsFile(ctx) },
    {
      path: "README.md",
      content: readmeFile(ctx, {
        stack: "Next.js 16, React 19, viem 2 (no wagmi), Tailwind CSS 4",
        devUrl: "http://localhost:3000",
        structure:
          nextStructure +
          "\n- `lib/wallet.tsx` — minimal viem wallet provider (injected EIP-1193 wallets) and connect button",
        walletSection: `## Wallets

This template talks to the browser wallet directly through viem (\`window.ethereum\`), with no
wallet-kit dependency. It supports any injected wallet (MetaMask, Rabby, OKX, ...), prompts to
add or switch to the Mezo network, and reads work without a wallet. For WalletConnect and
mobile wallets, use the Next.js + wagmi template instead.`,
      }),
    },
  ]
}

/* ------------------------------------------------------------------ */
/* React (Vite) + wagmi + RainbowKit                                    */
/* ------------------------------------------------------------------ */

export function reactViteWagmi(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: "package.json",
      content: json({
        name: ctx.projectName,
        private: true,
        version: "0.1.0",
        type: "module",
        engines: { node: ">=20.19.0" },
        scripts: {
          dev: "vite",
          build: "tsc --noEmit && vite build",
          preview: "vite preview",
          typecheck: "tsc --noEmit",
        },
        dependencies: {
          "@rainbow-me/rainbowkit": VERSIONS.rainbowkit,
          "@tanstack/react-query": VERSIONS.reactQuery,
          react: VERSIONS.react,
          "react-dom": VERSIONS.reactDom,
          viem: VERSIONS.viem,
          wagmi: VERSIONS.wagmi,
        },
        devDependencies: {
          "@tailwindcss/vite": VERSIONS.tailwindVite,
          "@types/node": VERSIONS.typesNode,
          "@types/react": VERSIONS.typesReact,
          "@types/react-dom": VERSIONS.typesReactDom,
          "@vitejs/plugin-react": VERSIONS.viteReact,
          tailwindcss: VERSIONS.tailwind,
          typescript: VERSIONS.typescript,
          vite: VERSIONS.vite,
        },
      }),
    },
    {
      path: "tsconfig.json",
      content: json({
        compilerOptions: {
          target: "ES2022",
          useDefineForClassFields: true,
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "bundler",
          skipLibCheck: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          strict: true,
          noFallthroughCasesInSwitch: true,
          types: ["vite/client", "node"],
          paths: { "@/*": ["./src/*"] },
        },
        include: ["src", "vite.config.ts"],
      }),
    },
    {
      path: "vite.config.ts",
      content: `import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
`,
    },
    {
      path: "index.html",
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeText(ctx.projectName)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: "src/main.tsx",
      content: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Providers } from "./providers";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);
`,
    },
    {
      path: "src/App.tsx",
      content: `import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ContractPanel } from "@/components/contract-panel";

export default function App() {
  return (
${pageBody(ctx, "<ConnectButton />")}
  );
}
`,
    },
    { path: "src/providers.tsx", content: wagmiProvidersFile(ctx) },
    { path: "src/index.css", content: stylesFile() },
    { path: "src/lib/chains.ts", content: chainsFile() },
    { path: "src/lib/contract.ts", content: contractFile(ctx) },
    { path: "src/lib/abi.ts", content: abiHelpersFile() },
    {
      path: "src/lib/wagmi.ts",
      content: wagmiConfigFile(ctx, { envExpr: "import.meta.env.VITE_WALLETCONNECT_PROJECT_ID", ssr: false }),
    },
    { path: "src/lib/actions.ts", content: wagmiActionsFile(ctx) },
    { path: "src/components/contract-panel.tsx", content: contractPanelFile(ctx) },
    {
      path: ".env.example",
      content: `# Optional — enables WalletConnect / mobile wallets. Free at https://cloud.reown.com
# Without it, browser wallets (MetaMask, Rabby, OKX, ...) still work.
VITE_WALLETCONNECT_PROJECT_ID=
`,
    },
    { path: ".gitignore", content: gitignoreFile() },
    {
      path: "README.md",
      content: readmeFile(ctx, {
        stack: "React 19, Vite, wagmi 2, viem 2, RainbowKit, Tailwind CSS 4",
        envVar: "VITE_WALLETCONNECT_PROJECT_ID",
        devUrl: "http://localhost:5173",
        structure: `- \`src/App.tsx\` — page layout
- \`src/providers.tsx\` — wagmi, React Query and RainbowKit providers
- \`src/components/contract-panel.tsx\` — read/write UI generated from the ABI
- \`src/lib/contract.ts\` — contract address, ABI and chain
- \`src/lib/chains.ts\` — Mezo chains with Mezo's documented RPCs (with fallback)
- \`src/lib/wagmi.ts\` — wagmi / RainbowKit config
- \`src/lib/abi.ts\` — argument parsing and result formatting
- \`src/lib/actions.ts\` — how the panel reads, simulates and writes`,
        walletSection: `## Wallets

Browser wallets (MetaMask, Rabby, OKX, ...) work out of the box. To enable WalletConnect
and mobile wallets, create a free project ID at https://cloud.reown.com and set
\`VITE_WALLETCONNECT_PROJECT_ID\` in \`.env.local\`.`,
      }),
    },
  ]
}
