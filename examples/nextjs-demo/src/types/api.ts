/**
 * API Type Definitions
 * Types for API requests and responses
 */

import { EncryptedData, FHEDataType, DecryptionRequest } from './fhe';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface EncryptRequest {
  value: number;
  type: FHEDataType;
  contractAddress?: string;
}

export interface EncryptResponse {
  encryptedData: string;
  proof: string;
  type: FHEDataType;
}

export interface DecryptResponse {
  value: number | boolean;
  type: FHEDataType;
}

export interface ComputeRequest {
  operation: 'add' | 'sub' | 'mul' | 'div' | 'compare';
  operands: string[];
  resultType: FHEDataType;
}

export interface ComputeResponse {
  result: string;
  operation: string;
}

export interface KeysResponse {
  publicKey: string;
  algorithm: string;
  created: number;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}
