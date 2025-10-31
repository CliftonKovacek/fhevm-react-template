/**
 * Validation Utilities
 *
 * Input validation and data verification functions
 */

/**
 * Validate contract address
 */
export function validateContractAddress(address: string): {
  valid: boolean;
  error?: string;
} {
  if (!address) {
    return { valid: false, error: 'Contract address is required' };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { valid: false, error: 'Invalid contract address format' };
  }

  return { valid: true };
}

/**
 * Validate encryption value
 */
export function validateEncryptionValue(
  value: string,
  type: 'bool' | 'u8' | 'u16' | 'u32'
): { valid: boolean; error?: string } {
  if (!value && value !== '0') {
    return { valid: false, error: 'Value is required' };
  }

  if (type === 'bool') {
    if (value !== 'true' && value !== 'false') {
      return { valid: false, error: 'Boolean value must be "true" or "false"' };
    }
    return { valid: true };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: 'Value must be a valid number' };
  }

  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Value must be an integer' };
  }

  switch (type) {
    case 'u8':
      if (num < 0 || num > 255) {
        return { valid: false, error: 'Uint8 must be between 0 and 255' };
      }
      break;
    case 'u16':
      if (num < 0 || num > 65535) {
        return { valid: false, error: 'Uint16 must be between 0 and 65535' };
      }
      break;
    case 'u32':
      if (num < 0 || num > 4294967295) {
        return { valid: false, error: 'Uint32 must be between 0 and 4294967295' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Validate chain ID
 */
export function validateChainId(chainId: number): {
  valid: boolean;
  error?: string;
} {
  if (!chainId || chainId <= 0) {
    return { valid: false, error: 'Invalid chain ID' };
  }

  // List of supported chains
  const supportedChains = [1, 11155111, 8009]; // Mainnet, Sepolia, Zama test

  if (!supportedChains.includes(chainId)) {
    return {
      valid: false,
      error: `Chain ID ${chainId} is not supported. Supported chains: ${supportedChains.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate RPC URL
 */
export function validateRpcUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  if (!url) {
    return { valid: false, error: 'RPC URL is required' };
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol)) {
      return { valid: false, error: 'RPC URL must use HTTP, HTTPS, WS, or WSS protocol' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid RPC URL format' };
  }
}
