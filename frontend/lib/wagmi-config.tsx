import { mezo, mezoTestnet } from "wagmi/chains"
import { http } from "viem"
import { createConfig } from "wagmi"

export const config = createConfig({
    chains: [mezo, mezoTestnet],
    transports: {
        [mezo.id]: http("https://rpc.mezo.org"),
        [mezoTestnet.id]: http("https://rpc.test.mezo.org"),
    },
})