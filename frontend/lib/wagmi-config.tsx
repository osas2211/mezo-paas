import { mezoTestnet } from "wagmi/chains"
import { http, webSocket } from "viem"
import { createConfig, } from "wagmi"

export const config = createConfig({
    chains: [mezoTestnet],
    transports: {
        [mezoTestnet.id]: http("https://rpc.test.mezo.org"),
    },
})