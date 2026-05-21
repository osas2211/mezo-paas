import { mezoTestnet } from "wagmi/chains"
import { http, webSocket } from "viem"
import { createConfig, } from "wagmi"

export const config = createConfig({
    chains: [mezoTestnet],
    transports: {
        [mezoTestnet.id]: webSocket("wss://rpc-ws.test.mezo.org"),
    },
})