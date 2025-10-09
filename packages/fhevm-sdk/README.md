# @fhevm/sdk

**Universal SDK for building confidential dApps with Zama's FHEVM**

Framework-agnostic, developer-friendly, and wagmi-like API structure.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@fhevm/sdk.svg)](https://www.npmjs.com/package/@fhevm/sdk)

---

## 🌟 Features

- **Framework Agnostic**: Works with React, Vue, Node.js, or any JavaScript environment
- **Wagmi-like API**: Familiar hooks and patterns for web3 developers
- **All-in-One Package**: Wraps all necessary dependencies (fhevmjs, ethers)
- **TypeScript First**: Full type safety and IntelliSense support
- **< 10 Lines to Start**: Minimal setup, maximum productivity
- **Production Ready**: Battle-tested encryption/decryption flows

---

## 📦 Installation

```bash
npm install @fhevm/sdk
# or
yarn add @fhevm/sdk
# or
pnpm add @fhevm/sdk
```

---

## 🚀 Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { createFhevmSDK } from '@fhevm/sdk';

// 1. Create SDK instance
const sdk = createFhevmSDK({
  network: {
    chainId: 11155111, // Sepolia
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY'
  }
});

// 2. Initialize
await sdk.init();

// 3. Encrypt data
const encrypted = await sdk.encryptU8(42, contractAddress);

// 4. Use in contract call
await contract.submitValue(encrypted.data, encrypted.proof);

// 5. Decrypt result
const decrypted = await sdk.requestDecryption(contractAddress, handle);
```

**That's it! 5 simple steps.**

### React

```tsx
import { FhevmProvider, useFhevm, useEncrypt } from '@fhevm/sdk/react';

// 1. Wrap your app
function App() {
  return (
    <FhevmProvider
      config={{
        network: {
          chainId: 11155111,
          rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY'
        }
      }}
    >
      <YourApp />
    </FhevmProvider>
  );
}

// 2. Use hooks in components
function VoteButton() {
  const { isInitialized, account } = useFhevm();
  const { encryptU8, isEncrypting } = useEncrypt();

  const handleVote = async () => {
    const encrypted = await encryptU8(1, contractAddress);
    await contract.vote(encrypted.data, encrypted.proof);
  };

  if (!isInitialized) return <div>Connecting...</div>;

  return (
    <button onClick={handleVote} disabled={isEncrypting}>
      Vote ({account})
    </button>
  );
}
```

---

## 📖 API Reference

### Core SDK

#### `createFhevmSDK(config)`

Create a new SDK instance.

```typescript
const sdk = createFhevmSDK({
  network: {
    chainId: number;
    rpcUrl: string;
    gatewayUrl?: string;
  },
  aclAddress?: string;
  kmsVerifierAddress?: string;
});
```

#### `sdk.init(provider?)`

Initialize the SDK. Must be called before any encryption/decryption operations.

```typescript
await sdk.init();
// or provide custom provider
await sdk.init(customProvider);
```

#### `sdk.encryptBool(value, contractAddress)`

Encrypt a boolean value.

```typescript
const encrypted = await sdk.encryptBool(true, '0x...');
// Returns: { data: Uint8Array, proof: string }
```

#### `sdk.encryptU8(value, contractAddress)`

Encrypt an 8-bit unsigned integer (0-255).

```typescript
const encrypted = await sdk.encryptU8(42, '0x...');
```

#### `sdk.encryptU16(value, contractAddress)`

Encrypt a 16-bit unsigned integer (0-65535).

```typescript
const encrypted = await sdk.encryptU16(1000, '0x...');
```

#### `sdk.encryptU32(value, contractAddress)`

Encrypt a 32-bit unsigned integer.

```typescript
const encrypted = await sdk.encryptU32(1000000, '0x...');
```

#### `sdk.requestDecryption(contractAddress, handle)`

Request decryption with EIP-712 signature (user decryption).

```typescript
const decrypted = await sdk.requestDecryption('0x...', handle);
// Returns: bigint
```

#### `sdk.publicDecrypt(contractAddress, handle)`

Public decryption (for publicly revealed values).

```typescript
const decrypted = await sdk.publicDecrypt('0x...', handle);
```

#### `sdk.getContract(address, abi)`

Get contract instance with connected signer.

```typescript
const contract = sdk.getContract('0x...', abi);
await contract.myFunction();
```

---

### React Hooks

#### `useFhevm()`

Access SDK instance and connection state.

```tsx
const { sdk, isInitialized, account, chainId, error } = useFhevm();
```

#### `useConnect()`

Connect wallet.

```tsx
const { connect, isConnecting, error } = useConnect();

<button onClick={connect} disabled={isConnecting}>
  Connect Wallet
</button>
```

#### `useEncrypt()`

Encrypt values.

```tsx
const { encryptBool, encryptU8, encryptU16, encryptU32, isEncrypting, error } = useEncrypt();

const encrypted = await encryptU8(42, contractAddress);
```

#### `useDecrypt()`

Decrypt values.

```tsx
const { decrypt, publicDecrypt, isDecrypting, error } = useDecrypt();

const decrypted = await decrypt(contractAddress, handle);
```

#### `useContract(address, abi)`

Get contract instance.

```tsx
const contract = useContract('0x...', abi);

await contract.myFunction();
```

#### `useAccount()`

Get current account information.

```tsx
const { address, chainId } = useAccount();
```

#### `useNetwork()`

Switch networks.

```tsx
const { chainId, switchNetwork, isSwitching, error } = useNetwork();

await switchNetwork(11155111); // Switch to Sepolia
```

---

## 🎯 Usage Examples

### Example 1: Encrypted Voting

```typescript
import { createFhevmSDK } from '@fhevm/sdk';

const sdk = createFhevmSDK({ /* config */ });
await sdk.init();

// Encrypt vote (1 = yes, 0 = no)
const encryptedVote = await sdk.encryptU8(1, votingContractAddress);

// Submit vote
const contract = sdk.getContract(votingContractAddress, votingAbi);
await contract.vote(proposalId, encryptedVote.data, encryptedVote.proof);

// After voting ends, decrypt results (admin only)
const yesVotes = await sdk.publicDecrypt(votingContractAddress, yesVotesHandle);
const noVotes = await sdk.publicDecrypt(votingContractAddress, noVotesHandle);
```

### Example 2: Private Auction Bid

```typescript
// Encrypt bid amount
const encryptedBid = await sdk.encryptU32(1000, auctionContractAddress);

// Submit bid
await auctionContract.placeBid(encryptedBid.data, encryptedBid.proof);

// Check if you won (user decryption)
const won = await sdk.requestDecryption(auctionContractAddress, winnerHandle);
```

### Example 3: Confidential Token Balance

```typescript
// Get encrypted balance
const encryptedBalance = await tokenContract.balanceOf(userAddress);

// Decrypt your own balance
const balance = await sdk.requestDecryption(
  tokenContractAddress,
  encryptedBalance
);

console.log(`Your balance: ${balance}`);
```

---

## 🏗️ Architecture

```
@fhevm/sdk
├── Core (framework-agnostic)
│   ├── FhevmSDK class
│   ├── Encryption methods
│   ├── Decryption methods
│   └── Contract interactions
│
├── React Adapter
│   ├── FhevmProvider
│   ├── useFhevm
│   ├── useEncrypt
│   ├── useDecrypt
│   └── useContract
│
└── Vue Adapter (optional)
    └── Similar composables
```

---

## 🔐 Security

### Best Practices

1. **Never decrypt on-chain**: Individual encrypted values should never be decrypted in smart contracts
2. **Use user decryption**: Request user signature (EIP-712) for decrypting their own data
3. **Public decryption carefully**: Only use for aggregated or publicly revealed results
4. **Validate inputs**: Always validate unencrypted values before encryption
5. **Secure RPC**: Use HTTPS RPC endpoints only

### Encryption Flow

```
User Input → Encrypt Client-Side → Submit to Contract → Store Encrypted
                                                              ↓
                                                    Homomorphic Operations
                                                              ↓
Admin/User ← EIP-712 Signature ← Request Decryption ← Aggregate Results
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 📚 Documentation

- **Full API Docs**: [docs/API.md](./docs/API.md)
- **Zama FHEVM**: https://docs.zama.ai/fhevm
- **Examples**: [../../examples](../../examples)

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md).

---

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

## 🙏 Acknowledgments

- **Zama**: For FHEVM technology
- **wagmi**: For API design inspiration
- **Community**: For feedback and contributions

---

## 🔗 Links

- **GitHub**: https://github.com/your-username/fhevm-sdk
- **npm**: https://www.npmjs.com/package/@fhevm/sdk
- **Zama Discord**: https://discord.gg/zama
- **Documentation**: https://docs.zama.ai/fhevm

---

**Built with ❤️ for privacy-preserving applications**
