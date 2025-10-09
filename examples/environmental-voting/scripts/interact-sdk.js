/**
 * Environmental Voting - SDK Integration Example
 *
 * This script demonstrates how to use @fhevm/sdk with the EnvironmentalVoting contract
 */

const { createFhevmSDK } = require('@fhevm/sdk');
const { ethers } = require('ethers');
const readline = require('readline');
require('dotenv').config();

// Load deployment info
const fs = require('fs');
const deploymentPath = './deployments/sepolia-deployment.json';

// Contract ABI (simplified)
const VOTING_ABI = [
  'function createProposal(string title, string description, uint256 duration) external',
  'function vote(uint256 proposalId, bytes calldata encryptedVote, bytes calldata inputProof) external',
  'function revealResults(uint256 proposalId) external',
  'function getProposal(uint256 proposalId) external view returns (tuple(string title, string description, uint256 deadline, bool isActive, bool resultsRevealed, uint64 yesVotes, uint64 noVotes))',
  'function hasVoted(uint256 proposalId, address voter) external view returns (bool)',
  'function getProposalCount() external view returns (uint256)',
  'function admin() external view returns (address)',
];

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) =>
  new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log('🔐 Environmental Voting - SDK Integration Demo\n');

  // 1. Initialize SDK
  console.log('📦 Step 1: Initialize FHEVM SDK...');
  const sdk = createFhevmSDK({
    network: {
      chainId: 11155111, // Sepolia
      rpcUrl: process.env.SEPOLIA_RPC_URL,
    },
  });

  await sdk.init();
  console.log('✅ SDK initialized\n');

  // 2. Get account info
  const account = await sdk.getAccount();
  console.log(`👤 Connected Account: ${account}\n`);

  // 3. Load contract
  let contractAddress;
  if (fs.existsSync(deploymentPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    contractAddress = deployment.contractAddress;
  } else {
    contractAddress = await question('📝 Enter contract address: ');
  }

  const contract = sdk.getContract(contractAddress, VOTING_ABI);
  console.log(`📜 Contract: ${contractAddress}\n`);

  // 4. Check if user is admin
  const admin = await contract.admin();
  const isAdmin = admin.toLowerCase() === account.toLowerCase();
  console.log(`👑 Admin: ${admin}`);
  console.log(`🔑 You are ${isAdmin ? 'ADMIN' : 'VOTER'}\n`);

  // 5. Main menu
  let exit = false;
  while (!exit) {
    console.log('═'.repeat(60));
    console.log('MAIN MENU');
    console.log('═'.repeat(60));
    console.log('1. View all proposals');
    console.log('2. View proposal details');
    if (isAdmin) {
      console.log('3. Create new proposal (Admin)');
      console.log('4. Reveal results (Admin)');
    }
    console.log('5. Vote on proposal');
    console.log('6. Check if you voted');
    console.log('7. Exit');
    console.log('═'.repeat(60));

    const choice = await question('\n🔢 Select option: ');

    try {
      switch (choice) {
        case '1':
          await viewAllProposals(contract);
          break;
        case '2':
          await viewProposalDetails(contract);
          break;
        case '3':
          if (isAdmin) {
            await createProposal(contract);
          } else {
            console.log('❌ Admin only!');
          }
          break;
        case '4':
          if (isAdmin) {
            await revealResults(contract, sdk, contractAddress);
          } else {
            console.log('❌ Admin only!');
          }
          break;
        case '5':
          await voteOnProposal(contract, sdk, contractAddress, account);
          break;
        case '6':
          await checkVoted(contract, account);
          break;
        case '7':
          exit = true;
          break;
        default:
          console.log('❌ Invalid option');
      }
    } catch (error) {
      console.error('\n❌ Error:', error.message);
    }

    if (!exit) {
      await question('\n⏎ Press Enter to continue...');
      console.log('\n');
    }
  }

  rl.close();
  console.log('\n👋 Goodbye!\n');
}

// ============================================================================
// Functions
// ============================================================================

async function viewAllProposals(contract) {
  console.log('\n📋 All Proposals:');
  console.log('─'.repeat(60));

  const count = await contract.getProposalCount();
  console.log(`Total: ${count} proposals\n`);

  for (let i = 1; i <= count; i++) {
    const proposal = await contract.getProposal(i);
    const deadline = new Date(Number(proposal.deadline) * 1000);
    const now = new Date();
    const isActive = now < deadline;

    console.log(`Proposal #${i}:`);
    console.log(`  Title: ${proposal.title}`);
    console.log(`  Active: ${isActive ? '✅ Yes' : '❌ No'}`);
    console.log(`  Deadline: ${deadline.toLocaleString()}`);
    console.log(`  Results: ${proposal.resultsRevealed ? '✅ Revealed' : '🔒 Hidden'}`);
    if (proposal.resultsRevealed) {
      console.log(`  Yes: ${proposal.yesVotes}, No: ${proposal.noVotes}`);
    }
    console.log('');
  }
}

async function viewProposalDetails(contract) {
  const id = await question('\n📝 Enter proposal ID: ');

  const proposal = await contract.getProposal(id);
  const deadline = new Date(Number(proposal.deadline) * 1000);
  const now = new Date();
  const isActive = now < deadline;

  console.log('\n📋 Proposal Details:');
  console.log('─'.repeat(60));
  console.log(`ID: ${id}`);
  console.log(`Title: ${proposal.title}`);
  console.log(`Description: ${proposal.description}`);
  console.log(`Deadline: ${deadline.toLocaleString()}`);
  console.log(`Status: ${isActive ? '✅ Active' : '❌ Ended'}`);
  console.log(`Results: ${proposal.resultsRevealed ? '✅ Revealed' : '🔒 Hidden'}`);

  if (proposal.resultsRevealed) {
    console.log('\n🗳️ Results:');
    console.log(`  Yes votes: ${proposal.yesVotes}`);
    console.log(`  No votes: ${proposal.noVotes}`);
    console.log(`  Total: ${BigInt(proposal.yesVotes) + BigInt(proposal.noVotes)}`);
  }
}

async function createProposal(contract) {
  console.log('\n📝 Create New Proposal');
  console.log('─'.repeat(60));

  const title = await question('Title: ');
  const description = await question('Description: ');
  const durationDays = await question('Duration (days): ');

  const duration = parseInt(durationDays) * 24 * 60 * 60; // Convert to seconds

  console.log('\n📤 Submitting proposal...');
  const tx = await contract.createProposal(title, description, duration);

  console.log('⏳ Waiting for confirmation...');
  await tx.wait();

  console.log('✅ Proposal created successfully!');
}

async function voteOnProposal(contract, sdk, contractAddress, account) {
  console.log('\n🗳️ Vote on Proposal');
  console.log('─'.repeat(60));

  // Show active proposals
  const count = await contract.getProposalCount();
  console.log('\nActive Proposals:');
  for (let i = 1; i <= count; i++) {
    const proposal = await contract.getProposal(i);
    const deadline = new Date(Number(proposal.deadline) * 1000);
    const now = new Date();

    if (now < deadline) {
      const hasVoted = await contract.hasVoted(i, account);
      console.log(`  ${i}. ${proposal.title} ${hasVoted ? '(✓ Voted)' : ''}`);
    }
  }

  const id = await question('\n📝 Enter proposal ID: ');

  // Check if already voted
  const hasVoted = await contract.hasVoted(id, account);
  if (hasVoted) {
    console.log('⚠️  You have already voted on this proposal!');
    return;
  }

  const voteChoice = await question('Vote (yes/no): ');

  // **KEY SDK FEATURE: Encrypt vote**
  console.log('\n🔒 Encrypting your vote using @fhevm/sdk...');
  const voteValue = voteChoice.toLowerCase() === 'yes' ? 1 : 0;

  const encrypted = await sdk.encryptU8(voteValue, contractAddress);
  console.log('✅ Vote encrypted successfully!');

  // Submit encrypted vote
  console.log('📤 Submitting encrypted vote to blockchain...');
  const tx = await contract.vote(id, encrypted.data, encrypted.proof);

  console.log('⏳ Waiting for confirmation...');
  await tx.wait();

  console.log('✅ Vote submitted successfully!');
  console.log('🔐 Your vote is encrypted and private!');
}

async function revealResults(contract, sdk, contractAddress) {
  console.log('\n🔓 Reveal Proposal Results');
  console.log('─'.repeat(60));

  const id = await question('📝 Enter proposal ID: ');

  const proposal = await contract.getProposal(id);
  if (proposal.resultsRevealed) {
    console.log('⚠️  Results already revealed!');
    console.log(`Yes: ${proposal.yesVotes}, No: ${proposal.noVotes}`);
    return;
  }

  console.log('\n📤 Revealing results...');
  const tx = await contract.revealResults(id);

  console.log('⏳ Waiting for confirmation...');
  await tx.wait();

  console.log('✅ Results revealed!');

  // Fetch updated proposal
  const updated = await contract.getProposal(id);
  console.log('\n🗳️ Final Results:');
  console.log(`  Yes votes: ${updated.yesVotes}`);
  console.log(`  No votes: ${updated.noVotes}`);
  console.log(`  Total: ${BigInt(updated.yesVotes) + BigInt(updated.noVotes)}`);
}

async function checkVoted(contract, account) {
  const id = await question('\n📝 Enter proposal ID: ');

  const hasVoted = await contract.hasVoted(id, account);
  console.log(`\n${hasVoted ? '✅ You have voted' : '❌ You have not voted'} on proposal #${id}`);
}

// ============================================================================
// Run
// ============================================================================

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
