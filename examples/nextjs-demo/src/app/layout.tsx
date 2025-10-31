/**
 * Root Layout - Next.js 13+ App Router
 *
 * Wraps the entire application with FHEVM SDK Provider
 */

import { FhevmProvider } from '@fhevm/sdk/react';
import '../styles/globals.css';
import { ReactNode } from 'react';

const fhevmConfig = {
  network: {
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'),
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY',
    gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
  },
  aclAddress: process.env.NEXT_PUBLIC_ACL_ADDRESS,
  kmsVerifierAddress: process.env.NEXT_PUBLIC_KMS_VERIFIER_ADDRESS,
};

export const metadata = {
  title: 'FHEVM SDK Demo - Next.js',
  description: 'Privacy-preserving applications with Zama FHEVM',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <FhevmProvider config={fhevmConfig} autoConnect={true}>
          {children}
        </FhevmProvider>
      </body>
    </html>
  );
}
