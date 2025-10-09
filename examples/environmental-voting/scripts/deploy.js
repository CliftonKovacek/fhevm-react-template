const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy EnvironmentalVoting contract to the specified network
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network sepolia
 *   npx hardhat run scripts/deploy.js --network localhost
 */

async function main() {
  console.log("\n🚀 Starting deployment process...\n");

  // Get network information
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  console.log(`📡 Deploying to network: ${networkName}`);
  console.log(`🆔 Chain ID: ${network.chainId}\n`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`👤 Deployer address: ${deployerAddress}`);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no funds. Please fund the account before deploying.");
  }

  // Get contract factory
  console.log("📦 Getting contract factory...");
  const EnvironmentalVoting = await ethers.getContractFactory("EnvironmentalVoting");

  // Estimate deployment gas
  console.log("⛽ Estimating deployment gas...");
  const deploymentData = EnvironmentalVoting.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas({
    data: deploymentData.data,
  });
  console.log(`📊 Estimated gas: ${estimatedGas.toString()}`);

  // Get current gas price
  const feeData = await ethers.provider.getFeeData();
  console.log(`💵 Gas price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei\n`);

  // Deploy contract
  console.log("🔨 Deploying EnvironmentalVoting contract...");
  const startTime = Date.now();

  const contract = await EnvironmentalVoting.deploy();
  await contract.waitForDeployment();

  const deployTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const contractAddress = await contract.getAddress();

  console.log(`\n✅ Contract deployed successfully!`);
  console.log(`📍 Contract address: ${contractAddress}`);
  console.log(`⏱️  Deployment time: ${deployTime}s\n`);

  // Get deployment transaction details
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    console.log(`📝 Transaction details:`);
    console.log(`   Hash: ${deployTx.hash}`);
    console.log(`   Block: ${deployTx.blockNumber || "Pending"}`);
    console.log(`   Gas used: ${deployTx.gasLimit?.toString() || "N/A"}\n`);
  }

  // Verify contract is deployed
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("❌ Contract deployment failed - no code at contract address");
  }
  console.log("✅ Contract code verified on blockchain\n");

  // Save deployment information
  const deploymentInfo = {
    network: networkName,
    chainId: network.chainId.toString(),
    contractName: "EnvironmentalVoting",
    contractAddress: contractAddress,
    deployerAddress: deployerAddress,
    transactionHash: deployTx?.hash || "",
    blockNumber: deployTx?.blockNumber || 0,
    deploymentTime: new Date().toISOString(),
    compiler: {
      version: "0.8.24",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
    constructorArgs: [],
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${networkName}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}\n`);

  // Print explorer link
  if (networkName === "sepolia") {
    console.log(`🔍 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`📜 Verify contract: npm run verify\n`);
  } else if (networkName === "mainnet") {
    console.log(`🔍 Etherscan: https://etherscan.io/address/${contractAddress}`);
    console.log(`📜 Verify contract: npm run verify\n`);
  }

  // Print next steps
  console.log("📋 Next steps:");
  console.log("   1. Verify contract on Etherscan (if deploying to testnet/mainnet)");
  console.log("   2. Test contract interaction: npm run interact");
  console.log("   3. Run simulation: npm run simulate");
  console.log("   4. Update frontend with contract address\n");

  return {
    contractAddress,
    deployerAddress,
    transactionHash: deployTx?.hash,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:\n");
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
