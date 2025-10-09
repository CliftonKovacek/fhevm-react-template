const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Simulation script for EnvironmentalVoting contract
 *
 * This script simulates a complete voting workflow:
 *   1. Deploy contract (if needed)
 *   2. Create multiple proposals
 *   3. Simulate multiple voters
 *   4. End proposals
 *   5. Generate reports
 *
 * Usage:
 *   npx hardhat run scripts/simulate.js --network localhost
 *   npx hardhat run scripts/simulate.js --network sepolia
 */

async function main() {
  console.log("\n🎭 EnvironmentalVoting Simulation\n");
  console.log("=".repeat(70) + "\n");

  // Get network information
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  console.log(`📡 Network: ${networkName}`);
  console.log(`🆔 Chain ID: ${network.chainId}\n`);

  // Get signers for simulation
  const signers = await ethers.getSigners();
  console.log(`👥 Available accounts: ${signers.length}\n`);

  if (signers.length < 5) {
    console.log("⚠️  Warning: Simulation works best with at least 5 accounts.");
    console.log("   Consider running on local network with more accounts.\n");
  }

  // Deploy or connect to contract
  let contract;
  let contractAddress;
  const deploymentFile = path.join(__dirname, "..", "deployments", `${networkName}-deployment.json`);

  if (fs.existsSync(deploymentFile)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    contractAddress = deploymentInfo.contractAddress;
    console.log(`📍 Using existing deployment: ${contractAddress}\n`);

    const EnvironmentalVoting = await ethers.getContractFactory("EnvironmentalVoting");
    contract = EnvironmentalVoting.attach(contractAddress);
  } else {
    console.log("📦 No existing deployment found. Deploying new contract...\n");
    const EnvironmentalVoting = await ethers.getContractFactory("EnvironmentalVoting");
    contract = await EnvironmentalVoting.deploy();
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();
    console.log(`✅ Contract deployed: ${contractAddress}\n`);
  }

  console.log("=".repeat(70) + "\n");

  // Simulation parameters
  const admin = signers[0];
  const voters = signers.slice(1, Math.min(signers.length, 6)); // Use up to 5 voters

  console.log("📋 Simulation Setup:");
  console.log(`   Admin: ${await admin.getAddress()}`);
  console.log(`   Voters: ${voters.length}`);
  voters.forEach(async (voter, i) => {
    console.log(`      Voter ${i + 1}: ${await voter.getAddress()}`);
  });
  console.log("\n" + "=".repeat(70) + "\n");

  // Step 1: Create proposals
  console.log("🎯 STEP 1: Creating Environmental Proposals\n");

  const proposals = [
    {
      title: "Ban Single-Use Plastics in City Parks",
      description: "Proposal to eliminate all single-use plastic items from city parks and implement biodegradable alternatives.",
      duration: 7, // 7 days
    },
    {
      title: "Expand Urban Green Spaces",
      description: "Initiative to convert 20% of unused urban lots into community gardens and green spaces over the next 2 years.",
      duration: 10,
    },
    {
      title: "Mandatory Solar Panels for New Buildings",
      description: "Require all new commercial and residential buildings to install solar panels covering at least 30% of roof space.",
      duration: 14,
    },
  ];

  const createdProposals = [];

  for (let i = 0; i < proposals.length; i++) {
    const { title, description, duration } = proposals[i];
    const durationSeconds = duration * 24 * 60 * 60;

    console.log(`\n📝 Creating Proposal ${i + 1}: "${title}"`);
    console.log(`   Duration: ${duration} days`);

    try {
      const tx = await contract.connect(admin).createProposal(
        title,
        description,
        durationSeconds
      );

      const receipt = await tx.wait();

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
        const proposalId = parsedEvent.args.proposalId;
        createdProposals.push(proposalId);
        console.log(`   ✅ Created! Proposal ID: ${proposalId}`);
        console.log(`   📝 TX: ${tx.hash}`);
      }

      await sleep(1000); // Small delay between transactions
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n✅ Created ${createdProposals.length} proposals\n`);
  console.log("=".repeat(70) + "\n");

  // Step 2: Display proposals
  console.log("📊 STEP 2: Viewing Created Proposals\n");

  for (const proposalId of createdProposals) {
    await displayProposal(contract, proposalId);
    console.log("-".repeat(70));
  }

  console.log("\n" + "=".repeat(70) + "\n");

  // Step 3: Simulate voting (Note: Requires FHEVM setup)
  console.log("🗳️  STEP 3: Simulating Votes\n");
  console.log("⚠️  Note: Actual encrypted voting requires FHEVM library integration.");
  console.log("   This simulation demonstrates the workflow structure.\n");

  // In a real implementation with FHEVM:
  /*
  for (const proposalId of createdProposals) {
    console.log(`\nProposal ${proposalId}:`);

    for (let i = 0; i < voters.length; i++) {
      const voter = voters[i];
      const voteValue = Math.random() > 0.5 ? 1 : 0; // Random yes/no

      // Encrypt vote using FHEVM
      const encryptedVote = await encryptVote(voteValue, contractAddress);

      const tx = await contract.connect(voter).vote(proposalId, encryptedVote);
      await tx.wait();

      console.log(`   Voter ${i + 1}: ${voteValue === 1 ? '👍 Yes' : '👎 No'} - TX: ${tx.hash}`);
      await sleep(500);
    }
  }
  */

  console.log("   Skipping actual vote submission (requires FHEVM setup)\n");

  console.log("=".repeat(70) + "\n");

  // Step 4: Check proposal status
  console.log("📈 STEP 4: Current Proposal Status\n");

  for (const proposalId of createdProposals) {
    const proposal = await contract.proposals(proposalId);
    console.log(`Proposal ${proposalId}: ${proposal.title}`);
    console.log(`   Status: ${proposal.active ? "🟢 Active" : "🔴 Ended"}`);
    console.log(`   Total Voters: ${proposal.totalVoters}`);
    console.log(`   Results Revealed: ${proposal.resultsRevealed ? "Yes" : "No"}\n`);
  }

  console.log("=".repeat(70) + "\n");

  // Step 5: Generate simulation report
  console.log("📊 STEP 5: Generating Simulation Report\n");

  const report = {
    network: networkName,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    simulationTime: new Date().toISOString(),
    proposals: [],
    summary: {
      totalProposals: createdProposals.length,
      totalVoters: voters.length,
      adminAddress: await admin.getAddress(),
    },
  };

  for (const proposalId of createdProposals) {
    const proposal = await contract.proposals(proposalId);
    report.proposals.push({
      id: proposalId.toString(),
      title: proposal.title,
      description: proposal.description,
      active: proposal.active,
      totalVoters: proposal.totalVoters.toString(),
      startTime: new Date(Number(proposal.startTime) * 1000).toISOString(),
      endTime: new Date(Number(proposal.endTime) * 1000).toISOString(),
    });
  }

  // Save report
  const reportsDir = path.join(__dirname, "..", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportFile = path.join(reportsDir, `simulation-${networkName}-${timestamp}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  console.log(`💾 Report saved: ${reportFile}\n`);

  // Print summary
  console.log("=".repeat(70) + "\n");
  console.log("✅ SIMULATION COMPLETE\n");
  console.log("📋 Summary:");
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Proposals Created: ${createdProposals.length}`);
  console.log(`   Voters: ${voters.length}`);
  console.log(`   Network: ${networkName}`);
  console.log("\n📖 Next Steps:");
  console.log("   1. Review simulation report in reports/ directory");
  console.log("   2. Test with frontend application");
  console.log("   3. Implement FHEVM encryption for actual voting");
  console.log("   4. Test proposal lifecycle (vote → reveal → end)");
  console.log("\n");
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

    if (proposal.active) {
      const now = Math.floor(Date.now() / 1000);
      const timeRemaining = Number(proposal.endTime) - now;
      if (timeRemaining > 0) {
        const days = Math.floor(timeRemaining / 86400);
        const hours = Math.floor((timeRemaining % 86400) / 3600);
        console.log(`⏳ Time remaining: ${days}d ${hours}h`);
      }
    }
  } catch (error) {
    console.log(`❌ Error fetching proposal ${proposalId}: ${error.message}`);
  }
}

/**
 * Helper function to add delay between operations
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:\n");
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
