/**
 * Security Utilities
 *
 * Helper functions for security operations
 */

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate numeric input for encryption
 */
export function validateNumericInput(
  value: string,
  type: 'u8' | 'u16' | 'u32'
): { valid: boolean; error?: string } {
  const num = parseInt(value);

  if (isNaN(num)) {
    return { valid: false, error: 'Value must be a number' };
  }

  switch (type) {
    case 'u8':
      if (num < 0 || num > 255) {
        return { valid: false, error: 'Value must be between 0 and 255' };
      }
      break;
    case 'u16':
      if (num < 0 || num > 65535) {
        return { valid: false, error: 'Value must be between 0 and 65535' };
      }
      break;
    case 'u32':
      if (num < 0 || num > 4294967295) {
        return { valid: false, error: 'Value must be between 0 and 4294967295' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Generate secure random value
 */
export function generateSecureRandom(bytes: number = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return '0x' + Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash data (simple implementation)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
