/**
 * Home Page - FHEVM SDK Demo
 *
 * Main page showcasing SDK integration with encrypted operations
 */

'use client';

import { useFhevm, useAccount } from '@fhevm/sdk/react';
import ConnectWallet from '../components/ConnectWallet';
import VotingInterface from '../components/VotingInterface';
import EncryptionDemo from '../components/fhe/EncryptionDemo';
import ComputationDemo from '../components/fhe/ComputationDemo';
import styles from '../styles/Home.module.css';

export default function HomePage() {
  const { isInitialized, error: sdkError } = useFhevm();
  const { address } = useAccount();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>FHEVM SDK Demo</h1>
        <p className={styles.subtitle}>
          Privacy-Preserving Applications with Fully Homomorphic Encryption
        </p>
      </header>

      <main className={styles.main}>
        {sdkError && (
          <div className={styles.error}>
            Error initializing SDK: {sdkError.message}
          </div>
        )}

        {!isInitialized ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Initializing FHEVM SDK...</p>
          </div>
        ) : !address ? (
          <div className={styles.section}>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to access encrypted operations</p>
            <ConnectWallet />
          </div>
        ) : (
          <>
            <div className={styles.section}>
              <h2>Encrypted Voting</h2>
              <VotingInterface />
            </div>

            <div className={styles.section}>
              <h2>Encryption Demo</h2>
              <EncryptionDemo />
            </div>

            <div className={styles.section}>
              <h2>Computation Demo</h2>
              <ComputationDemo />
            </div>
          </>
        )}

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>Fast Setup</h3>
            <p>Less than 10 lines of code to integrate FHE</p>
          </div>
          <div className={styles.feature}>
            <h3>Fully Encrypted</h3>
            <p>Compute on encrypted data without decryption</p>
          </div>
          <div className={styles.feature}>
            <h3>Framework Agnostic</h3>
            <p>Works with React, Vue, Next.js, and more</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Built with <a href="https://github.com" target="_blank" rel="noopener noreferrer">@fhevm/sdk</a>
          {' | '}
          Powered by <a href="https://www.zama.ai" target="_blank" rel="noopener noreferrer">Zama FHEVM</a>
        </p>
      </footer>
    </div>
  );
}
