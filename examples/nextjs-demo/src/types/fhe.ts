/**
 * FHE Type Definitions
 * Core types for Fully Homomorphic Encryption operations
 */

export type FHEDataType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool';

export interface EncryptedData {
  data: Uint8Array;
  type: FHEDataType;
  handle?: string;
}

export interface EncryptionResult {
  encryptedData: EncryptedData;
  proof: Uint8Array;
  publicKey?: string;
}

export interface DecryptionRequest {
  handle: string;
  contractAddress: string;
  userAddress: string;
  signature?: string;
}

export interface DecryptionResult {
  value: number | boolean;
  type: FHEDataType;
}

export interface ComputationRequest {
  operation: 'add' | 'sub' | 'mul' | 'div' | 'compare';
  operands: EncryptedData[];
  resultType: FHEDataType;
}

export interface ComputationResult {
  result: EncryptedData;
  operation: string;
  timestamp: number;
}

export interface FHEKeys {
  publicKey: string;
  privateKey?: string;
  serverKey?: string;
}

export interface FHEConfig {
  networkUrl?: string;
  gatewayUrl?: string;
  chainId?: number;
  aclAddress?: string;
  kmsVerifierAddress?: string;
}

export interface FHEContextValue {
  isInitialized: boolean;
  config: FHEConfig;
  publicKey: string | null;
  error: Error | null;
  initialize: () => Promise<void>;
  encrypt: (value: number, type: FHEDataType) => Promise<EncryptionResult>;
  decrypt: (request: DecryptionRequest) => Promise<DecryptionResult>;
  compute: (request: ComputationRequest) => Promise<ComputationResult>;
}
