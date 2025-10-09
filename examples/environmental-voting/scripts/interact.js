const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * Interactive script to interact with deployed EnvironmentalVoting contract
 *
 * Usage:
 *   npx hardhat run scripts/interact.js --network sepolia
 *
 * Features:
 *   - Create proposals
 *   - Submit votes (encrypted)
 *   - View proposals
 *   - Reveal results
 *   - End proposals
 */

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("\n🗳️  EnvironmentalVoting Contract Interaction Tool\n");
  console.log("=".repeat(60) + "\n");

  // Get network information
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  console.log(`📡 Network: ${networkName}`);
  console.log(`🆔 Chain ID: ${network.chainId}\n`);

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${networkName}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(
      `❌ Deployment file not found: ${deploymentFile}\n` +
      `   Please deploy the contract first using: npm run deploy`
    );
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`📍 Contract address: ${contractAddress}\n`);

  // Get signer
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  const balance = await ethers.provider.getBalance(signerAddress);

  console.log(`👤 Your address: ${signerAddress}`);
  console.log(`💰 Your balance: ${ethers.formatEther(balance)} ETH\n`);
  console.log("=".repeat(60) + "\n");

  // Connect to contract
  const EnvironmentalVoting = await ethers.getContractFactory("EnvironmentalVoting");
  const contract = EnvironmentalVoting.attach(contractAddress);

  // Check admin status
  const adminAddress = await contract.admin();
  const isAdmin = signerAddress.toLowerCase() === adminAddress.toLowerCase();
  console.log(`🔑 Admin address: ${adminAddress}`);
  console.log(`${isAdmin ? "✅" : "❌"} You are ${isAdmin ? "" : "NOT "}the admin\n`);

  // Main interaction loop
  let running = true;
  while (running) {
    console.log("\n📋 Available Actions:");
    console.log("   1. Create new proposal (admin only)");
    console.log("   2. View all proposals");
    console.log("   3. View specific proposal");
    console.log("   4. Submit vote");
    console.log("   5. Check if you voted");
    console.log("   6. Reveal proposal results (admin only)");
    console.log("   7. End proposal (admin only)");
    console.log("   8. Get contract info");
    console.log("   0. Exit\n");

    const choice = await question("Select an action (0-8): ");

    try {
      switch (choice.trim()) {
        case "1":
          await createProposal(contract, isAdmin);
          break;
        case "2":
          await viewAllProposals(contract);
          break;
        case "3":
          await viewProposal(contract);
          break;
        case "4":
          await submitVote(contract, signer);
          break;
        case "5":
          await checkVoteStatus(contract, signerAddress);
          break;
        case "6":
          await revealResults(contract, isAdmin, signer);
          break;
        case "7":
          await endProposal(contract, isAdmin);
          break;
        case "8":
          await getContractInfo(contract);
          break;
        case "0":
          console.log("\n👋 Goodbye!\n");
          running = false;
          break;
        default:
          console.log("\n❌ Invalid choice. Please try again.");
      }
    } catch (error) {
      console.error("\n❌ Error:", error.message);
    }
  }

  rl.close();
}

/**
 * Create a new proposal
 */
async function createProposal(contract, isAdmin) {
  if (!isAdmin) {
    console.log("\n❌ Only admin can create proposals.");
    return;
  }

  console.log("\n📝 Create New Proposal\n");

  const title = await question("Proposal title: ");
  const description = await question("Proposal description: ");
  const durationDays = await question("Duration (days): ");

  const durationSeconds = parseInt(durationDays) * 24 * 60 * 60;

  console.log("\n⏳ Creating proposal...");
  const tx = await contract.createProposal(title, description, durationSeconds);
  console.log(`📝 Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`✅ Proposal created! (Block: ${receipt.blockNumber})`);

  // Extract proposal ID from event
  const event = receipt.logs.find(log => {
    try {
      return contract.interface.parseLog(log).name === "ProposalCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsedEvent = contract.interface.parseLog(event);
    console.log(`🆔 Proposal ID: ${parsedEvent.args.proposalId}`);
  }
}

/**
 * View all proposals
 */
async function viewAllProposals(contract) {
  console.log("\n📊 All Proposals\n");

  const currentProposalId = await contract.currentProposalId();
  console.log(`Total proposals: ${currentProposalId}\n`);

  if (currentProposalId === 0n) {
    console.log("No proposals created yet.");
    return;
  }

  for (let i = 1n; i <= currentProposalId; i++) {
    await displayProposal(contract, i);
    console.log("-".repeat(60));
  }
}

/**
 * View specific proposal
 */
async function viewProposal(contract) {
  const proposalId = await question("\nEnter proposal ID: ");
  await displayProposal(contract, BigInt(proposalId));
}

/**
 * Display proposal details
 */
async function displayProposal(contract, proposalId) {
  try {
    const proposal = await contract.proposals(proposalId);

    console.log(`\n🆔 Proposal ID: ${proposalId}`);
    console.log(`📋 Title: ${proposal.title}`);
    console.log(`📝 Description: ${proposal.description}`);
    console.log(`⏰ Start: ${new Date(Number(proposal.startTime) * 1000).toLocaleString()}`);
    console.log(`⏰ End: ${new Date(Number(proposal.endTime) * 1000).toLocaleString()}`);
    console.log(`📊 Status: ${proposal.active ? "🟢 Active" : "🔴 Ended"}`);
    console.log(`👥 Total voters: ${proposal.totalVoters}`);
    console.log(`🔓 Results revealed: ${proposal.resultsRevealed ? "Yes" : "No"}`);

    // Show time remaining if active
    if (proposal.active) {
      const now = Math.floor(Date.now() / 1000);
      const timeRemaining = Number(proposal.endTime) - now;
      if (timeRemaining > 0) {
        const days = Math.floor(timeRemaining / 86400);
        const hours = Math.floor((timeRemaining % 86400) / 3600);
        console.log(`⏳ Time remaining: ${days}d ${hours}h`);
      } else {
        console.log(`⏳ Time remaining: Expired`);
      }
    }

  } catch (error) {
    console.log(`\n❌ Proposal ${proposalId} not found.`);
  }
}

/**
 * Submit an encrypted vote
 */
async function submitVote(contract, signer) {
  console.log("\n🗳️  Submit Vote\n");

  const proposalId = await question("Proposal ID: ");
  const voteChoice = await question("Vote (yes/no): ");

  // Note: In real FHEVM implementation, votes need to be encrypted using FHE library
  // This is a simplified version for demonstration
  console.log("\n⚠️  Note: This is a simplified interaction.");
  console.log("    In production, votes must be encrypted using FHEVM library.\n");

  const voteValue = voteChoice.toLowerCase().startsWith("y") ? 1 : 0;

  console.log("⏳ Submitting vote...");
  // This would need proper FHEVM encryption in production
  // const encryptedVote = await encrypt(voteValue, contract.address);
  // const tx = await contract.vote(proposalId, encryptedVote);

  console.log("❌ Direct voting requires FHEVM encryption library.");
  console.log("   Please use the frontend interface for encrypted voting.\n");
}

/**
 * Check if user has voted
 */
async function checkVoteStatus(contract, voterAddress) {
  const proposalId = await question("\nEnter proposal ID: ");

  try {
    const vote = await contract.votes(proposalId, voterAddress);
    console.log(`\n${vote.hasVoted ? "✅" : "❌"} You have ${vote.hasVoted ? "" : "NOT "}voted on this proposal.`);

    if (vote.hasVoted) {
      console.log(`⏰ Voted at: ${new Date(Number(vote.timestamp) * 1000).toLocaleString()}`);
    }
  } catch (error) {
    console.log("\n❌ Error checking vote status:", error.message);
  }
}

/**
 * Reveal proposal results (admin only)
 */
async function revealResults(contract, isAdmin, signer) {
  if (!isAdmin) {
    console.log("\n❌ Only admin can reveal results.");
    return;
  }

  const proposalId = await question("\nEnter proposal ID: ");

  console.log("\n⏳ Revealing results...");

  try {
    // Note: In real FHEVM, this would use FHE.decrypt() with proper permissions
    console.log("❌ Result revelation requires FHEVM decryption setup.");
    console.log("   This needs to be done through FHEVM's gateway service.\n");

    // In a real implementation:
    // const tx = await contract.revealResults(proposalId);
    // await tx.wait();
    // console.log("✅ Results revealed!");

  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

/**
 * End a proposal (admin only)
 */
async function endProposal(contract, isAdmin) {
  if (!isAdmin) {
    console.log("\n❌ Only admin can end proposals.");
    return;
  }

  const proposalId = await question("\nEnter proposal ID: ");

  console.log("\n⏳ Ending proposal...");

  try {
    const tx = await contract.endProposal(proposalId);
    console.log(`📝 Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Proposal ended! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

/**
 * Get general contract information
 */
async function getContractInfo(contract) {
  console.log("\n📊 Contract Information\n");

  const admin = await contract.admin();
  const currentProposalId = await contract.currentProposalId();

  console.log(`🔑 Admin: ${admin}`);
  console.log(`🆔 Total proposals: ${currentProposalId}`);
  console.log(`📍 Contract: ${await contract.getAddress()}`);
}

// Execute interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:\n");
    console.error(error);
    rl.close();
    process.exit(1);
  });

module.exports = { main };
