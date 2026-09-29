/**
 * Mezo-specific code completions and hover docs for the IDE editor.
 *
 * Accuracy rule: every interface signature here is copied from a contract
 * verified on the Mezo explorer, and every address comes from
 * ./mezo-network.ts (documented + checked on-chain). Don't add speculative APIs.
 */

import { MEZO_CONTRACTS } from "./mezo-network"

export interface MezoCompletion {
  label: string
  kind: "snippet" | "function" | "interface" | "constant" | "keyword"
  insertText: string
  documentation: string
  detail?: string
}

/* ------------------------------------------------------------------ */
/* Addresses (generated from the verified list)                        */
/* ------------------------------------------------------------------ */

const addressConstants = (network: "testnet" | "mainnet") => {
  const c = MEZO_CONTRACTS
  return `// Mezo ${network === "testnet" ? "Testnet (31611)" : "Mainnet (31612)"} — from Mezo docs, verified on-chain
address constant BTC = ${c.BTC[network]}; // native BTC as ERC-20
address constant MUSD = ${c.MUSD[network]};
address constant MEZO = ${c.MEZO[network]};
address constant BTC_USD_FEED = ${c.BTC_USD_ORACLE[network]}; // Chainlink-compatible
address constant PYTH = ${c.PYTH[network]};
address constant POOLS_ROUTER = ${c.POOLS_ROUTER[network]};
address constant VEBTC = ${c.VEBTC[network]};`
}

export const ADDRESS_COMPLETIONS: MezoCompletion[] = [
  {
    label: "mezo-testnet-addresses",
    kind: "constant",
    insertText: addressConstants("testnet"),
    documentation: "Verified Mezo Testnet contract addresses (BTC, MUSD, MEZO, oracles, pools, veBTC).",
    detail: "Mezo Testnet addresses",
  },
  {
    label: "mezo-mainnet-addresses",
    kind: "constant",
    insertText: addressConstants("mainnet"),
    documentation: "Verified Mezo Mainnet contract addresses (BTC, MUSD, MEZO, oracles, pools, veBTC).",
    detail: "Mezo Mainnet addresses",
  },
]

/* ------------------------------------------------------------------ */
/* Interfaces (signatures from verified ABIs)                           */
/* ------------------------------------------------------------------ */

export const INTERFACE_COMPLETIONS: MezoCompletion[] = [
  {
    label: "IMezoPriceFeed",
    kind: "interface",
    insertText: `interface IMezoPriceFeed {
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}`,
    documentation: "Mezo's Chainlink-compatible price feed (e.g. BTC/USD at 0x7b7c…0015 on both networks).",
    detail: "Mezo price feed",
  },
  {
    label: "IVeBTC",
    kind: "interface",
    insertText: `interface IVeBTC {
    function token() external view returns (address); // BTC (0x7b7c…0000)
    function createLock(uint256 _value, uint256 _lockDuration) external returns (uint256 tokenId);
    function createLockFor(uint256 _value, uint256 _lockDuration, address _to) external returns (uint256 tokenId);
    function increaseAmount(uint256 _tokenId, uint256 _value) external;
    function increaseUnlockTime(uint256 _tokenId, uint256 _lockDuration) external;
    function withdraw(uint256 _tokenId) external;
    function balanceOfNFT(uint256 _tokenId) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
}`,
    documentation: "Subset of veBTC (vote-escrowed BTC). Locks are NFTs; approve BTC to veBTC before createLock.",
    detail: "veBTC",
  },
]

/* ------------------------------------------------------------------ */
/* Patterns                                                             */
/* ------------------------------------------------------------------ */

export const PATTERN_COMPLETIONS: MezoCompletion[] = [
  {
    label: "mezo-btc-usd-price",
    kind: "snippet",
    insertText: `// Read BTC/USD from Mezo's on-chain feed, rejecting stale prices
IMezoPriceFeed constant BTC_USD = IMezoPriceFeed(${MEZO_CONTRACTS.BTC_USD_ORACLE.testnet});

function btcUsdPrice() public view returns (uint256 price, uint8 decimals) {
    (, int256 answer, , uint256 updatedAt, ) = BTC_USD.latestRoundData();
    require(answer > 0, "Invalid price");
    require(block.timestamp - updatedAt <= 1 hours, "Stale price");
    return (uint256(answer), BTC_USD.decimals());
}`,
    documentation: "Reads the BTC/USD feed with a staleness check. Needs the IMezoPriceFeed interface.",
    detail: "BTC/USD price",
  },
  {
    label: "mezo-vebtc-lock",
    kind: "snippet",
    insertText: `// Lock BTC into veBTC (lock NFT is minted to this contract)
function lockBtc(uint256 amount, uint256 duration) external returns (uint256 tokenId) {
    IERC20(${MEZO_CONTRACTS.BTC.testnet}).transferFrom(msg.sender, address(this), amount);
    IERC20(${MEZO_CONTRACTS.BTC.testnet}).approve(${MEZO_CONTRACTS.VEBTC.testnet}, amount);
    tokenId = IVeBTC(${MEZO_CONTRACTS.VEBTC.testnet}).createLock(amount, duration);
}`,
    documentation: "Pulls BTC (ERC-20) from the caller and locks it in veBTC on testnet. Needs IERC20 and IVeBTC.",
    detail: "veBTC lock",
  },
  {
    label: "native-btc-transfer",
    kind: "snippet",
    insertText: `// BTC is Mezo's native coin (18 decimals), so it moves like ETH on Ethereum
function sendBtc(address payable to, uint256 amountWei) internal {
    (bool ok, ) = to.call{value: amountWei}("");
    require(ok, "BTC transfer failed");
}

receive() external payable {}`,
    documentation: "Send and receive native BTC. msg.value and balances are in wei (1 BTC = 1e18).",
    detail: "Native BTC transfer",
  },
  {
    label: "btc-units",
    kind: "constant",
    insertText: `uint256 constant SATS_PER_BTC = 100_000_000;
uint256 constant WEI_PER_SAT = 1e10; // BTC has 18 decimals on Mezo`,
    documentation: "Unit conversions: 1 BTC = 1e8 sats = 1e18 wei on Mezo.",
    detail: "BTC units",
  },
  {
    label: "btc-gas-cost-sats",
    kind: "snippet",
    insertText: `// Gas cost of this transaction in sats (gas is paid in BTC on Mezo)
function gasCostInSats(uint256 gasUnits) public view returns (uint256) {
    return (gasUnits * tx.gasprice) / 1e10;
}`,
    documentation: "Converts gas units to sats using tx.gasprice.",
    detail: "Gas cost in sats",
  },
]

export const ALL_MEZO_COMPLETIONS: MezoCompletion[] = [
  ...ADDRESS_COMPLETIONS,
  ...INTERFACE_COMPLETIONS,
  ...PATTERN_COMPLETIONS,
]

/* ------------------------------------------------------------------ */
/* Hover documentation                                                  */
/* ------------------------------------------------------------------ */

const MUSD_DOC =
  "**MUSD** — Mezo USD, the BTC-backed stablecoin. Minted against BTC collateral in Liquity-style troves; ERC-20 with permit. Testnet `0x1189…c503`, mainnet `0xdD46…F186`."
const MEZO_DOC =
  "**Mezo** — EVM chain where gas is paid in BTC (18 decimals). Chain IDs: 31611 (testnet), 31612 (mainnet)."

export const MEZO_HOVER_DOCS: Record<string, string> = {
  MUSD: MUSD_DOC,
  BTC: "**BTC** — Mezo's native coin and gas token (18 decimals). Also available as an ERC-20 at `0x7b7c…0000` on both networks.",
  MEZO: "**MEZO** — the MEZO token, an ERC-20 at `0x7b7c…0001` on both networks.",
  veBTC: "**veBTC** — vote-escrowed BTC. Lock BTC (ERC-20) with `createLock` to get a lock NFT with voting power.",
  IVeBTC: "**IVeBTC** — subset of the verified veBTC interface. Approve BTC to veBTC before `createLock`.",
  IMezoPriceFeed: "**IMezoPriceFeed** — Chainlink-compatible feed interface (`latestRoundData`, `decimals`).",
  latestRoundData: "Returns `(roundId, answer, startedAt, updatedAt, answeredInRound)`. Check `updatedAt` for staleness.",
  createLock: "veBTC: locks `_value` BTC for `_lockDuration` seconds and returns the lock NFT id.",
  Pyth: "**Pyth** — pull oracle at `0x2880…7B43`. Push an update with `updatePriceFeeds` before trusting a price.",
  Passport:
    "**Mezo Passport** — Mezo's frontend wallet kit (npm `@mezo-org/passport`) for connecting Bitcoin and EVM wallets. It is not an on-chain contract.",
  Mezo: MEZO_DOC,
  "31611": "**Mezo Testnet** chain ID.",
  "31612": "**Mezo Mainnet** chain ID.",
  SATS_PER_BTC: "**100,000,000** sats in 1 BTC.",
  WEI_PER_SAT: "**1e10** wei per sat on Mezo (1 BTC = 1e18 wei).",
  sats: "**Satoshis** — 1 BTC = 100,000,000 sats.",
}

// Hover documentation for a word (case-insensitive)
export function getMezoHoverDoc(word: string): string | null {
  if (MEZO_HOVER_DOCS[word]) return MEZO_HOVER_DOCS[word]
  const lower = word.toLowerCase()
  for (const [key, value] of Object.entries(MEZO_HOVER_DOCS)) {
    if (key.toLowerCase() === lower) return value
  }
  if (lower.includes("musd")) return MUSD_DOC
  if (lower.includes("vebtc")) return MEZO_HOVER_DOCS.veBTC
  return null
}
