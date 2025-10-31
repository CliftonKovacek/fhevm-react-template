/**
 * Create Proposal Component
 */

import { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import './CreateProposal.css';

const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual address
const CONTRACT_ABI = [
  'function createProposal(string memory _title, string memory _description, uint256 _duration) external returns (uint32)',
  'function admin() view returns (address)'
];

interface CreateProposalProps {
  provider: BrowserProvider;
  account: string;
  fhevmInstance: any;
}

export default function CreateProposal({
  provider,
  account,
  fhevmInstance
}: CreateProposalProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('7');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');

  const checkAdmin = async () => {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const adminAddress = await contract.admin();
      setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());
    } catch (err) {
      console.error('Error checking admin:', err);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage('');

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const durationSeconds = parseInt(duration) * 24 * 60 * 60;
      const tx = await contract.createProposal(title, description, durationSeconds);

      setMessage('Creating proposal...');
      await tx.wait();

      setMessage('Proposal created successfully!');
      setTitle('');
      setDescription('');
      setDuration('7');
      setTimeout(() => {
        setShowForm(false);
        setMessage('');
      }, 3000);
    } catch (err: any) {
      setMessage('Error: ' + (err.message || 'Failed to create proposal'));
      console.error('Create proposal error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (!showForm) {
    return (
      <div className="create-proposal-container card">
        <h2>Create New Proposal</h2>
        <p>Start a new environmental voting proposal</p>
        <button
          className="btn"
          onClick={() => {
            checkAdmin();
            setShowForm(true);
          }}
        >
          + Create Proposal
        </button>
      </div>
    );
  }

  return (
    <div className="create-proposal-container card">
      <div className="form-header">
        <h2>New Proposal</h2>
        <button className="close-btn" onClick={() => setShowForm(false)}>
          ✕
        </button>
      </div>

      {!isAdmin && (
        <div className="warning-message">
          ⚠️ You may not have admin permissions to create proposals
        </div>
      )}

      <form onSubmit={handleCreateProposal}>
        <div className="form-group">
          <label htmlFor="title">Proposal Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter proposal title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the proposal details"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (days)</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            max="365"
            required
          />
        </div>

        {message && (
          <div
            className={
              message.includes('Error') ? 'error-message' : 'success-message'
            }
          >
            {message}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowForm(false)}
            disabled={isCreating}
          >
            Cancel
          </button>
          <button type="submit" className="btn" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
}
