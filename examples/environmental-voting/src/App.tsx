/**
 * Environmental Voting App - React Version
 *
 * Privacy-preserving voting platform using FHEVM
 */

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { createInstance } from '@fhevm/sdk';
import Header from './components/Header';
import WalletConnect from './components/WalletConnect';
import ProposalList from './components/ProposalList';
import CreateProposal from './components/CreateProposal';
import VotingInterface from './components/VotingInterface';
import './App.css';

export default function App() {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask to use this application');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const ethersProvider = new BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
      setAccount(accounts[0]);

      // Initialize FHEVM instance
      await initializeFhevm(ethersProvider);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    }
  };

  const initializeFhevm = async (ethersProvider: BrowserProvider) => {
    setIsInitializing(true);
    try {
      const network = await ethersProvider.getNetwork();
      const chainId = Number(network.chainId);

      const instance = await createInstance({
        chainId,
        provider: ethersProvider
      });

      setFhevmInstance(instance);
      setError('');
    } catch (err: any) {
      setError('Failed to initialize FHEVM: ' + err.message);
      console.error('FHEVM initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount('');
          setProvider(null);
          setFhevmInstance(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div className="app">
      <Header />

      <div className="container">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {!account ? (
          <WalletConnect onConnect={connectWallet} />
        ) : isInitializing ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Initializing FHEVM...</p>
          </div>
        ) : !fhevmInstance ? (
          <div className="card">
            <h2>Initialization Failed</h2>
            <p>Please refresh the page and try again.</p>
            <button className="btn" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        ) : (
          <>
            <div className="wallet-info card">
              <p>
                <strong>Connected:</strong>{' '}
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>

            <CreateProposal
              provider={provider!}
              account={account}
              fhevmInstance={fhevmInstance}
            />

            <ProposalList
              provider={provider!}
              account={account}
              fhevmInstance={fhevmInstance}
              onSelectProposal={setSelectedProposal}
              selectedProposal={selectedProposal}
            />

            {selectedProposal !== null && (
              <VotingInterface
                provider={provider!}
                account={account}
                fhevmInstance={fhevmInstance}
                proposalId={selectedProposal}
              />
            )}
          </>
        )}
      </div>

      <footer className="footer">
        <p>
          Built with{' '}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            @fhevm/sdk
          </a>
          {' | '}
          Powered by{' '}
          <a
            href="https://www.zama.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zama FHEVM
          </a>
        </p>
      </footer>
    </div>
  );
}
