/**
 * React hooks and adapters for FHEVM SDK
 *
 * Provides wagmi-like interface for React applications
 */

import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { FhevmSDK, FhevmConfig, EncryptionResult } from './index';

// ============================================================================
// Context
// ============================================================================

interface FhevmContextValue {
  sdk: FhevmSDK | null;
  isInitialized: boolean;
  account: string | null;
  chainId: number | null;
  error: Error | null;
}

const FhevmContext = createContext<FhevmContextValue>({
  sdk: null,
  isInitialized: false,
  account: null,
  chainId: null,
  error: null,
});

// ============================================================================
// Provider Component
// ============================================================================

interface FhevmProviderProps {
  config: FhevmConfig;
  children: ReactNode;
  autoConnect?: boolean;
}

export function FhevmProvider({ config, children, autoConnect = true }: FhevmProviderProps) {
  const [sdk] = useState(() => new FhevmSDK(config));
  const [isInitialized, setIsInitialized] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (autoConnect) {
      sdk.init()
        .then(async () => {
          setIsInitialized(true);
          const acc = await sdk.getAccount();
          setAccount(acc);
          setChainId(config.network.chainId);
        })
        .catch((err) => {
          setError(err);
          console.error('Failed to initialize FHEVM SDK:', err);
        });
    }
  }, [sdk, autoConnect, config.network.chainId]);

  const value: FhevmContextValue = {
    sdk,
    isInitialized,
    account,
    chainId,
    error,
  };

  return <FhevmContext.Provider value={value}>{children}</FhevmContext.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access FHEVM SDK instance and connection state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { sdk, isInitialized, account } = useFhevm();
 *
 *   if (!isInitialized) return <div>Connecting...</div>;
 *
 *   return <div>Connected: {account}</div>;
 * }
 * ```
 */
export function useFhevm() {
  const context = useContext(FhevmContext);
  if (!context) {
    throw new Error('useFhevm must be used within FhevmProvider');
  }
  return context;
}

/**
 * Hook for connecting wallet
 */
export function useConnect() {
  const { sdk } = useFhevm();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(async () => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    setIsConnecting(true);
    setError(null);

    try {
      await sdk.requestAccounts();
      await sdk.init();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [sdk]);

  return { connect, isConnecting, error };
}

/**
 * Hook for encrypting values
 *
 * @example
 * ```tsx
 * function VoteButton() {
 *   const { encryptU8, isEncrypting } = useEncrypt();
 *
 *   const handleVote = async () => {
 *     const encrypted = await encryptU8(1, contractAddress);
 *     // Use encrypted.data and encrypted.proof
 *   };
 *
 *   return <button onClick={handleVote} disabled={isEncrypting}>Vote</button>;
 * }
 * ```
 */
export function useEncrypt() {
  const { sdk, isInitialized } = useFhevm();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encryptBool = useCallback(
    async (value: boolean, contractAddress: string): Promise<EncryptionResult> => {
      if (!isInitialized || !sdk) {
        throw new Error('SDK not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await sdk.encryptBool(value, contractAddress);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsEncrypting(false);
      }
    },
    [sdk, isInitialized]
  );

  const encryptU8 = useCallback(
    async (value: number, contractAddress: string): Promise<EncryptionResult> => {
      if (!isInitialized || !sdk) {
        throw new Error('SDK not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await sdk.encryptU8(value, contractAddress);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsEncrypting(false);
      }
    },
    [sdk, isInitialized]
  );

  const encryptU16 = useCallback(
    async (value: number, contractAddress: string): Promise<EncryptionResult> => {
      if (!isInitialized || !sdk) {
        throw new Error('SDK not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await sdk.encryptU16(value, contractAddress);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsEncrypting(false);
      }
    },
    [sdk, isInitialized]
  );

  const encryptU32 = useCallback(
    async (value: number, contractAddress: string): Promise<EncryptionResult> => {
      if (!isInitialized || !sdk) {
        throw new Error('SDK not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await sdk.encryptU32(value, contractAddress);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsEncrypting(false);
      }
    },
    [sdk, isInitialized]
  );

  return {
    encryptBool,
    encryptU8,
    encryptU16,
    encryptU32,
    isEncrypting,
    error,
  };
}

/**
 * Hook for decrypting values
 */
export function useDecrypt() {
  const { sdk, isInitialized } = useFhevm();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (contractAddress: string, handle: bigint): Promise<bigint> => {
      if (!isInitialized || !sdk) {
        throw new Error('SDK not initialized');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const result = await sdk.requestDecryption(contractAddress, handle);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [sdk, isInitialized]
  );

  const publicDecrypt = useCallback(
    async (contractAddress: string, handle: bigint): Promise<bigint> => {
      if (!isInitialized || !sdk) {
        throw new Error('SDK not initialized');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const result = await sdk.publicDecrypt(contractAddress, handle);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [sdk, isInitialized]
  );

  return {
    decrypt,
    publicDecrypt,
    isDecrypting,
    error,
  };
}

/**
 * Hook for contract interactions
 */
export function useContract(address: string, abi: any[]) {
  const { sdk, isInitialized } = useFhevm();
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    if (isInitialized && sdk) {
      const contractInstance = sdk.getContract(address, abi);
      setContract(contractInstance);
    }
  }, [sdk, isInitialized, address, abi]);

  return contract;
}

/**
 * Hook for getting current account
 */
export function useAccount() {
  const { account, chainId } = useFhevm();
  return { address: account, chainId };
}

/**
 * Hook for network switching
 */
export function useNetwork() {
  const { sdk, chainId } = useFhevm();
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const switchNetwork = useCallback(
    async (newChainId: number) => {
      if (!sdk) {
        throw new Error('SDK not initialized');
      }

      setIsSwitching(true);
      setError(null);

      try {
        await sdk.switchNetwork(newChainId);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsSwitching(false);
      }
    },
    [sdk]
  );

  return {
    chainId,
    switchNetwork,
    isSwitching,
    error,
  };
}
