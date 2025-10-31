# Getting Started with Universal FHEVM SDK

Welcome! This guide will help you get started with the Universal FHEVM SDK in less than 10 minutes.

---

## What You'll Learn

- Installing the SDK
- Basic setup and configuration
- Encrypting your first value
- Integrating with React
- Working with smart contracts

---

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- MetaMask or another Web3 wallet
- Basic knowledge of JavaScript/TypeScript

---

## Installation

### Option 1: Using npm

```bash
npm install @fhevm/sdk
```

### Option 2: Clone from Source

```bash
git clone https://github.com/your-repo/fhevm-sdk.git
cd fhevm-sdk
npm install
npm run build:sdk
```

---

## Quick Start (Vanilla JavaScript)

### Step 1: Import the SDK

```typescript
import { createFhevmSDK } from '@fhevm/sdk';
```

### Step 2: Create SDK Instance

```typescript
const sdk = createFhevmSDK({
  network: {
    chainId: 11155111, // Sepolia testnet
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  },
});
```

### Step 3: Initialize

```typescript
await sdk.init();
console.log('SDK initialized!');
```

### Step 4: Encrypt Data

```typescript
const contractAddress = '0x...'; // Your contract address
const encrypted = await sdk.encryptU8(42, contractAddress);

console.log('Encrypted:', encrypted.data);
console.log('Proof:', encrypted.proof);
```

### Step 5: Use in Contract

```typescript
import { Contract } from 'ethers';

const contract = sdk.getContract(contractAddress, abi);
await contract.submitValue(encrypted.data, encrypted.proof);
```

---

## Quick Start (React)

### Step 1: Install Dependencies

```bash
npm install @fhevm/sdk react react-dom
```

### Step 2: Wrap Your App

```tsx
import { FhevmProvider } from '@fhevm/sdk/react';

function App() {
  const config = {
    network: {
      chainId: 11155111,
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    },
  };

  return (
    <FhevmProvider config={config}>
      <YourApp />
    </FhevmProvider>
  );
}
```

### Step 3: Use Hooks in Components

```tsx
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function VotingComponent() {
  const { isInitialized, account } = useFhevm();
  const { encryptU8, isEncrypting } = useEncrypt();

  const handleVote = async () => {
    const encrypted = await encryptU8(1, contractAddress);
    // Use encrypted.data and encrypted.proof with your contract
  };

  if (!isInitialized) return <div>Initializing...</div>;

  return (
    <button onClick={handleVote} disabled={isEncrypting}>
      Vote
    </button>
  );
}
```

---

## Configuration Options

### Network Configuration

```typescript
const sdk = createFhevmSDK({
  network: {
    chainId: 11155111,           // Required: Chain ID
    rpcUrl: 'https://...',       // Required: RPC endpoint
    gatewayUrl: 'https://...',   // Optional: Gateway URL
  },
  aclAddress: '0x...',           // Optional: ACL contract
  kmsVerifierAddress: '0x...',   // Optional: KMS verifier
});
```

### Supported Networks

| Network | Chain ID | Purpose |
|---------|----------|---------|
| Sepolia | 11155111 | Testing |
| Zama Devnet | 8009 | Development |

---

## Encryption Types

The SDK supports multiple data types:

### Boolean

```typescript
const encrypted = await sdk.encryptBool(true, contractAddress);
```

### Unsigned Integers

```typescript
// 8-bit (0-255)
const u8 = await sdk.encryptU8(42, contractAddress);

// 16-bit (0-65535)
const u16 = await sdk.encryptU16(1000, contractAddress);

// 32-bit (0-4294967295)
const u32 = await sdk.encryptU32(100000, contractAddress);
```

---

## Decryption

### User Decryption (Requires Signature)

```typescript
// Decrypt your own data
const value = await sdk.requestDecryption(
  contractAddress,
  handle // bigint handle from contract
);
```

### Public Decryption

```typescript
// Decrypt publicly revealed data
const value = await sdk.publicDecrypt(
  contractAddress,
  handle
);
```

---

## Working with Contracts

### Get Contract Instance

```typescript
const contract = sdk.getContract(contractAddress, abi);
```

### Submit Encrypted Values

```typescript
// Encrypt value
const encrypted = await sdk.encryptU8(42, contractAddress);

// Send to contract
const tx = await contract.submitValue(
  encrypted.data,
  encrypted.proof
);

await tx.wait();
```

### Read Encrypted Results

```typescript
// Get encrypted handle from contract
const handle = await contract.getResult();

// Decrypt for user
const result = await sdk.requestDecryption(contractAddress, handle);
console.log('Decrypted value:', result);
```

---

## Example: Simple Voting

```typescript
import { createFhevmSDK } from '@fhevm/sdk';
import { Contract } from 'ethers';

// Initialize SDK
const sdk = createFhevmSDK({
  network: {
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  },
});

await sdk.init();

// Setup contract
const votingContract = sdk.getContract(votingAddress, votingABI);

// Cast encrypted vote (1 = yes, 0 = no)
const vote = await sdk.encryptU8(1, votingAddress);

// Submit vote
const tx = await votingContract.vote(
  proposalId,
  vote.data,
  vote.proof
);

await tx.wait();
console.log('Vote cast successfully!');

// Check if you voted (decryption)
const myVoteHandle = await votingContract.getMyVote(proposalId);
const myVote = await sdk.requestDecryption(votingAddress, myVoteHandle);
console.log('My vote:', myVote === 1n ? 'Yes' : 'No');
```

---

## Common Patterns

### Error Handling

```typescript
try {
  const encrypted = await sdk.encryptU8(value, contractAddress);
  await contract.submitValue(encrypted.data, encrypted.proof);
} catch (error) {
  if (error.message.includes('not initialized')) {
    console.error('Please initialize SDK first');
  } else if (error.message.includes('out of range')) {
    console.error('Value must be between 0 and 255');
  } else {
    console.error('Encryption failed:', error);
  }
}
```

### Loading States

```tsx
function EncryptButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { encryptU8 } = useEncrypt();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const encrypted = await encryptU8(42, contractAddress);
      // Use encrypted data...
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Encrypting...' : 'Encrypt'}
    </button>
  );
}
```

---

## Next Steps

Now that you've got the basics:

1. **Explore Examples**
   - Check out `examples/environmental-voting` for a complete app
   - See `examples/nextjs-demo` for React integration

2. **Read API Documentation**
   - See `packages/fhevm-sdk/README.md` for full API reference
   - Check TypeScript definitions for detailed types

3. **Build Your First App**
   - Start with a simple use case
   - Add encryption to existing contracts
   - Experiment with different data types

4. **Join the Community**
   - Zama Discord: https://discord.gg/zama
   - GitHub Discussions: Ask questions and share ideas

---

## Troubleshooting

### SDK Won't Initialize

**Problem:** SDK fails to initialize

**Solutions:**
- Check that MetaMask is installed and unlocked
- Verify RPC URL is correct and accessible
- Ensure chain ID matches your network
- Check browser console for errors

### Encryption Fails

**Problem:** Cannot encrypt values

**Solutions:**
- Verify SDK is initialized (`sdk.isInitialized()`)
- Check value is within valid range for type
- Ensure contract address is valid
- Verify you have network connection

### Decryption Returns Wrong Value

**Problem:** Decrypted value doesn't match expected

**Solutions:**
- Ensure you're using correct handle
- Verify contract address is correct
- Check if value was actually encrypted
- Confirm you have permission to decrypt

---

## Resources

- **Full Documentation:** See main README.md
- **API Reference:** packages/fhevm-sdk/README.md
- **Examples:** examples/ directory
- **Zama Docs:** https://docs.zama.ai/fhevm
- **Community:** https://discord.gg/zama

---

**Ready to build privacy-preserving applications? Start coding!**
