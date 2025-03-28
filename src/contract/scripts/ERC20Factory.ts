import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const GameItem = await ethers.getContractFactory("ERC20Factory");
  const gameItem = await GameItem.deploy();

  await gameItem.waitForDeployment();

  const contractAddress = gameItem.target;
  console.log("ERC20Factory deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});