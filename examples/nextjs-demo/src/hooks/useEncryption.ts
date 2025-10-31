/**
 * useEncryption Hook
 *
 * Enhanced encryption hook with additional features
 */

'use client';

import { useState, useCallback } from 'react';
import { useEncrypt as useSDKEncrypt } from '@fhevm/sdk/react';
import { validateEncryptionValue, validateContractAddress } from '../lib/utils/validation';

export function useEncryption() {
  const { encryptBool, encryptU8, encryptU16, encryptU32, isEncrypting, error } = useSDKEncrypt();
  const [validationError, setValidationError] = useState<string | null>(null);

  const encryptWithValidation = useCallback(
    async (
      value: string,
      type: 'bool' | 'u8' | 'u16' | 'u32',
      contractAddress: string
    ) => {
      setValidationError(null);

      // Validate contract address
      const addressValidation = validateContractAddress(contractAddress);
      if (!addressValidation.valid) {
        setValidationError(addressValidation.error || 'Invalid contract address');
        throw new Error(addressValidation.error);
      }

      // Validate value
      const valueValidation = validateEncryptionValue(value, type);
      if (!valueValidation.valid) {
        setValidationError(valueValidation.error || 'Invalid value');
        throw new Error(valueValidation.error);
      }

      // Perform encryption
      try {
        switch (type) {
          case 'bool':
            return await encryptBool(value === 'true', contractAddress);
          case 'u8':
            return await encryptU8(parseInt(value), contractAddress);
          case 'u16':
            return await encryptU16(parseInt(value), contractAddress);
          case 'u32':
            return await encryptU32(parseInt(value), contractAddress);
        }
      } catch (err: any) {
        setValidationError(err.message);
        throw err;
      }
    },
    [encryptBool, encryptU8, encryptU16, encryptU32]
  );

  return {
    encryptBool,
    encryptU8,
    encryptU16,
    encryptU32,
    encryptWithValidation,
    isEncrypting,
    error: error || validationError,
  };
}
