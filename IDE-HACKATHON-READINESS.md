# Mezo IDE — Review & Hackathon Readiness

**Date:** 2026-09-29
**Scope:** the in-app IDE (`/ide`) and its tools: Protocol Registry, Transaction Simulator, gas estimates, deploy, editor autocomplete, generated dApps.
**Hackathon:** in ~2 weeks (from 2026-09-29).

---

## 1. Summary

The IDE's core loop (write → compile → deploy → verify → interact → generate dApp) works, but several tools gave developers **wrong information**: invented contract APIs, placeholder addresses, guessed simulation results, and made-up gas numbers. At a hackathon, wrong information costs teams more than missing features, so those were fixed first. Every Mezo address and ABI the IDE now shows was taken from Mezo's docs or verified explorer source **and checked on-chain**.

| # | Issue | Status |
|---|-------|--------|
| 1 | Protocol Registry: placeholders, mislabelled tokens, invented APIs | **Fixed** — rebuilt from verified data |
| 2 | Simulator showed guessed "state changes" | **Fixed** — real `eth_call` results only |
| 3 | Gas cost breakdown invented; silent $70,000 BTC price | **Fixed** — real `eth_estimateGas`, Mezo on-chain oracle |
| 4 | Deploy defaulted to mainnet | **Fixed** — defaults to testnet, mainnet warning |
| 5 | `rpc.mezo.org` not in Mezo's documented RPC list | **Fixed** — documented RPCs with fallback |
| 6 | `/ide` not login-protected; public `/ide-test` duplicate | **Fixed** |
| + | Editor autocomplete offered invented interfaces | **Fixed** — rebuilt from verified ABIs |
| + | Protocols and Simulate modals looked cluttered | **Redesigned** |

---

## 2. What was wrong and what changed

### 2.1 Protocol Registry

**Before**
- Almost every address was `0x000…000` (placeholder).
- The "tBTC" entry pointed to `0x1189…c503`, which is actually **MUSD** (on-chain `name()` = "Mezo USD"). The real MUSD entry was a placeholder.
- "CDP Manager", veBTC, veMEZO and Gauge entries described functions such as `openCDP(collateral, debt)` that don't exist on Mezo (MUSD uses Liquity-style troves). "Generate Interface" produced code that compiled but reverted.
- veBTC was marked "coming soon" — it is live on both networks.
- The registry was stuck on mainnet (the network prop was hard-coded and never changed).

**After**
- 11 protocols, all from Mezo docs and checked on-chain: BTC, MUSD, MEZO, BTC/USD price feed, Pyth, Pools Router, Pool Factory, CL Swap Router, CL Position Manager, veBTC, veBTC Voter.
- ABIs load from the Mezo explorer's **verified source** at runtime (new route `/api/explorer/abi`), following real proxies (EIP-1967 etc.) to their implementation.
- Pyth's implementation isn't verified on Mezo's explorers, so its ABI is bundled from Pyth's official SDK (`@pythnetwork/pyth-sdk-solidity@4.3.1`) and was checked with a live `getPriceUnsafe` call on Mezo mainnet.
- "Generate Solidity interface" builds from the real ABI, including structs. **All 22 protocol/network combinations were compiled with solc 0.8.28.**
- Testnet/mainnet switch inside the modal, defaulting to testnet.
- New two-pane design: searchable, categorised list on the left; details, address (copy + explorer), notes, actions and the live ABI (Read / Write / Events) on the right, with the ABI source shown.

Bug found while testing: Blockscout labels Mezo's PoolFactory as a proxy (heuristic `basic_implementation`, because it exposes `implementation()` for its pool clones). Following it returned the **Pool** ABI instead of the factory's. The route now only follows real proxy standards.

### 2.2 Transaction Simulator

**Before**
- "State changes" were **guessed from the function name** (e.g. anything named `transfer` showed a "balances" change). Events were always empty; the "trace" echoed the input.
- Simulated on the **wallet's** current chain, not the contract's chain.
- Custom errors showed as raw hex.

**After**
- Uses viem `simulateContract` (real `eth_call`) + `estimateContractGas` on the network the contract was deployed to.
- Shows only what `eth_call` proves: would succeed / would revert, decoded return value, decoded revert reason (string or custom error), gas used, gas price, cost in BTC (and USD when a price is available), and the block number it ran against.
- States plainly that state changes and events aren't shown because Mezo's public RPCs don't support `debug_traceCall` (tested on `rpc.test.mezo.org` and Boar mainnet: method not available).
- "Simulate as" any address (nothing is signed), payable value in BTC, recent-run history.
- Redesigned: form on the left, result on the right, history below.

Verified on testnet: a read returning a value, a write that succeeds (gas 37,475), a string revert (`No active vault`), and a custom error (`OwnableUnauthorizedAccount(0x…dEaD)`).

### 2.3 Gas estimate & BTC price

**Before**
- The deployment "estimate" wasn't one: `150 gas per bytecode byte + 50,000 per constructor argument + 20%`. For a test contract it showed **390,360** gas vs **275,083** from the network (42% high).
- The cost breakdown (70% base / 20% priority / 10% size) was hard-coded.
- If the price API failed, USD used a silent **$70,000** BTC price (actual at time of testing: ~$84,000).
- Estimation needed a connected wallet on the right chain, and always passed zero constructor arguments (broken for contracts with constructor args).

**After**
- Real `eth_estimateGas` for the contract creation on the selected network (no wallet needed) + 10% headroom.
- BTC price from **Mezo's on-chain BTC/USD oracle** (Chainlink-compatible, updated every few seconds), CoinGecko as fallback, and "USD price unavailable" when neither responds.
- Estimates run once constructor arguments are complete.

### 2.4 Deploy defaults

- Deploy panel starts on **Mezo Testnet**. Selecting mainnet shows a warning that it uses real BTC.

### 2.5 RPC endpoints

`rpc.mezo.org` (viem's built-in default for the `mezo` chain) is **not** in Mezo's documented RPC list and didn't respond during testing. Mezo documents four mainnet providers:

| Provider | HTTPS |
|---|---|
| Boar | `https://mezo-mainnet.boar.network` |
| Validation Cloud | `https://mainnet.mezo.public.validationcloud.io` |
| dRPC | `https://mezo.drpc.org` |
| Imperator | `https://rpc_evm-mezo.imperator.co` |

Testnet: `https://rpc.test.mezo.org`.

Changes:
- New single source of truth: `frontend/lib/ide/mezo-network.ts` (chains, RPCs with fallback, explorers, verified addresses).
- App-wide wagmi config, IDE reads, simulator, gas estimates and the Interact panel use it. Chains carry the documented RPCs, so a wallet asked to add Mezo gets a working endpoint.
- Generated dApps get `lib/chains.ts` with the same RPCs and a fallback transport (verified: reads mainnet MUSD through it).
- The Interact panel now reads from the contract's network instead of the wallet's current one.

### 2.6 Access

- `/ide` is login-protected in `middleware.ts`. Logged-out users are sent to `/login?next=…` and returned afterwards, so **IDE share links keep working** (only same-site paths are accepted for `next`).
- `/ide-test` (public, unlinked duplicate of the IDE) was deleted.

### 2.7 Editor autocomplete

**Before:** `ICDPManager`, `IveBTC`, `IveMEZO`, `IGauge`, `IMezoPassport` and `ItBTC` interfaces with invented functions; "Mezo Passport" presented as an on-chain contract (it's a frontend wallet kit); `TBTC_ADDRESS` set to the MUSD address; CDP constants for a system that doesn't exist in that form; a "BTC-backed" token template whose redeem never pays out and a "Mezo Earn" vault whose rewards are always zero.

**After:** 9 completions, all verified — testnet/mainnet address blocks (generated from `mezo-network.ts`), `IMezoPriceFeed`, `IVeBTC` (from the verified veBTC ABI; it locks the BTC ERC-20), BTC/USD price read with staleness check, veBTC lock pattern, native BTC transfer, unit constants, gas-in-sats. **All snippets were compiled together with solc 0.8.28.** Hover docs rewritten to match.

---

## 3. Verified Mezo reference data

Sources: [configure-environment](https://mezo.org/docs/developers/getting-started/configure-environment/), [x402 quickstart](https://mezo.org/docs/developers/getting-started/musd-payments-x402/x402-quickstart/) (testnet MUSD), [oracles](https://mezo.org/docs/developers/architecture/oracles/read-oracle/), [Mezo Pools](https://mezo.org/docs/developers/features/mezo-pools/). Mainnet MUSD taken from the verified "Mezo USD" token that the documented MUSD/BTC pool holds (`token1()`).

| Contract | Testnet (31611) | Mainnet (31612) |
|---|---|---|
| BTC (ERC-20, gas token) | `0x7b7C000000000000000000000000000000000000` | same |
| MEZO | `0x7B7c000000000000000000000000000000000001` | same |
| MUSD | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` | `0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186` |
| BTC/USD feed | `0x7b7c000000000000000000000000000000000015` | same |
| Pyth | `0x2880aB155794e7179c9eE2e38200202908C17B43` | same |
| Pools Router | `0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9` | `0x16A76d3cd3C1e3CE843C6680d6B37E9116b5C706` |
| Pool Factory | `0x4947243CC818b627A5D06d14C4eCe7398A23Ce1A` | `0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248` |
| CL Swap Router | `0x3112908bB72ce9c26a321Eeb22EC8e051F3b6E6a` | `0x37cDd11919ec3860eaD9efB8673d7476E5326225` |
| CL Position Manager | `0x9B753e11bFEd0D88F6e1D2777E3c7dac42F96062` | `0x509Bc221df2B83927c695FA0bb0f5B21053C874c` |
| veBTC | `0xB63fcCd03521Cf21907627bd7fA465C129479231` | `0x7D807e9CE1ef73048FEe9A4214e75e894ea25914` |
| veBTC Voter | `0x72F8dd7F44fFa19E45955aa20A5486E8EB255738` | `0x3A4a6919F70e5b0aA32401747C471eCfe2322C1b` |

Rule for adding more: documented source + code on-chain + verified ABI (or an official SDK ABI checked with a live call). Update `lib/ide/mezo-network.ts` only.

---

## 4. Verification performed

| Check | Result |
|---|---|
| Frontend typecheck (`tsc --noEmit`) | Pass |
| Registry ABI route, all 22 protocol/network pairs | Pass (after PoolFactory proxy fix) |
| Generated Solidity interfaces for all 22 pairs, solc 0.8.28 | All compile |
| Autocomplete snippets compiled together, solc 0.8.28 | Compile |
| Simulator on testnet: read, write, string revert, custom error | All correct |
| Deploy gas estimate without wallet (testnet) | 275,083 gas (real) |
| Mezo BTC/USD oracle, mainnet + testnet | Live, updated seconds earlier |
| Generated dApps (3 templates): install, typecheck, production build | All pass |
| Generated `lib/chains.ts` mainnet read via fallback transport | Pass |
| `/ide` logged out → `/login?next=%2Fide%3Fshare%3D…`; `/ide-test` → 404 | Pass |

**Not yet done: a click-through in a real browser with a wallet.** Everything above was verified in code and against the live networks, not by using the UI. This is the first job for testers (section 6).

---

## 5. Feature recommendations (deferred — to discuss)

1. **"Deploy dApp to Mezo Host"** — one click from generated dApp to a live URL on our own platform. Unique to us, and exactly what hackathon teams need for submissions. Replaces the removed "Deploy to GitHub (Coming Soon)" button.
2. **Mezo-specific templates** — MUSD payments (x402 is documented by Mezo), BTC via its ERC-20, veBTC locking, reading the BTC/USD feed. Now easy to do correctly with the verified data in `mezo-network.ts`.
3. ~~**Faucet prompt in the deploy panel**~~ — **done**, see section 8.
4. **Export as Hardhat/Foundry project** — contract, deploy script and verification settings, so teams can move from the IDE to a repo.
5. ~~**In-app "Report a problem"**~~ — **done**, see section 8. (Error monitoring such as Sentry is still open.)

---

## 6. Hackathon plan (2 weeks)

### Week 1 — fix, ship, freeze
- [x] Fix items 1–6 and autocomplete (this document).
- [ ] Commit and deploy the frontend.
- [ ] **Browser walkthrough** with MetaMask and one other wallet: template → compile → deploy (testnet) → verify → interact → simulate → registry (generate interface) → generate dApp → run it locally. Include a logged-out share link.
- [x] Build the faucet prompt and "Report a problem" (section 8).
- [ ] Deploy the backend migration for reports (section 8.3) and set `IDE_REPORT_WEBHOOK_URL` if you want live pings.

### Week 2 — testers
- [ ] Recruit 5–10 testers now; give them the walkthrough above as a script, plus one open task ("build something small with MUSD").
- [ ] Feedback form + daily triage; publish a known-issues page.
- [ ] Feature freeze around day 10 — bug fixes only after that.
- [ ] Ask the Mezo team about **testnet faucet capacity** for event day.
- [ ] Watch shared dependencies under load: solc (~9 MB) and OpenZeppelin imports come from public CDNs; verification and registry ABIs use the Mezo explorer API; mainnet reads use public RPC providers.

### Known limitations to tell participants
- Simulation can't show state changes or events (no tracing on Mezo's public RPCs).
- Pyth is a pull oracle: `getPriceUnsafe` can be stale until someone pushes an update.
- Mezo Passport (Bitcoin wallets) isn't bundled in generated dApps — its current release requires React 18.

---

## 7. Files changed

**New**
- `frontend/lib/ide/mezo-network.ts` — chains, documented RPCs + fallback, explorers, verified addresses
- `frontend/app/api/explorer/abi/route.ts` — verified-ABI loader (proxy-aware)
- `frontend/lib/ide/abis/pyth.ts` — Pyth SDK ABI with provenance

**Rewritten**
- `frontend/lib/ide/protocol-registry.ts`, `frontend/components/ide/protocol-registry.tsx`
- `frontend/lib/ide/transaction-simulator.ts`, `frontend/hooks/ide/use-transaction-simulator.ts`, `frontend/components/ide/transaction-simulator.tsx`
- `frontend/hooks/ide/use-gas-estimator.ts`, `frontend/components/ide/gas-estimator-panel.tsx`
- `frontend/hooks/ide/use-btc-price.ts`
- `frontend/lib/ide/mezo-completions.ts`
- `frontend/lib/wagmi-config.tsx`

**Updated**
- `frontend/components/ide/deploy-panel.tsx` — testnet default, mainnet warning, real estimates
- `frontend/components/ide/contract-interact.tsx` — reads from the contract's network
- `frontend/components/ide/ide-container.tsx` — registry/simulator wiring
- `frontend/types/ide.ts` — `MEZO_NETWORKS` derived from `mezo-network.ts`; old simulator types removed
- `frontend/middleware.ts`, `frontend/hooks/use-auth.ts` — protect `/ide`, `?next=` return
- `frontend/lib/ide/dapp-templates/*` — generated `lib/chains.ts` with documented RPCs

**Deleted**
- `frontend/app/ide-test/`

---

## 8. Added: faucet prompt and "Report a problem" (2026-09-29)

### 8.1 Faucet prompt (deploy panel)
- Shows the connected wallet's BTC balance **on the selected deploy network** (read from that network, not the wallet's current chain).
- If it's 0, or below the estimated deployment cost:
  - **Testnet:** "You need testnet BTC to deploy" with **Copy address & open faucet**. The faucet has a captcha, so the IDE can't request funds itself; it copies the address and opens `https://faucet.test.mezo.org`. The balance re-checks every 15 s and when the tab regains focus, so the prompt clears by itself once funds arrive.
  - **Mainnet:** "Not enough BTC for gas" (no faucet).
- Files: `frontend/hooks/ide/use-mezo-balance.ts`, `frontend/components/ide/faucet-prompt.tsx`.

### 8.2 Report a problem
- **Report** button in the IDE toolbar opens a modal: category (Bug / Confusing / Feature request / Other), description (10–5000 chars), and diagnostics the user can untick:
  - Console log (50 most recent), compiler output (status, version, settings, errors), recent deployments (addresses, tx hashes), environment (browser, screen, wallet address and network).
  - **Contract source is off by default** (contracts can be private).
  - "Preview what will be sent" shows the exact JSON and its size; diagnostics are trimmed to stay under 60 KB.
- Backend (`backend/src/ide-report/`):
  - `POST /ide-reports` — logged-in users (existing JWT guard). Validates input, caps diagnostics at 64 KB, **rate-limits 10 reports per user per hour**.
  - `GET /ide-reports?status=` and `PATCH /ide-reports/:id` (status, internal notes) — admin key (`x-admin-key`), same as `/treasury` admin endpoints.
  - Optional `IDE_REPORT_WEBHOOK_URL` (Discord or Slack incoming webhook): each report is also posted there. Webhook failures never fail the report.
- Admin: `/admin` now has an **IDE Reports** tab — status filters with counts, report cards with a diagnostics summary and raw JSON, status dropdown and internal notes. Refreshes every 30 s.

### 8.3 Deploying this change
New table, so this deploy **does** need a migration (additive only: 2 enums, 1 table, 2 indexes, 1 foreign key — no existing data touched):

```bash
cd ~/mezo-deploy/backend
git pull origin master
npm install
npx prisma migrate deploy     # applies 20260929120000_ide_report
npx prisma generate           # generated client isn't in git
npm run build
# optional: add IDE_REPORT_WEBHOOK_URL=https://discord.com/api/webhooks/... to .env / .env-prod
pm2 restart backend --update-env
```
Then redeploy the frontend.

### 8.4 Verification
| Check | Result |
|---|---|
| Backend unit tests (reports + treasury) | 39 passed |
| Full migration history + new migration on an empty Postgres (`prisma dev`, throwaway) | All 12 applied |
| Schema vs migrated DB drift (`prisma migrate diff`) | Empty — in sync |
| HTTP e2e on that DB: auth required, validation, JSON diagnostics stored, 429 on 11th report, admin list/counts/update, wrong admin key rejected, 404 on unknown id | 4/4 passed |
| Diagnostics builder: source excluded by default, toggles respected, 200 huge logs + 200 KB source trimmed to 38 KB | Pass |
| Frontend and backend typecheck | Pass (backend's 3 pre-existing broken spec files excluded) |

Not yet clicked through in a browser — include "send a report" and "deploy with an empty testnet wallet" in the tester walkthrough.

---

## 9. "Create from Template" rebuilt (2026-09-29)

**Bugs fixed**
- **Staking Pool template didn't compile** (`exit()` called `external` functions internally). Even once compiled it would have reverted: all three functions were `nonReentrant`, and `claimRewards` required non-zero rewards. Refactored to internal `_withdraw` / `_claimRewards`; `exit()` now withdraws everything and claims only if rewards exist.
- File names came from the display name (`Simple Storage.sol`, with a space) and could clash with existing files. They now default to the contract name (`SimpleStorage.sol`), are editable, and never clash (`SimpleStorage2.sol`…).

**New modal**
- Search, "All" + category filters with counts, template list with level (Beginner / Intermediate / Advanced).
- Detail pane: description, key features, **every constructor argument with a hint** (units, limits, examples — e.g. Timelock delay must be 86400–2592000 s, ERC-20 supply is in whole tokens, airdrop leaf format), "after deploying" steps (e.g. NFT minting starts disabled → `toggleMinting()`), and a highlighted code preview with line numbers.
- Footer: file name, Copy code, Create file. Double-click a template or press Enter to create. The console then shows the next step (compile, then fill N constructor args).

**Verified**
- All 11 templates compile with solc 0.8.28 + OpenZeppelin 5.0.2 exactly as the IDE resolves them.
- All 11 deploy on a local chain with realistic arguments and their no-argument view functions run (Simple Swap's price view reverts with "No liquidity" until liquidity is added — expected, and now stated in its hints).
- Staking Pool end-to-end: stake → earn → `exit()` returns the full stake plus rewards.
- Every template's constructor hints were checked against the compiled ABI (names, types, order).

### 9.1 Modal overflow fixes
- Vertical: grid row pinned with `grid-rows-[minmax(0,1fr)]`, panes sized from the modal body's 72vh cap. Horizontal: right column `minmax(0,1fr)` + `min-w-0`, so long code lines scroll inside the preview instead of pushing "Create file" off-screen. Same fix applied to the Protocols and Simulate modals.

### 9.2 Mezo templates (new "Mezo" category, listed first)
| Template | What it does | Verified |
|---|---|---|
| **MUSD Checkout** | Take MUSD payments per order; `payWithPermit` approves + pays in one tx (EIP-2612) | Fork of Mezo testnet with the **real MUSD contract**: approve+pay and permit+pay (signed over MUSD's real EIP-712 domain "Mezo USD" v1) → treasury +35 MUSD; double pay rejected |
| **USD-priced BTC Checkout** | Price in USD cents, get paid in native BTC via Mezo's BTC/USD oracle; stale-price guard; overpayment refunded | `quoteBtc` run against the **live** Mezo testnet oracle (deployless eth_call): $100.00 → 0.001206 BTC ≈ $100.0000. Pay flow on a local chain: exact quote to treasury, excess refunded, AlreadyPaid / InsufficientPayment / StalePrice enforced |
| **BTC Payment Splitter** | Split native BTC between payees by fixed shares; pull payments | 3 BTC split 50/30/20 over two deposits, contract drained to 0, duplicate payees rejected |

All 14 templates compile with solc 0.8.28 + OpenZeppelin 5.0.2 and their constructor hints match the compiled ABI.

---

## 10. Export as Hardhat / Foundry project (2026-09-29)

**Where:** IDE toolbar → File → *Export as Hardhat / Foundry project…* (needs a successful compile; the selected contract gets the deploy script).

**What's in the zip**
| | Hardhat 3 | Foundry |
|---|---|---|
| Sources | all workspace `.sol` files in `contracts/` | all workspace `.sol` files in `src/` |
| Compiler | same solc version + optimizer as the IDE (default EVM = cancun) | same, in `foundry.toml` |
| OpenZeppelin | `@openzeppelin/contracts` **5.0.2** (what the IDE compiles against) | `forge install OpenZeppelin/openzeppelin-contracts@v5.0.2` + remapping |
| Networks | `mezoTestnet` / `mezoMainnet` with Mezo's documented RPCs; key via `hardhat keystore` or `MEZO_PRIVATE_KEY` | `mezo_testnet` / `mezo_mainnet` RPC aliases; key via `cast wallet import` |
| Deploy | Ignition module + `ignition/parameters.json` (typed placeholders), `npm run deploy:testnet` | `script/Deploy.s.sol` with typed placeholder args (arrays, structs, bytes handled) |
| Verify | `chainDescriptors` → Mezo Blockscout; `npx hardhat verify blockscout --network mezoTestnet …` | `--verifier blockscout --verifier-url https://api.explorer.test.mezo.org/api/` |
| README | setup, constructor-args table, deploy, verify | same |

**Verified (with the generated projects, following their READMEs)**
- Hardhat: `npm install` → compile with solc 0.8.28 / cancun → Ignition deploy on the local network (placeholders fail clearly with `ZeroAddress()`; real values deploy) → `hardhat verify blockscout --network mezoTestnet` reached **Mezo Testnet Explorer** and recognised an already-verified contract.
- Foundry 1.5.1: `git init` + `forge install` (forge-std, OZ v5.0.2) → `forge build` → `forge script` dry run (placeholders → `ZeroAddress()`) → broadcast to local anvil (deployed, `treasury()` read back) → `forge verify-contract --verifier blockscout` reached Mezo's explorer and recognised the verified contract.
- Constructor argument generation for `address[]`, `uint256[]`, `address[3]`, structs, `bytes32`, `bool`, `string`, `bytes`: Foundry scripts compile; Hardhat parameters have correct shapes (fixed arrays get N entries).

**Live on Mezo testnet (2026-09-29):** MUSD Checkout deployed and verified from each exported project, following its README.
| Export | Address | Result |
|---|---|---|
| Hardhat 3 (`npm run deploy:testnet` + `hardhat verify blockscout`) | [`0x7005CBE7eC6Ac1f28bEc29F2Bc7f4f96452F5B5a`](https://explorer.test.mezo.org/address/0x7005CBE7eC6Ac1f28bEc29F2Bc7f4f96452F5B5a#code) | Verified |
| Foundry (`forge script --broadcast --verify --verifier blockscout`) | [`0x6Fa4F8764DEbea7Ae1c57A7b07Ba8e951313B992`](https://explorer.test.mezo.org/address/0x6Fa4F8764DEbea7Ae1c57A7b07Ba8e951313B992#code) | Verified |

**Found by the live run and fixed:** the explorer showed the Foundry deployment compiled for EVM **prague**, while the IDE and Hardhat compile for **cancun** — Foundry 1.x defaults to the newest EVM regardless of solc. Both exports now pin `cancun` explicitly (`evm_version` in `foundry.toml`, `evmVersion` in `hardhat.config.ts`), and rebuilt artifacts confirm cancun for both. The testnet contract above was deployed before this fix; it's verified and works, it just targets prague.
