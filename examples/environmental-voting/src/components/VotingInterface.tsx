/**
 * Voting Interface Component
 */

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import './VotingInterface.css';

const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual address
const CONTRACT_ABI = [
  'function submitVote(uint32 _proposalId, bytes calldata encryptedVote) external',
  'function votes(uint32, address) view returns (bool hasVoted, uint256 timestamp)',
  'function revealResults(uint32 _proposalId) external',
  'function proposals(uint32) view returns (string title, string description, uint256 startTime, uint256 endTime, bool active, bool resultsRevealed, uint32 totalVoters)'
];

interface VotingInterfaceProps {
  provider: BrowserProvider;
  account: string;
  fhevmInstance: any;
  proposalId: number;
}

export default function VotingInterface({
  provider,
  account,
  fhevmInstance,
  proposalId
}: VotingInterfaceProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [message, setMessage] = useState('');
  const [proposalActive, setProposalActive] = useState(false);
  const [resultsRevealed, setResultsRevealed] = useState(false);

  useEffect(() => {
    checkVoteStatus();
    checkProposalStatus();
  }, [proposalId, account]);

  const checkVoteStatus = async () => {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const voteData = await contract.votes(proposalId, account);
      setHasVoted(voteData.hasVoted);
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  };

  const checkProposalStatus = async () => {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const proposal = await contract.proposals(proposalId);
      setProposalActive(proposal.active);
      setResultsRevealed(proposal.resultsRevealed);
    } catch (err) {
      console.error('Error checking proposal status:', err);
    }
  };

  const handleVote = async (voteValue: boolean) => {
    setIsVoting(true);
    setMessage('');

    try {
      // Encrypt the vote using FHEVM
      const encryptedVote = fhevmInstance.encrypt_uint8(voteValue ? 1 : 0);

      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setMessage('Submitting encrypted vote...');
      const tx = await contract.submitVote(proposalId, encryptedVote);

      setMessage('Confirming transaction...');
      await tx.wait();

      setMessage('Vote submitted successfully! ✅');
      setHasVoted(true);

      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      setMessage('Error: ' + (err.message || 'Failed to submit vote'));
      console.error('Vote error:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleRevealResults = async () => {
    setIsRevealing(true);
    setMessage('');

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setMessage('Revealing results...');
      const tx = await contract.revealResults(proposalId);

      await tx.wait();

      setMessage('Results revealed successfully! ✅');
      setResultsRevealed(true);

      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      setMessage('Error: ' + (err.message || 'Failed to reveal results'));
      console.error('Reveal error:', err);
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div className="voting-interface card">
      <h2>Vote on Proposal #{proposalId}</h2>

      {message && (
        <div
          className={
            message.includes('Error') || message.includes('⚠️')
              ? 'error-message'
              : 'success-message'
          }
        >
          {message}
        </div>
      )}

      {!proposalActive ? (
        <div className="info-message">
          ℹ️ This proposal has ended. {resultsRevealed ? 'Results are available below.' : 'Waiting for results to be revealed.'}
        </div>
      ) : hasVoted ? (
        <div className="success-message">
          ✅ You have already voted on this proposal. Thank you for participating!
        </div>
      ) : (
        <div className="vote-section">
          <p className="vote-prompt">Cast your encrypted vote:</p>
          <div className="vote-buttons">
            <button
              className="btn vote-btn btn-yes"
              onClick={() => handleVote(true)}
              disabled={isVoting}
            >
              {isVoting ? '⏳' : '👍'} Yes
            </button>
            <button
              className="btn vote-btn btn-no btn-danger"
              onClick={() => handleVote(false)}
              disabled={isVoting}
            >
              {isVoting ? '⏳' : '👎'} No
            </button>
          </div>
          <p className="vote-privacy-note">
            🔒 Your vote is encrypted using FHE and remains private
          </p>
        </div>
      )}

      {!proposalActive && !resultsRevealed && (
        <div className="reveal-section">
          <p>The voting period has ended. Reveal the results:</p>
          <button
            className="btn btn-secondary"
            onClick={handleRevealResults}
            disabled={isRevealing}
          >
            {isRevealing ? 'Revealing...' : 'Reveal Results'}
          </button>
        </div>
      )}

      {resultsRevealed && (
        <div className="results-section">
          <h3>Results</h3>
          <div className="results-bar">
            <div className="results-bar-label">
              <span>Yes Votes</span>
              <span>0</span>
            </div>
            <div className="results-bar-container">
              <div className="results-bar-fill" style={{ width: '0%' }}>
                0%
              </div>
            </div>
          </div>
          <div className="results-bar">
            <div className="results-bar-label">
              <span>No Votes</span>
              <span>0</span>
            </div>
            <div className="results-bar-container">
              <div
                className="results-bar-fill no-votes"
                style={{ width: '0%' }}
              >
                0%
              </div>
            </div>
          </div>
          <p className="results-note">
            Note: Results are decrypted from FHE-encrypted votes
          </p>
        </div>
      )}
    </div>
  );
}
