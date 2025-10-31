/**
 * Vue.js Integration for FHEVM SDK
 *
 * Provides Vue composables and plugins for using FHEVM in Vue applications
 */

import { ref, computed, readonly, inject, provide } from 'vue';
import { FhevmSDK, FhevmConfig, EncryptionResult, DecryptionRequest } from './index';

const FHEVM_INJECTION_KEY = Symbol('fhevm');

export interface UseFhevmReturn {
  isInitialized: Readonly<boolean>;
  error: Readonly<Error | null>;
  sdk: FhevmSDK | null;
  init: (config: FhevmConfig) => Promise<void>;
  reset: () => void;
}

/**
 * Vue composable for FHEVM SDK
 */
export function useFhevm(): UseFhevmReturn {
  const injected = inject<UseFhevmReturn>(FHEVM_INJECTION_KEY);

  if (!injected) {
    throw new Error(
      'useFhevm must be used within a component that has FhevmPlugin installed'
    );
  }

  return injected;
}

/**
 * Vue composable for wallet connection
 */
export function useConnect() {
  const { sdk } = useFhevm();
  const account = ref<string>('');
  const isConnecting = ref(false);
  const error = ref<Error | null>(null);

  const connect = async () => {
    if (!sdk) {
      error.value = new Error('SDK not initialized');
      return;
    }

    isConnecting.value = true;
    error.value = null;

    try {
      await sdk.requestAccounts();
      const address = sdk.getAccount();
      account.value = address || '';
    } catch (err) {
      error.value = err as Error;
    } finally {
      isConnecting.value = false;
    }
  };

  const disconnect = () => {
    account.value = '';
  };

  return {
    account: readonly(account),
    isConnecting: readonly(isConnecting),
    error: readonly(error),
    connect,
    disconnect
  };
}

/**
 * Vue composable for encryption
 */
export function useEncrypt() {
  const { sdk } = useFhevm();
  const isEncrypting = ref(false);
  const error = ref<Error | null>(null);

  const encryptBool = async (value: boolean): Promise<EncryptionResult | null> => {
    if (!sdk) return null;
    isEncrypting.value = true;
    error.value = null;

    try {
      return await sdk.encryptBool(value);
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  const encryptU8 = async (value: number): Promise<EncryptionResult | null> => {
    if (!sdk) return null;
    isEncrypting.value = true;
    error.value = null;

    try {
      return await sdk.encryptU8(value);
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  const encryptU16 = async (value: number): Promise<EncryptionResult | null> => {
    if (!sdk) return null;
    isEncrypting.value = true;
    error.value = null;

    try {
      return await sdk.encryptU16(value);
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  const encryptU32 = async (value: number): Promise<EncryptionResult | null> => {
    if (!sdk) return null;
    isEncrypting.value = true;
    error.value = null;

    try {
      return await sdk.encryptU32(value);
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  return {
    isEncrypting: readonly(isEncrypting),
    error: readonly(error),
    encryptBool,
    encryptU8,
    encryptU16,
    encryptU32
  };
}

/**
 * Vue composable for decryption
 */
export function useDecrypt() {
  const { sdk } = useFhevm();
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);

  const requestDecryption = async (
    contractAddress: string,
    ciphertext: string
  ): Promise<string | null> => {
    if (!sdk) return null;
    isDecrypting.value = true;
    error.value = null;

    try {
      return await sdk.requestDecryption(contractAddress, ciphertext);
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isDecrypting.value = false;
    }
  };

  const publicDecrypt = async (
    contractAddress: string,
    ciphertext: string
  ): Promise<bigint | null> => {
    if (!sdk) return null;
    isDecrypting.value = true;
    error.value = null;

    try {
      return await sdk.publicDecrypt(contractAddress, ciphertext);
    } catch (err) {
      error.value = err as Error;
      return null;
    } finally {
      isDecrypting.value = false;
    }
  };

  return {
    isDecrypting: readonly(isDecrypting),
    error: readonly(error),
    requestDecryption,
    publicDecrypt
  };
}

/**
 * Vue composable for account management
 */
export function useAccount() {
  const { sdk } = useFhevm();
  const account = ref<string>('');

  const getAccount = () => {
    if (!sdk) return '';
    const address = sdk.getAccount();
    account.value = address || '';
    return account.value;
  };

  const address = computed(() => {
    return getAccount();
  });

  return {
    address: readonly(address),
    getAccount
  };
}

/**
 * Vue composable for network management
 */
export function useNetwork() {
  const { sdk } = useFhevm();
  const isSwitching = ref(false);
  const error = ref<Error | null>(null);

  const switchNetwork = async (chainId: number) => {
    if (!sdk) {
      error.value = new Error('SDK not initialized');
      return;
    }

    isSwitching.value = true;
    error.value = null;

    try {
      await sdk.switchNetwork(chainId);
    } catch (err) {
      error.value = err as Error;
    } finally {
      isSwitching.value = false;
    }
  };

  return {
    isSwitching: readonly(isSwitching),
    error: readonly(error),
    switchNetwork
  };
}

/**
 * Vue Plugin for FHEVM SDK
 */
export const FhevmPlugin = {
  install(app: any, config?: FhevmConfig) {
    const isInitialized = ref(false);
    const error = ref<Error | null>(null);
    const sdk = ref<FhevmSDK | null>(null);

    const init = async (initConfig: FhevmConfig) => {
      try {
        const instance = await FhevmSDK.init(initConfig);
        sdk.value = instance;
        isInitialized.value = true;
        error.value = null;
      } catch (err) {
        error.value = err as Error;
        console.error('Failed to initialize FHEVM SDK:', err);
      }
    };

    const reset = () => {
      if (sdk.value) {
        sdk.value.reset();
      }
      sdk.value = null;
      isInitialized.value = false;
      error.value = null;
    };

    const fhevmState: UseFhevmReturn = {
      isInitialized: readonly(isInitialized),
      error: readonly(error),
      sdk: sdk.value,
      init,
      reset
    };

    app.provide(FHEVM_INJECTION_KEY, fhevmState);

    // Auto-initialize if config provided
    if (config) {
      init(config);
    }
  }
};

// Export all composables and types
export {
  FhevmSDK,
  type FhevmConfig,
  type EncryptionResult,
  type DecryptionRequest
};
