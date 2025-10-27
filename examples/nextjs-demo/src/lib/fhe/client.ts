/**
 * Client-side FHE Operations
 * Handles encryption and FHE operations in the browser
 */

import { createFhevmSDK, FhevmSDK } from '@fhevm/sdk';
import type { EncryptionResult, FHEDataType, FHEConfig } from './types';

let sdkInstance: FhevmSDK | null = null;

/**
 * Initialize the FHEVM SDK
 */
export async function initializeFHEClient(config: FHEConfig): Promise<FhevmSDK> {
  if (sdkInstance) {
    return sdkInstance;
  }

  try {
    sdkInstance = createFhevmSDK({
      network: {
        chainId: config.chainId || 11155111,
        rpcUrl: config.networkUrl || process.env.NEXT_PUBLIC_RPC_URL || '',
        gatewayUrl: config.gatewayUrl,
      },
      aclAddress: config.aclAddress,
      kmsVerifierAddress: config.kmsVerifierAddress,
    });

    await sdkInstance.init();
    return sdkInstance;
  } catch (error) {
    console.error('Failed to initialize FHE client:', error);
    throw new Error('FHE client initialization failed');
  }
}

/**
 * Get the current SDK instance
 */
export function getFHEClient(): FhevmSDK | null {
  return sdkInstance;
}

/**
 * Encrypt a value using the SDK
 */
export async function encryptValue(
  value: number,
  type: FHEDataType,
  contractAddress: string
): Promise<EncryptionResult> {
  const sdk = getFHEClient();
  if (!sdk) {
    throw new Error('FHE client not initialized');
  }

  try {
    let encrypted;
    
    switch (type) {
      case 'euint8':
        encrypted = await sdk.encryptU8(value, contractAddress);
        break;
      case 'euint16':
        encrypted = await sdk.encryptU16(value, contractAddress);
        break;
      case 'euint32':
        encrypted = await sdk.encryptU32(value, contractAddress);
        break;
      case 'ebool':
        encrypted = await sdk.encryptBool(value !== 0, contractAddress);
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    return {
      encryptedData: {
        data: encrypted.data,
        type,
      },
      proof: encrypted.proof,
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt value');
  }
}

/**
 * Request decryption of an encrypted value
 */
export async function requestDecryption(
  contractAddress: string,
  handle: string
): Promise<number | boolean> {
  const sdk = getFHEClient();
  if (!sdk) {
    throw new Error('FHE client not initialized');
  }

  try {
    const result = await sdk.requestDecryption(contractAddress, handle);
    return result;
  } catch (error) {
    console.error('Decryption request failed:', error);
    throw new Error('Failed to request decryption');
  }
}

/**
 * Get public key from the SDK
 */
export function getPublicKey(): string | null {
  const sdk = getFHEClient();
  if (!sdk) {
    return null;
  }
  
  // Return a placeholder - actual implementation depends on SDK
  return 'public-key-placeholder';
}

/**
 * Clean up SDK instance
 */
export function cleanupFHEClient(): void {
  sdkInstance = null;
}
