/**
 * Type definitions for FHEVM SDK
 */

export interface FhevmConfig {
  network: {
    chainId: number;
    rpcUrl: string;
    gatewayUrl?: string;
  };
  aclAddress?: string;
  kmsVerifierAddress?: string;
}

export interface EncryptionResult {
  data: Uint8Array;
  proof: string;
}

export interface DecryptionRequest {
  contractAddress: string;
  handle: bigint;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  gatewayUrl?: string;
  explorerUrl?: string;
}

export interface ContractConfig {
  address: string;
  abi: any[];
}

// Predefined network configurations
export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  LOCALHOST: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;
