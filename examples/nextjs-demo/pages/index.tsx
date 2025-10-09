/**
 * Next.js Home Page - FHEVM SDK Demo
 *
 * Demonstrates encrypted voting using @fhevm/sdk
 */

import { useState } from 'react';
import { useFhevm, useEncrypt, useDecrypt, useAccount } from '@fhevm/sdk/react';
import ConnectWallet from '../components/ConnectWallet';
import VotingInterface from '../components/VotingInterface';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { isInitialized, error: sdkError } = useFhevm();
  const { address } = useAccount();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          🔐 FHEVM SDK Demo
        </h1>

        <p className={styles.description}>
          Privacy-Preserving Voting powered by{' '}
          <a href="https://www.zama.ai/fhevm" target="_blank" rel="noopener noreferrer">
            Zama FHEVM
          </a>
        </p>

        {sdkError && (
          <div className={styles.error}>
            ❌ Error: {sdkError.message}
          </div>
        )}

        {!isInitialized ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Initializing FHEVM SDK...</p>
          </div>
        ) : !address ? (
          <ConnectWallet />
        ) : (
          <VotingInterface />
        )}

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>⚡ Fast Setup</h3>
            <p>Less than 10 lines of code to start</p>
          </div>
          <div className={styles.feature}>
            <h3>🔒 Fully Encrypted</h3>
            <p>Votes remain private using FHE</p>
          </div>
          <div className={styles.feature}>
            <h3>🎯 Easy to Use</h3>
            <p>Wagmi-like hooks for React</p>
          </div>
        </div>

        <div className={styles.codeExample}>
          <h3>📝 Code Example</h3>
          <pre>
            <code>{`import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function VoteButton() {
  const { isInitialized } = useFhevm();
  const { encryptU8 } = useEncrypt();

  const handleVote = async () => {
    // Encrypt vote (1 = yes, 0 = no)
    const encrypted = await encryptU8(1, contractAddress);

    // Submit to contract
    await contract.vote(encrypted.data, encrypted.proof);
  };

  return <button onClick={handleVote}>Vote</button>;
}`}</code>
          </pre>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Built with{' '}
          <a href="https://github.com/your-repo/fhevm-sdk" target="_blank" rel="noopener noreferrer">
            @fhevm/sdk
          </a>
          {' '}| Powered by{' '}
          <a href="https://www.zama.ai" target="_blank" rel="noopener noreferrer">
            Zama
          </a>
        </p>
      </footer>
    </div>
  );
}
