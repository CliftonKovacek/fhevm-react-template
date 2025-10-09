/**
 * Voting Interface Component
 * Demonstrates encryption and contract interaction using @fhevm/sdk
 */

import { useState } from 'react';
import { useAccount, useEncrypt, useContract, useFhevm } from '@fhevm/sdk/react';
import styles from '../styles/Components.module.css';

// Mock contract ABI (replace with actual ABI)
const VOTING_ABI = [
  'function vote(uint256 proposalId, bytes calldata encryptedVote, bytes calldata inputProof) external',
  'function getProposal(uint256 proposalId) external view returns (tuple(string title, string description, uint256 deadline, bool isActive))',
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x...';

export default function VotingInterface() {
  const { address } = useAccount();
  const { sdk } = useFhevm();
  const { encryptU8, isEncrypting } = useEncrypt();
  const contract = useContract(CONTRACT_ADDRESS, VOTING_ABI);

  const [selectedProposal, setSelectedProposal] = useState<number>(1);
  const [voteChoice, setVoteChoice] = useState<'yes' | 'no' | null>(null);
  const [txStatus, setTxStatus] = useState<string>('');

  const handleVote = async () => {
    if (!voteChoice || !contract) {
      setTxStatus('Please select a vote choice');
      return;
    }

    try {
      setTxStatus('Encrypting your vote...');

      // Encrypt vote (1 = yes, 0 = no)
      const voteValue = voteChoice === 'yes' ? 1 : 0;
      const encrypted = await encryptU8(voteValue, CONTRACT_ADDRESS);

      setTxStatus('Submitting encrypted vote to blockchain...');

      // Submit vote to contract
      const tx = await contract.vote(
        selectedProposal,
        encrypted.data,
        encrypted.proof
      );

      setTxStatus('Waiting for confirmation...');
      await tx.wait();

      setTxStatus('✅ Vote submitted successfully! Your vote is encrypted and private.');
      setVoteChoice(null);
    } catch (error: any) {
      console.error('Vote failed:', error);
      setTxStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className={styles.votingCard}>
      <div className={styles.accountInfo}>
        <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
      </div>

      <h2>🗳️ Cast Your Encrypted Vote</h2>

      <div className={styles.proposalSection}>
        <h3>Proposal #{selectedProposal}</h3>
        <p className={styles.proposalTitle}>
          "Reduce Carbon Emissions by 50%"
        </p>
        <p className={styles.proposalDescription}>
          Proposal to implement carbon reduction initiatives over the next 5 years
        </p>
      </div>

      <div className={styles.voteButtons}>
        <button
          className={`${styles.voteButton} ${voteChoice === 'yes' ? styles.selected : ''}`}
          onClick={() => setVoteChoice('yes')}
          disabled={isEncrypting}
        >
          ✓ Vote YES
        </button>
        <button
          className={`${styles.voteButton} ${voteChoice === 'no' ? styles.selected : ''}`}
          onClick={() => setVoteChoice('no')}
          disabled={isEncrypting}
        >
          ✗ Vote NO
        </button>
      </div>

      {voteChoice && (
        <button
          className={styles.submitButton}
          onClick={handleVote}
          disabled={isEncrypting}
        >
          {isEncrypting ? '🔒 Encrypting...' : '📤 Submit Encrypted Vote'}
        </button>
      )}

      {txStatus && (
        <div className={styles.status}>
          {txStatus}
        </div>
      )}

      <div className={styles.privacyInfo}>
        <h4>🔐 Privacy Guarantee</h4>
        <ul>
          <li>✓ Your vote is encrypted client-side before submission</li>
          <li>✓ Individual votes are never revealed on-chain</li>
          <li>✓ Only aggregated results are visible</li>
          <li>✓ Powered by Zama's Fully Homomorphic Encryption</li>
        </ul>
      </div>

      <div className={styles.sdkInfo}>
        <h4>📦 Using @fhevm/sdk</h4>
        <pre>
          <code>{`const { encryptU8 } = useEncrypt();
const encrypted = await encryptU8(
  voteChoice === 'yes' ? 1 : 0,
  contractAddress
);
await contract.vote(
  proposalId,
  encrypted.data,
  encrypted.proof
);`}</code>
        </pre>
      </div>
    </div>
  );
}
