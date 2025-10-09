/**
 * @fhevm/sdk - Universal FHEVM SDK
 *
 * Framework-agnostic SDK for building confidential dApps with Zama's FHEVM.
 * Provides simple APIs for initialization, encryption, and decryption.
 */

import { BrowserProvider, Contract, Signer } from 'ethers';
import { createInstance, FhevmInstance, initFhevm } from 'fhevmjs';

// ============================================================================
// Types & Interfaces
// ============================================================================

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

export interface FhevmContext {
  instance: FhevmInstance;
  signer: Signer;
  provider: BrowserProvider;
  config: FhevmConfig;
}

// ============================================================================
// Core SDK Class
// ============================================================================

export class FhevmSDK {
  private instance: FhevmInstance | null = null;
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private config: FhevmConfig;
  private initialized: boolean = false;

  constructor(config: FhevmConfig) {
    this.config = config;
  }

  /**
   * Initialize the FHEVM SDK
   * Must be called before any encryption/decryption operations
   */
  async init(provider?: BrowserProvider): Promise<void> {
    if (this.initialized) {
      console.warn('FHEVM SDK already initialized');
      return;
    }

    try {
      // Initialize fhevmjs
      await initFhevm();

      // Set up provider
      if (provider) {
        this.provider = provider;
      } else if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.provider = new BrowserProvider((window as any).ethereum);
      } else {
        throw new Error('No Web3 provider found. Please provide a provider or install MetaMask.');
      }

      // Get signer
      this.signer = await this.provider.getSigner();

      // Create FHEVM instance
      this.instance = await createInstance({
        chainId: this.config.network.chainId,
        networkUrl: this.config.network.rpcUrl,
        gatewayUrl: this.config.network.gatewayUrl,
        aclAddress: this.config.aclAddress,
        kmsVerifierAddress: this.config.kmsVerifierAddress,
      });

      this.initialized = true;
      console.log('✅ FHEVM SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize FHEVM SDK:', error);
      throw error;
    }
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the FHEVM instance
   */
  getInstance(): FhevmInstance {
    this.ensureInitialized();
    return this.instance!;
  }

  /**
   * Get the provider
   */
  getProvider(): BrowserProvider {
    this.ensureInitialized();
    return this.provider!;
  }

  /**
   * Get the signer
   */
  getSigner(): Signer {
    this.ensureInitialized();
    return this.signer!;
  }

  /**
   * Encrypt a boolean value
   */
  async encryptBool(value: boolean, contractAddress: string): Promise<EncryptionResult> {
    this.ensureInitialized();

    const encrypted = this.instance!.encrypt_bool(value);
    const inputProof = await this.instance!.generateInputProof(
      encrypted,
      contractAddress,
      await this.signer!.getAddress()
    );

    return {
      data: encrypted,
      proof: inputProof,
    };
  }

  /**
   * Encrypt an 8-bit unsigned integer
   */
  async encryptU8(value: number, contractAddress: string): Promise<EncryptionResult> {
    this.ensureInitialized();

    if (value < 0 || value > 255) {
      throw new Error('Value must be between 0 and 255 for uint8');
    }

    const encrypted = this.instance!.encrypt_uint8(value);
    const inputProof = await this.instance!.generateInputProof(
      encrypted,
      contractAddress,
      await this.signer!.getAddress()
    );

    return {
      data: encrypted,
      proof: inputProof,
    };
  }

  /**
   * Encrypt a 16-bit unsigned integer
   */
  async encryptU16(value: number, contractAddress: string): Promise<EncryptionResult> {
    this.ensureInitialized();

    if (value < 0 || value > 65535) {
      throw new Error('Value must be between 0 and 65535 for uint16');
    }

    const encrypted = this.instance!.encrypt_uint16(value);
    const inputProof = await this.instance!.generateInputProof(
      encrypted,
      contractAddress,
      await this.signer!.getAddress()
    );

    return {
      data: encrypted,
      proof: inputProof,
    };
  }

  /**
   * Encrypt a 32-bit unsigned integer
   */
  async encryptU32(value: number, contractAddress: string): Promise<EncryptionResult> {
    this.ensureInitialized();

    if (value < 0 || value > 4294967295) {
      throw new Error('Value must be between 0 and 4294967295 for uint32');
    }

    const encrypted = this.instance!.encrypt_uint32(value);
    const inputProof = await this.instance!.generateInputProof(
      encrypted,
      contractAddress,
      await this.signer!.getAddress()
    );

    return {
      data: encrypted,
      proof: inputProof,
    };
  }

  /**
   * Request decryption of an encrypted value (user decryption with EIP-712)
   */
  async requestDecryption(
    contractAddress: string,
    handle: bigint
  ): Promise<bigint> {
    this.ensureInitialized();

    try {
      // Generate EIP-712 signature for decryption
      const userAddress = await this.signer!.getAddress();
      const decryptionRequest = {
        contractAddress,
        handle: handle.toString(),
        userAddress,
      };

      // Request decryption through gateway
      const result = await this.instance!.reencrypt(
        handle,
        contractAddress,
        userAddress,
        this.signer!
      );

      return BigInt(result);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  /**
   * Public decryption (for publicly revealed values)
   */
  async publicDecrypt(
    contractAddress: string,
    handle: bigint
  ): Promise<bigint> {
    this.ensureInitialized();

    try {
      // For public decryption, no signature required
      const result = await this.instance!.getPublicValue(
        handle,
        contractAddress
      );

      return BigInt(result);
    } catch (error) {
      console.error('Public decryption failed:', error);
      throw error;
    }
  }

  /**
   * Get contract instance with signer
   */
  getContract(address: string, abi: any): Contract {
    this.ensureInitialized();
    return new Contract(address, abi, this.signer!);
  }

  /**
   * Request wallet connection
   */
  async requestAccounts(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const accounts = await this.provider.send('eth_requestAccounts', []);
      return accounts;
    } catch (error) {
      console.error('Failed to request accounts:', error);
      throw error;
    }
  }

  /**
   * Get current connected account
   */
  async getAccount(): Promise<string> {
    this.ensureInitialized();
    return await this.signer!.getAddress();
  }

  /**
   * Switch network
   */
  async switchNetwork(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${chainId.toString(16)}` }
      ]);
      this.config.network.chainId = chainId;
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        throw new Error('Network not added to wallet. Please add it manually.');
      }
      throw error;
    }
  }

  /**
   * Reset SDK state
   */
  reset(): void {
    this.instance = null;
    this.provider = null;
    this.signer = null;
    this.initialized = false;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private ensureInitialized(): void {
    if (!this.initialized || !this.instance) {
      throw new Error('FHEVM SDK not initialized. Call init() first.');
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new FHEVM SDK instance
 *
 * @example
 * ```typescript
 * const sdk = createFhevmSDK({
 *   network: {
 *     chainId: 11155111,
 *     rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY'
 *   }
 * });
 *
 * await sdk.init();
 * const encrypted = await sdk.encryptU8(42, contractAddress);
 * ```
 */
export function createFhevmSDK(config: FhevmConfig): FhevmSDK {
  return new FhevmSDK(config);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if MetaMask is installed
 */
export function hasMetaMask(): boolean {
  return isBrowser() && typeof (window as any).ethereum !== 'undefined';
}

// ============================================================================
// Exports
// ============================================================================

export * from './types';
export { FhevmSDK as default };
