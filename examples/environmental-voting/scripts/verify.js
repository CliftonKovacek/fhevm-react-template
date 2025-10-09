const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Verify deployed contract on Etherscan
 *
 * Usage:
 *   npx hardhat run scripts/verify.js --network sepolia
 *
 * Requirements:
 *   - ETHERSCAN_API_KEY must be set in .env file
 *   - Contract must already be deployed
 *   - Deployment info must exist in deployments/ directory
 */

async function main() {
  console.log("\n🔍 Starting contract verification process...\n");

  // Get network name
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  console.log(`📡 Network: ${networkName}`);
  console.log(`🆔 Chain ID: ${network.chainId}\n`);

  // Check if verification is supported on this network
  if (networkName === "localhost" || networkName === "hardhat") {
    console.log("⚠️  Contract verification is not available for local networks.");
    console.log("    Deploy to Sepolia or Mainnet to verify on Etherscan.\n");
    return;
  }

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${networkName}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(
      `❌ Deployment file not found: ${deploymentFile}\n` +
      `   Please deploy the contract first using: npm run deploy`
    );
  }

  console.log(`📂 Loading deployment info from: ${deploymentFile}`);
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  const contractAddress = deploymentInfo.contractAddress;
  const constructorArgs = deploymentInfo.constructorArgs || [];

  console.log(`📍 Contract address: ${contractAddress}`);
  console.log(`📋 Constructor args: ${constructorArgs.length > 0 ? JSON.stringify(constructorArgs) : "None"}\n`);

  // Check if ETHERSCAN_API_KEY is set
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error(
      "❌ ETHERSCAN_API_KEY not found in environment variables.\n" +
      "   Please add it to your .env file:\n" +
      "   ETHERSCAN_API_KEY=your-api-key-here"
    );
  }

  // Verify contract
  console.log("🔨 Verifying contract on Etherscan...");
  console.log("⏳ This may take a few moments...\n");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
      contract: "contracts/EnvironmentalVoting.sol:EnvironmentalVoting",
    });

    console.log("\n✅ Contract verified successfully!\n");

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    // Print Etherscan link
    const explorerUrl = getExplorerUrl(networkName, contractAddress);
    if (explorerUrl) {
      console.log(`🔍 View on Etherscan: ${explorerUrl}\n`);
    }

    console.log("📋 Next steps:");
    console.log("   1. Test contract interaction: npm run interact");
    console.log("   2. Run simulation: npm run simulate");
    console.log("   3. Update frontend with contract address\n");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified on Etherscan!\n");

      // Update deployment info
      deploymentInfo.verified = true;
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

      const explorerUrl = getExplorerUrl(networkName, contractAddress);
      if (explorerUrl) {
        console.log(`🔍 View on Etherscan: ${explorerUrl}\n`);
      }
    } else if (error.message.includes("does not have bytecode")) {
      throw new Error(
        "❌ Contract verification failed: No bytecode found at address.\n" +
        "   This usually means the contract wasn't deployed successfully.\n" +
        "   Please redeploy the contract and try again."
      );
    } else {
      throw error;
    }
  }
}

/**
 * Get Etherscan URL for the given network and contract address
 */
function getExplorerUrl(network, address) {
  const explorers = {
    mainnet: `https://etherscan.io/address/${address}`,
    sepolia: `https://sepolia.etherscan.io/address/${address}`,
    goerli: `https://goerli.etherscan.io/address/${address}`,
  };

  return explorers[network] || null;
}

/**
 * Verify contract with custom constructor arguments
 * Useful when deployment info file is not available
 */
async function verifyWithArgs(contractAddress, constructorArgs = []) {
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;

  console.log("\n🔍 Verifying contract with custom arguments...\n");
  console.log(`📍 Contract address: ${contractAddress}`);
  console.log(`📋 Constructor args: ${JSON.stringify(constructorArgs)}\n`);

  await run("verify:verify", {
    address: contractAddress,
    constructorArguments: constructorArgs,
    contract: "contracts/EnvironmentalVoting.sol:EnvironmentalVoting",
  });

  console.log("\n✅ Contract verified successfully!\n");
  console.log(`🔍 View on Etherscan: ${getExplorerUrl(networkName, contractAddress)}\n`);
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification failed:\n");
    console.error(error.message || error);
    process.exit(1);
  });

module.exports = { main, verifyWithArgs };
