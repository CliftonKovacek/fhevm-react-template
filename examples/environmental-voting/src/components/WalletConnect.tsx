/**
 * Wallet Connect Component
 */

import './WalletConnect.css';

interface WalletConnectProps {
  onConnect: () => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  return (
    <div className="wallet-connect-section card">
      <h2>Connect Your Wallet</h2>
      <p className="wallet-description">
        Connect your wallet to participate in environmental voting with
        privacy-preserving encryption
      </p>
      <button className="btn btn-connect" onClick={onConnect}>
        Connect Wallet
      </button>
      <div className="features-grid">
        <div className="feature-item">
          <div className="feature-icon">🔒</div>
          <h3>Private</h3>
          <p>Your vote remains encrypted</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🌱</div>
          <h3>Environmental</h3>
          <p>Vote on eco-friendly proposals</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">⚡</div>
          <h3>Fast</h3>
          <p>Quick and easy voting process</p>
        </div>
      </div>
    </div>
  );
}
