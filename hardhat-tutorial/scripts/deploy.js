// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  /*
A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
so nftContract here is a factory for instances of our NFTee contract.
*/
  const coinContract = await ethers.getContractFactory("Batch4Team1Coin");
  const receiptContract = await ethers.getContractFactory("Batch4Team1Receipt");
  const crowdfundContract = await ethers.getContractFactory("Crowdfund");

  // here we deploy the contract
  const deployedCoinContract = await coinContract.deploy();
  const deployedReceiptContract = await receiptContract.deploy();

  // wait for the contract to deploy
  await deployedCoinContract.deployed();
  await deployedReceiptContract.deployed();

  // print the address of the deployed contract
  console.log("Coin Contract Address:", deployedCoinContract.address);
  console.log("Receipt Contract Address:", deployedReceiptContract.address);

  const deployedCrowdfundContract = await crowdfundContract.deploy(deployedCoinContract.address, deployedReceiptContract.address);

  await deployedCrowdfundContract.deployed();
  console.log("Crowdfund Contract Address:", deployedCrowdfundContract.address);

}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });