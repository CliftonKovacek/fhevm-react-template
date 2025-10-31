# Migration Guide: From fhevmjs to Universal FHEVM SDK

This guide helps you migrate from using fhevmjs directly to the Universal FHEVM SDK.

---

## Why Migrate?

### Benefits of Universal FHEVM SDK

- **10x Less Code:** Reduce boilerplate by 90%
- **Type Safety:** Full TypeScript support with proper types
- **Framework Integration:** React hooks, Vue composables out of the box
- **Better DX:** Wagmi-like API, familiar to web3 developers
- **Error Handling:** Comprehensive error messages and validation
- **Maintenance:** Single package to maintain and update

---

## Before and After Comparison

### Before: Using fhevmjs Directly

```typescript
// ~50 lines of setup
import { createFhevmInstance, initFhevm } from 'fhevmjs';
import { BrowserProvider, Contract } from 'ethers';

// Initialize fhevm
await initFhevm();

// Setup provider
const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const userAddress = await signer.getAddress();

// Create instance with complex config
const instance = await createFhevmInstance({
  chainId: 11155111,
  networkUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  gatewayUrl: 'https://gateway.example.com',
  aclAddress: '0x...',
  kmsVerifierAddress: '0x...',
});

// Manual encryption
const value = 42;
const encrypted = instance.encrypt_uint8(value);

// Generate proof manually
const proof = await instance.generateInputProof(
  encrypted,
  contractAddress,
  userAddress
);

// Setup contract manually
const contract = new Contract(contractAddress, abi, signer);

// Submit
await contract.submitValue(encrypted, proof);

// Decryption (complex EIP-712 flow)
const handle = await contract.getHandle();
const decrypted = await instance.reencrypt(
  handle,
  contractAddress,
  userAddress,
  signer
);
```

### After: Using Universal FHEVM SDK

```typescript
// ~5 lines total
import { createFhevmSDK } from '@fhevm/sdk';

const sdk = createFhevmSDK({
  network: { chainId: 11155111, rpcUrl: 'https://...' }
});

await sdk.init();

const encrypted = await sdk.encryptU8(42, contractAddress);
await contract.submitValue(encrypted.data, encrypted.proof);

const decrypted = await sdk.requestDecryption(contractAddress, handle);
```

**Result: 90% less code, same functionality**

---

## Step-by-Step Migration

### Step 1: Install the SDK

```bash
# Uninstall fhevmjs (keep for now, will remove later)
# npm uninstall fhevmjs

# Install SDK
npm install @fhevm/sdk
```

### Step 2: Replace Initialization

#### Before
```typescript
import { createFhevmInstance, initFhevm } from 'fhevmjs';
import { BrowserProvider } from 'ethers';

await initFhevm();
const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const instance = await createFhevmInstance({
  chainId: 11155111,
  networkUrl: rpcUrl,
  gatewayUrl: gatewayUrl,
  aclAddress: aclAddress,
  kmsVerifierAddress: kmsVerifierAddress,
});
```

#### After
```typescript
import { createFhevmSDK } from '@fhevm/sdk';

const sdk = createFhevmSDK({
  network: {
    chainId: 11155111,
    rpcUrl: rpcUrl,
    gatewayUrl: gatewayUrl, // optional
  },
  aclAddress: aclAddress, // optional
  kmsVerifierAddress: kmsVerifierAddress, // optional
});

await sdk.init(); // Handles provider, signer, and instance creation
```

### Step 3: Replace Encryption

#### Before
```typescript
const encrypted = instance.encrypt_uint8(value);
const proof = await instance.generateInputProof(
  encrypted,
  contractAddress,
  await signer.getAddress()
);

// Use both encrypted and proof
await contract.submitValue(encrypted, proof);
```

#### After
```typescript
const encrypted = await sdk.encryptU8(value, contractAddress);

// encrypted contains both data and proof
await contract.submitValue(encrypted.data, encrypted.proof);
```

### Step 4: Replace Decryption

#### Before
```typescript
const decrypted = await instance.reencrypt(
  handle,
  contractAddress,
  userAddress,
  signer
);
```

#### After
```typescript
const decrypted = await sdk.requestDecryption(contractAddress, handle);
```

### Step 5: Replace Contract Setup

#### Before
```typescript
import { Contract } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new Contract(contractAddress, abi, signer);
```

#### After
```typescript
const contract = sdk.getContract(contractAddress, abi);
```

---

## React Migration

### Before: Manual Context Setup

```tsx
// FhevmContext.tsx (50+ lines)
import { createContext, useContext, useState, useEffect } from 'react';
import { createFhevmInstance, initFhevm } from 'fhevmjs';

const FhevmContext = createContext(null);

export function FhevmProvider({ children }) {
  const [instance, setInstance] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      await initFhevm();
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const fhevmInstance = await createFhevmInstance({
        chainId: 11155111,
        networkUrl: rpcUrl,
        // ... more config
      });

      setInstance(fhevmInstance);
      setIsInitialized(true);
    }

    init();
  }, []);

  return (
    <FhevmContext.Provider value={{ instance, isInitialized }}>
      {children}
    </FhevmContext.Provider>
  );
}

// Component usage
function MyComponent() {
  const { instance, isInitialized } = useContext(FhevmContext);

  const encrypt = async (value) => {
    if (!isInitialized) return;
    const encrypted = instance.encrypt_uint8(value);
    // ... manual proof generation
  };

  return <button onClick={() => encrypt(42)}>Encrypt</button>;
}
```

### After: Built-in Provider and Hooks

```tsx
import { FhevmProvider, useFhevm, useEncrypt } from '@fhevm/sdk/react';

// App wrapper (5 lines)
function App() {
  return (
    <FhevmProvider config={{ network: { chainId: 11155111, rpcUrl: '...' } }}>
      <MyComponent />
    </FhevmProvider>
  );
}

// Component usage
function MyComponent() {
  const { isInitialized } = useFhevm();
  const { encryptU8 } = useEncrypt();

  const encrypt = () => encryptU8(42, contractAddress);

  return <button onClick={encrypt}>Encrypt</button>;
}
```

---

## API Mapping

### Initialization

| fhevmjs | Universal SDK |
|---------|---------------|
| `initFhevm()` | `sdk.init()` |
| `createFhevmInstance(config)` | `createFhevmSDK(config)` |

### Encryption

| fhevmjs | Universal SDK |
|---------|---------------|
| `instance.encrypt_bool(value)` | `sdk.encryptBool(value, address)` |
| `instance.encrypt_uint8(value)` | `sdk.encryptU8(value, address)` |
| `instance.encrypt_uint16(value)` | `sdk.encryptU16(value, address)` |
| `instance.encrypt_uint32(value)` | `sdk.encryptU32(value, address)` |

### Proof Generation

| fhevmjs | Universal SDK |
|---------|---------------|
| `instance.generateInputProof(...)` | Handled automatically in encrypt methods |

### Decryption

| fhevmjs | Universal SDK |
|---------|---------------|
| `instance.reencrypt(...)` | `sdk.requestDecryption(address, handle)` |
| `instance.getPublicValue(...)` | `sdk.publicDecrypt(address, handle)` |

---

## Common Migration Issues

### Issue 1: Missing Proof

**Problem:**
```typescript
const encrypted = instance.encrypt_uint8(42);
// Where's the proof?
```

**Solution:**
```typescript
const encrypted = await sdk.encryptU8(42, contractAddress);
// proof is included: encrypted.proof
```

### Issue 2: Contract Address Required

**Problem:** SDK requires contract address for encryption

**Reason:** This is needed for input proof generation

**Solution:** Always provide the target contract address:
```typescript
const encrypted = await sdk.encryptU8(42, contractAddress);
```

### Issue 3: Provider Access

**Problem:** Need direct access to provider/signer

**Solution:**
```typescript
const provider = sdk.getProvider();
const signer = sdk.getSigner();
const account = await sdk.getAccount();
```

### Issue 4: React Hook Dependencies

**Problem:** Custom hooks depend on fhevmjs instance

**Solution:** Use built-in SDK hooks instead:
```typescript
// Before
const instance = useContext(FhevmContext);

// After
const { sdk } = useFhevm();
```

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Install @fhevm/sdk package
- [ ] Replace initialization code
- [ ] Update all encryption calls
- [ ] Update all decryption calls
- [ ] Replace contract setup
- [ ] Update React components (if using React)
- [ ] Test encryption/decryption flows
- [ ] Remove fhevmjs dependency
- [ ] Update documentation
- [ ] Test in production-like environment

---

## Gradual Migration Strategy

You can migrate gradually:

### Phase 1: Install SDK Alongside fhevmjs
```bash
npm install @fhevm/sdk
# Keep fhevmjs installed
```

### Phase 2: Migrate One Component at a Time
```typescript
// Some components still using fhevmjs
import { instance } from './old-fhevm-setup';

// New components using SDK
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';
```

### Phase 3: Replace All Usage

### Phase 4: Remove fhevmjs
```bash
npm uninstall fhevmjs
```

---

## Need Help?

- **Questions:** Open a GitHub Discussion
- **Issues:** Report bugs on GitHub Issues
- **Chat:** Join Zama Discord
- **Docs:** Check full documentation in README.md

---

**Happy migrating! The new SDK will make your code cleaner and your development faster.**
