/**
 * Proposal List Component
 */

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import './ProposalList.css';

const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual address
const CONTRACT_ABI = [
  'function currentProposalId() view returns (uint32)',
  'function proposals(uint32) view returns (string title, string description, uint256 startTime, uint256 endTime, bool active, bool resultsRevealed, uint32 totalVoters)',
  'event ProposalCreated(uint32 indexed proposalId, string title, uint256 startTime, uint256 endTime)'
];

interface Proposal {
  id: number;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  active: boolean;
  resultsRevealed: boolean;
  totalVoters: number;
}

interface ProposalListProps {
  provider: BrowserProvider;
  account: string;
  fhevmInstance: any;
  onSelectProposal: (id: number) => void;
  selectedProposal: number | null;
}

export default function ProposalList({
  provider,
  account,
  fhevmInstance,
  onSelectProposal,
  selectedProposal
}: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProposals();
  }, [provider]);

  const loadProposals = async () => {
    setIsLoading(true);
    setError('');

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const currentId = await contract.currentProposalId();

      const proposalPromises = [];
      for (let i = 1; i <= currentId; i++) {
        proposalPromises.push(contract.proposals(i));
      }

      const proposalData = await Promise.all(proposalPromises);

      const loadedProposals: Proposal[] = proposalData.map((p, index) => ({
        id: index + 1,
        title: p.title,
        description: p.description,
        startTime: Number(p.startTime),
        endTime: Number(p.endTime),
        active: p.active,
        resultsRevealed: p.resultsRevealed,
        totalVoters: Number(p.totalVoters)
      }));

      setProposals(loadedProposals);
    } catch (err: any) {
      setError('Failed to load proposals: ' + err.message);
      console.error('Load proposals error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  if (isLoading) {
    return (
      <div className="proposals-section card">
        <h2>Active Proposals</h2>
        <div className="loading-proposals">
          <div className="spinner"></div>
          <p>Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="proposals-section card">
        <h2>Active Proposals</h2>
        <div className="error-message">{error}</div>
        <button className="btn" onClick={loadProposals}>
          Retry
        </button>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="proposals-section card">
        <h2>Active Proposals</h2>
        <p className="no-proposals">
          No proposals yet. Create the first proposal to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="proposals-section card">
      <div className="proposals-header">
        <h2>Active Proposals</h2>
        <button className="btn-refresh" onClick={loadProposals}>
          🔄 Refresh
        </button>
      </div>

      <div className="proposals-list">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className={`proposal-card ${
              selectedProposal === proposal.id ? 'selected' : ''
            }`}
            onClick={() => onSelectProposal(proposal.id)}
          >
            <div className="proposal-header">
              <div>
                <h3 className="proposal-title">{proposal.title}</h3>
                <p className="proposal-id">Proposal #{proposal.id}</p>
              </div>
              <span
                className={`proposal-status ${
                  proposal.active ? 'status-active' : 'status-ended'
                }`}
              >
                {proposal.active ? 'Active' : 'Ended'}
              </span>
            </div>

            <p className="proposal-description">{proposal.description}</p>

            <div className="proposal-meta">
              <div>
                <strong>📅 Ends:</strong> {formatDate(proposal.endTime)}
              </div>
              <div>
                <strong>⏰</strong> {formatTimeRemaining(proposal.endTime)}
              </div>
              <div>
                <strong>👥 Voters:</strong> {proposal.totalVoters}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
