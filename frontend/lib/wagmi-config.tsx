import { createConfig } from "wagmi"
import { mezoChains, mezoTransport } from "@/lib/ide/mezo-network"

// Chains carry Mezo's documented RPCs, so "add network" prompts in wallets
// get a working endpoint; transports fall back across providers.
export const config = createConfig({
    chains: [mezoChains.mainnet, mezoChains.testnet],
    transports: {
        [mezoChains.mainnet.id]: mezoTransport("mainnet"),
        [mezoChains.testnet.id]: mezoTransport("testnet"),
    },
})
