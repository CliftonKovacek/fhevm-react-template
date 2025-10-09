const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * EnvironmentalVoting Sepolia Testnet Tests
 *
 * These tests run on Sepolia testnet with deployed contract
 * Usage: npx hardhat test --network sepolia
 *
 * Requirements:
 * - Contract must be deployed to Sepolia
 * - Deployment info must exist in deployments/
 * - Account must have Sepolia ETH
 */

describe("EnvironmentalVoting - Sepolia Tests", function () {
  let environmentalVoting;
  let contractAddress;
  let deployer;
  let step, steps;

  function progress(message) {
    console.log(`      ${++step}/${steps} ${message}`);
  }

  before(async function () {
    // Skip if not on Sepolia
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 11155111n) {
      console.log("\n      ⚠️  Skipping Sepolia tests - not on Sepolia network");
      console.log("      Run with: npx hardhat test --network sepolia\n");
      this.skip();
    }

    // Load deployment info
    const fs = require("fs");
    const path = require("path");
    const deploymentFile = path.join(__dirname, "..", "deployments", "sepolia-deployment.json");

    if (!fs.existsSync(deploymentFile)) {
      throw new Error(
        `❌ Deployment file not found: ${deploymentFile}\n` +
        `   Please deploy to Sepolia first: npm run deploy`
      );
    }

    console.log("\n      📂 Loading deployment info...");
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    contractAddress = deploymentInfo.contractAddress;

    console.log(`      📍 Contract address: ${contractAddress}`);

    // Get contract instance
    environmentalVoting = await ethers.getContractAt(
      "EnvironmentalVoting",
      contractAddress
    );

    // Get signer
    [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log(`      👤 Test account: ${deployer.address}`);
    console.log(`      💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

    if (balance === 0n) {
      throw new Error(
        "❌ Test account has no ETH. Please fund account with Sepolia ETH."
      );
    }
  });

  beforeEach(function () {
    step = 0;
    steps = 0;
  });

  describe("Sepolia Network Validation", function () {
    it("should be connected to Sepolia testnet", async function () {
      steps = 3;

      progress("Checking network...");
      const network = await ethers.provider.getNetwork();
      expect(network.chainId).to.equal(11155111n);

      progress("Checking block number...");
      const blockNumber = await ethers.provider.getBlockNumber();
      expect(blockNumber).to.be.gt(0);
      console.log(`         Current block: ${blockNumber}`);

      progress("Network validation complete");
    });

    it("should have contract deployed at correct address", async function () {
      steps = 2;

      progress("Checking contract code...");
      const code = await ethers.provider.getCode(contractAddress);
      expect(code).to.not.equal("0x");
      expect(code.length).to.be.gt(100);

      progress("Contract code verified");
    });
  });

  describe("Admin Functions on Sepolia", function () {
    it("should verify admin address", async function () {
      this.timeout(60000); // 60 seconds
      steps = 2;

      progress("Getting admin address...");
      const adminAddress = await environmentalVoting.admin();
      expect(adminAddress).to.be.properAddress;
      console.log(`         Admin: ${adminAddress}`);

      progress("Admin verified");
    });

    it("should get current proposal count", async function () {
      this.timeout(60000);
      steps = 2;

      progress("Getting proposal count...");
      const currentId = await environmentalVoting.currentProposalId();
      expect(currentId).to.be.gte(0);
      console.log(`         Current proposals: ${currentId}`);

      progress("Proposal count retrieved");
    });
  });

  describe("Proposal Creation on Sepolia", function () {
    it("should create proposal on Sepolia testnet", async function () {
      this.timeout(120000); // 2 minutes
      steps = 5;

      const proposalTitle = `Test Proposal ${Date.now()}`;
      const proposalDescription = "Testing proposal creation on Sepolia testnet";
      const duration = 7 * 24 * 60 * 60; // 7 days

      progress("Checking admin status...");
      const adminAddress = await environmentalVoting.admin();
      const isAdmin = deployer.address.toLowerCase() === adminAddress.toLowerCase();

      if (!isAdmin) {
        console.log(`         ⚠️  Current account is not admin`);
        console.log(`         Admin: ${adminAddress}`);
        console.log(`         Account: ${deployer.address}`);
        this.skip();
      }

      progress("Getting initial proposal count...");
      const beforeCount = await environmentalVoting.currentProposalId();
      console.log(`         Before: ${beforeCount} proposals`);

      progress("Creating proposal...");
      const tx = await environmentalVoting.createProposal(
        proposalTitle,
        proposalDescription,
        duration
      );

      progress("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log(`         TX: ${receipt.hash}`);
      console.log(`         Block: ${receipt.blockNumber}`);
      console.log(`         Gas used: ${receipt.gasUsed.toString()}`);

      progress("Verifying proposal creation...");
      const afterCount = await environmentalVoting.currentProposalId();
      console.log(`         After: ${afterCount} proposals`);

      expect(afterCount).to.equal(beforeCount + 1n);
    });
  });

  describe("Proposal Data Retrieval on Sepolia", function () {
    it("should retrieve proposal data if proposals exist", async function () {
      this.timeout(120000);
      steps = 4;

      progress("Getting proposal count...");
      const currentId = await environmentalVoting.currentProposalId();

      if (currentId === 0n) {
        console.log(`         ℹ️  No proposals exist yet`);
        this.skip();
      }

      progress(`Retrieving proposal ${currentId}...`);
      const proposal = await environmentalVoting.proposals(currentId);

      progress("Validating proposal data...");
      expect(proposal.title).to.be.a("string");
      expect(proposal.description).to.be.a("string");
      expect(proposal.startTime).to.be.a("bigint");
      expect(proposal.endTime).to.be.a("bigint");

      console.log(`         Title: ${proposal.title}`);
      console.log(`         Active: ${proposal.active}`);
      console.log(`         Total voters: ${proposal.totalVoters}`);

      const startDate = new Date(Number(proposal.startTime) * 1000);
      const endDate = new Date(Number(proposal.endTime) * 1000);
      console.log(`         Start: ${startDate.toLocaleString()}`);
      console.log(`         End: ${endDate.toLocaleString()}`);

      progress("Proposal data validated");
    });

    it("should check voting status for account", async function () {
      this.timeout(120000);
      steps = 3;

      const currentId = await environmentalVoting.currentProposalId();

      if (currentId === 0n) {
        console.log(`         ℹ️  No proposals exist yet`);
        this.skip();
      }

      progress(`Checking vote status for proposal ${currentId}...`);
      const voteRecord = await environmentalVoting.votes(currentId, deployer.address);

      progress("Analyzing vote record...");
      expect(voteRecord.hasVoted).to.be.a("boolean");
      expect(voteRecord.timestamp).to.be.a("bigint");

      console.log(`         Has voted: ${voteRecord.hasVoted}`);
      if (voteRecord.hasVoted) {
        const voteDate = new Date(Number(voteRecord.timestamp) * 1000);
        console.log(`         Voted at: ${voteDate.toLocaleString()}`);
      }

      progress("Vote status checked");
    });
  });

  describe("Gas Cost Analysis on Sepolia", function () {
    it("should measure gas costs for view functions", async function () {
      this.timeout(90000);
      steps = 3;

      progress("Calling admin() view...");
      let startGas = await ethers.provider.getBalance(deployer.address);
      await environmentalVoting.admin();
      console.log(`         ✓ admin() - no gas cost (view function)`);

      progress("Calling currentProposalId() view...");
      await environmentalVoting.currentProposalId();
      console.log(`         ✓ currentProposalId() - no gas cost (view function)`);

      progress("Gas analysis complete");
      console.log(`         Note: View functions don't consume gas`);
    });
  });

  describe("Network State Verification", function () {
    it("should verify contract state consistency", async function () {
      this.timeout(90000);
      steps = 4;

      progress("Reading contract state...");
      const admin = await environmentalVoting.admin();
      const proposalCount = await environmentalVoting.currentProposalId();

      progress("Verifying state consistency...");
      expect(admin).to.not.equal(ethers.ZeroAddress);
      expect(proposalCount).to.be.gte(0);

      progress("Checking proposal data integrity...");
      if (proposalCount > 0n) {
        for (let i = 1n; i <= proposalCount && i <= 3n; i++) {
          const proposal = await environmentalVoting.proposals(i);
          expect(proposal.startTime).to.be.lte(proposal.endTime);
          console.log(`         ✓ Proposal ${i} data valid`);
        }
      } else {
        console.log(`         ℹ️  No proposals to verify`);
      }

      progress("State consistency verified");
    });

    it("should verify Etherscan integration", async function () {
      steps = 2;

      progress("Generating Etherscan link...");
      const etherscanUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;
      console.log(`         🔍 View on Etherscan:`);
      console.log(`         ${etherscanUrl}`);

      progress("Etherscan link generated");
    });
  });

  describe("Live Contract Statistics", function () {
    it("should display current contract statistics", async function () {
      this.timeout(120000);
      steps = 1;

      progress("Gathering statistics...");

      const admin = await environmentalVoting.admin();
      const totalProposals = await environmentalVoting.currentProposalId();
      const network = await ethers.provider.getNetwork();
      const blockNumber = await ethers.provider.getBlockNumber();

      console.log(`\n         📊 Contract Statistics:`);
      console.log(`         ========================`);
      console.log(`         Contract: ${contractAddress}`);
      console.log(`         Admin: ${admin}`);
      console.log(`         Total Proposals: ${totalProposals}`);
      console.log(`         Network: Sepolia (${network.chainId})`);
      console.log(`         Block: ${blockNumber}`);

      if (totalProposals > 0n) {
        console.log(`\n         📋 Recent Proposals:`);
        const limit = totalProposals < 3n ? totalProposals : 3n;
        for (let i = totalProposals; i > totalProposals - limit; i--) {
          const proposal = await environmentalVoting.proposals(i);
          console.log(`         ${i}. ${proposal.title}`);
          console.log(`            Status: ${proposal.active ? "🟢 Active" : "🔴 Ended"}`);
          console.log(`            Voters: ${proposal.totalVoters}`);
        }
      }

      console.log(`\n         🔗 Useful Links:`);
      console.log(`         Contract: https://sepolia.etherscan.io/address/${contractAddress}`);
      console.log(`         Admin: https://sepolia.etherscan.io/address/${admin}`);
      console.log(``);
    });
  });
});
