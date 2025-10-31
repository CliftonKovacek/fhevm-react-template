/**
 * FHE Provider Component
 *
 * Wrapper component that provides FHE context to child components
 * This is a re-export of the SDK provider for consistency
 */

'use client';

import { FhevmProvider as SDKProvider } from '@fhevm/sdk/react';
import { ReactNode } from 'react';

interface FHEProviderProps {
  children: ReactNode;
  config: any;
  autoConnect?: boolean;
}

export default function FHEProvider({ children, config, autoConnect = true }: FHEProviderProps) {
  return (
    <SDKProvider config={config} autoConnect={autoConnect}>
      {children}
    </SDKProvider>
  );
}
