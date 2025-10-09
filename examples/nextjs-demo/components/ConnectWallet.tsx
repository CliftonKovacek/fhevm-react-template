/**
 * Connect Wallet Component
 * Demonstrates wallet connection using @fhevm/sdk
 */

import { useConnect } from '@fhevm/sdk/react';
import styles from '../styles/Components.module.css';

export default function ConnectWallet() {
  const { connect, isConnecting, error } = useConnect();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  return (
    <div className={styles.connectCard}>
      <h2>Connect Your Wallet</h2>
      <p>Connect to start voting with encrypted ballots</p>

      {error && (
        <div className={styles.error}>
          {error.message}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={styles.primaryButton}
      >
        {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
      </button>

      <div className={styles.info}>
        <p>✓ MetaMask or compatible wallet required</p>
        <p>✓ Sepolia testnet</p>
        <p>✓ Your votes will be fully encrypted</p>
      </div>
    </div>
  );
}
