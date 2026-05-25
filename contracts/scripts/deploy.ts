import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const [deployer, treasury] = await ethers.getSigners(); // Use a separate wallet for the treasury if possible

  console.log("🚀 Deploying from:", deployer.address);
  console.log("🏦 Treasury Wallet:", treasury.address);

  // // 1. Deploy Mock Token (For testing before mainnet Mezo)
  // const MockToken = await ethers.getContractFactory("MockBTC");
  // const token = await MockToken.deploy();
  // await token.waitForDeployment();
  // const tokenAddress = await token.getAddress();
  // console.log("🪙 MockBTC deployed to:", tokenAddress);

  // 2. Deploy the Billing Contract
  const MezoHostBilling = await ethers.getContractFactory("MezoHostBilling");
  const billing = await MezoHostBilling.deploy(
    "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
    treasury.address,
  );
  await billing.waitForDeployment();
  const billingAddress = await billing.getAddress();
  console.log("⚙️ MezoHostBilling deployed to:", billingAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
