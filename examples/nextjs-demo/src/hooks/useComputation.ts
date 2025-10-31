/**
 * useComputation Hook
 *
 * Hook for performing homomorphic computations
 */

'use client';

import { useState, useCallback } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';

export type ComputationOperation = 'add' | 'subtract' | 'multiply' | 'compare';

export function useComputation() {
  const { encryptU8, encryptU16, encryptU32, isEncrypting } = useEncrypt();
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const computeEncrypted = useCallback(
    async (
      value1: number,
      value2: number,
      operation: ComputationOperation,
      type: 'u8' | 'u16' | 'u32',
      contractAddress: string
    ) => {
      setIsComputing(true);
      setError(null);

      try {
        // Encrypt both values
        let encrypted1, encrypted2;

        switch (type) {
          case 'u8':
            encrypted1 = await encryptU8(value1, contractAddress);
            encrypted2 = await encryptU8(value2, contractAddress);
            break;
          case 'u16':
            encrypted1 = await encryptU16(value1, contractAddress);
            encrypted2 = await encryptU16(value2, contractAddress);
            break;
          case 'u32':
            encrypted1 = await encryptU32(value1, contractAddress);
            encrypted2 = await encryptU32(value2, contractAddress);
            break;
        }

        // Return encrypted operands
        // In production, these would be sent to a smart contract for computation
        return {
          operation,
          operand1: encrypted1,
          operand2: encrypted2,
          note: `Encrypted values ready for ${operation} operation on smart contract`,
        };
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsComputing(false);
      }
    },
    [encryptU8, encryptU16, encryptU32]
  );

  return {
    computeEncrypted,
    isComputing: isComputing || isEncrypting,
    error,
  };
}
