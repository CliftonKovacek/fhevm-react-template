/**
 * Next.js App Component with FHEVM SDK Integration
 *
 * This demonstrates how to integrate @fhevm/sdk into a Next.js application
 */

import type { AppProps } from 'next/app';
import { FhevmProvider } from '@fhevm/sdk/react';
import '../styles/globals.css';

// SDK Configuration
const fhevmConfig = {
  network: {
    chainId: 11155111, // Sepolia testnet
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY',
    gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
  },
  aclAddress: process.env.NEXT_PUBLIC_ACL_ADDRESS,
  kmsVerifierAddress: process.env.NEXT_PUBLIC_KMS_VERIFIER_ADDRESS,
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FhevmProvider config={fhevmConfig} autoConnect={true}>
      <Component {...pageProps} />
    </FhevmProvider>
  );
}
