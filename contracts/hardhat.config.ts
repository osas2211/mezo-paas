import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

export default defineConfig({
  plugins: [hardhatEthers, hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.20",
      },
      production: {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    mezoTestnet: {
      type: "http",
      chainType: "l1",
      chainId: 31611,
      url: configVariable("MEZO_RPC_URL"),
      accounts: [
        configVariable("MEZO_OWNER_PRIVATE_KEY"),
        configVariable("MEZO_TREASURY_PRIVATE_KEY"),
      ],
    },
  },
});
