import { network } from "hardhat"

async function main() {
  // 1. Initialize the Hardhat v3 Network Connection
  const { ethers } = await network.create()

  const [deployer] = await ethers.getSigners()
  console.log("🚀 Deploying contracts with account:", deployer.address)

  // 2. Deploy Mock Token (v3 syntax uses deployContract directly)
  const token = await ethers.deployContract("MockBTC")
  await token.waitForDeployment()
  const tokenAddress = await token.getAddress()
  console.log("💰 MockBTC deployed to:", tokenAddress)

  // 3. Deploy HodlVault
  // Notice constructor arguments are now passed as an array
  const vault = await ethers.deployContract("HodlVault", [tokenAddress, deployer.address])
  await vault.waitForDeployment()
  const vaultAddress = await vault.getAddress()
  console.log("🏦 HodlVault deployed to:", vaultAddress)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})