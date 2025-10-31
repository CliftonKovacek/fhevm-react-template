/**
 * Server-side FHE Operations
 *
 * Utilities for server-side FHE operations in Next.js API routes
 */

import { FhevmSDK, createFhevmSDK } from '@fhevm/sdk';

let serverSDK: FhevmSDK | null = null;

/**
 * Get or create server-side SDK instance
 */
export function getServerSDK(): FhevmSDK {
  if (!serverSDK) {
    serverSDK = createFhevmSDK({
      network: {
        chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'),
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || '',
        gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
      },
      aclAddress: process.env.NEXT_PUBLIC_ACL_ADDRESS,
      kmsVerifierAddress: process.env.NEXT_PUBLIC_KMS_VERIFIER_ADDRESS,
    });
  }

  return serverSDK;
}

/**
 * Initialize server SDK
 */
export async function initServerSDK(): Promise<void> {
  const sdk = getServerSDK();
  if (!sdk.isInitialized()) {
    await sdk.init();
  }
}

/**
 * Encrypt data on server
 */
export async function serverEncrypt(
  value: number | boolean,
  type: 'bool' | 'u8' | 'u16' | 'u32',
  contractAddress: string
) {
  const sdk = getServerSDK();
  await initServerSDK();

  switch (type) {
    case 'bool':
      return sdk.encryptBool(value as boolean, contractAddress);
    case 'u8':
      return sdk.encryptU8(value as number, contractAddress);
    case 'u16':
      return sdk.encryptU16(value as number, contractAddress);
    case 'u32':
      return sdk.encryptU32(value as number, contractAddress);
    default:
      throw new Error(`Invalid encryption type: ${type}`);
  }
}

/**
 * Decrypt data on server (requires proper authorization)
 */
export async function serverDecrypt(
  contractAddress: string,
  handle: bigint
): Promise<bigint> {
  const sdk = getServerSDK();
  await initServerSDK();

  return sdk.publicDecrypt(contractAddress, handle);
}
