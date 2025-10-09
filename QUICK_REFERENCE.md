# 🚀 FHEVM SDK - Quick Reference

**Instant reference for common SDK operations**

---

## 📦 Installation

```bash
npm install @fhevm/sdk
```

---

## 🔧 Setup

### Vanilla JS/TypeScript

```typescript
import { createFhevmSDK } from '@fhevm/sdk';

const sdk = createFhevmSDK({
  network: {
    chainId: 11155111,      // Sepolia testnet
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY'
  }
});

await sdk.init();
```

### React/Next.js

```tsx
import { FhevmProvider } from '@fhevm/sdk/react';

<FhevmProvider
  config={{
    network: {
      chainId: 11155111,
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL
    }
  }}
  autoConnect={true}
>
  <App />
</FhevmProvider>
```

---

## 🔒 Encryption

### Vanilla JS

```typescript
// Encrypt boolean
const encBool = await sdk.encryptBool(true, contractAddress);

// Encrypt 8-bit unsigned integer
const encU8 = await sdk.encryptU8(42, contractAddress);

// Encrypt 16-bit unsigned integer
const encU16 = await sdk.encryptU16(1000, contractAddress);

// Encrypt 32-bit unsigned integer
const encU32 = await sdk.encryptU32(100000, contractAddress);

// Use in contract call
await contract.submitValue(encU8.data, encU8.proof);
```

### React Hooks

```tsx
import { useEncrypt } from '@fhevm/sdk/react';

function VoteButton() {
  const { encryptU8, isEncrypting, error } = useEncrypt();

  const handleVote = async () => {
    const encrypted = await encryptU8(1, contractAddress);
    await contract.vote(encrypted.data, encrypted.proof);
  };

  return (
    <button onClick={handleVote} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Submit Vote'}
    </button>
  );
}
```

---

## 🔓 Decryption

### User Decryption (requires EIP-712 signature)

```typescript
// Vanilla JS
const decrypted = await sdk.requestDecryption(contractAddress, handle);

// React Hook
import { useDecrypt } from '@fhevm/sdk/react';

const { requestDecryption, isDecrypting } = useDecrypt();
const value = await requestDecryption(contractAddress, handle);
```

### Public Decryption (no signature required)

```typescript
// Vanilla JS
const publicValue = await sdk.publicDecrypt(contractAddress, handle);

// React Hook
const { publicDecrypt } = useDecrypt();
const value = await publicDecrypt(contractAddress, handle);
```

---

## 📜 Contract Interaction

### Get Contract Instance

```typescript
// Vanilla JS
const contract = sdk.getContract(address, abi);

// React Hook
import { useContract } from '@fhevm/sdk/react';

const contract = useContract(address, abi);
```

### Common Contract Calls

```typescript
// Read encrypted value
const encryptedBalance = await contract.balanceOf(userAddress);

// Write with encryption
const encrypted = await sdk.encryptU32(amount, contractAddress);
await contract.transfer(recipient, encrypted.data, encrypted.proof);

// Trigger decryption (admin)
await contract.revealResults(proposalId);
```

---

## 👤 Account & Network

### Vanilla JS

```typescript
const account = await sdk.getAccount();
console.log('Connected:', account);
```

### React Hooks

```tsx
import { useAccount, useNetwork, useFhevm } from '@fhevm/sdk/react';

function Dashboard() {
  const { address, isConnected } = useAccount();
  const { chainId } = useNetwork();
  const { isInitialized, error } = useFhevm();

  if (!isInitialized) return <div>Loading SDK...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      Account: {address}
      Network: {chainId}
    </div>
  );
}
```

---

## 🔌 Wallet Connection

### React Hook

```tsx
import { useConnect } from '@fhevm/sdk/react';

function ConnectButton() {
  const { connect, disconnect, isConnecting, isConnected } = useConnect();

  return (
    <button
      onClick={isConnected ? disconnect : connect}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
}
```

---

## 🎯 Common Patterns

### Pattern 1: Encrypted Voting

```typescript
// 1. Encrypt vote (1 = yes, 0 = no)
const voteValue = userChoice === 'yes' ? 1 : 0;
const encrypted = await sdk.encryptU8(voteValue, votingAddress);

// 2. Submit vote
await votingContract.vote(proposalId, encrypted.data, encrypted.proof);

// 3. Reveal results (admin only)
await votingContract.revealResults(proposalId);

// 4. Read public results
const proposal = await votingContract.getProposal(proposalId);
console.log('Yes:', proposal.yesVotes, 'No:', proposal.noVotes);
```

### Pattern 2: Private Auction

```typescript
// 1. Encrypt bid amount
const bidAmount = 1000; // Wei/tokens
const encrypted = await sdk.encryptU32(bidAmount, auctionAddress);

// 2. Place bid
await auctionContract.placeBid(itemId, encrypted.data, encrypted.proof);

// 3. After auction ends, decrypt winner (user signs)
const isWinner = await sdk.requestDecryption(auctionAddress, winnerHandle);

// 4. Or reveal all bids publicly
await auctionContract.revealBids(itemId);
const bids = await auctionContract.getBids(itemId);
```

### Pattern 3: Confidential Token Balance

```typescript
// 1. Get encrypted balance (on-chain)
const encBalanceHandle = await tokenContract.balanceOf(userAddress);

// 2. Decrypt balance (user signs EIP-712)
const balance = await sdk.requestDecryption(tokenContract.address, encBalanceHandle);

console.log('Your balance:', balance);

// 3. Encrypt transfer amount
const encrypted = await sdk.encryptU32(100, tokenContract.address);

// 4. Transfer tokens
await tokenContract.transfer(recipient, encrypted.data, encrypted.proof);
```

---

## 🛠️ Error Handling

### Vanilla JS

```typescript
try {
  const encrypted = await sdk.encryptU8(value, contractAddress);
  await contract.submit(encrypted.data, encrypted.proof);
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    console.log('User rejected transaction');
  } else if (error.message.includes('network')) {
    console.log('Network error, check RPC');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### React Hooks

```tsx
function SmartComponent() {
  const { encryptU8, isEncrypting, error: encryptError } = useEncrypt();
  const [txError, setTxError] = useState(null);

  const handleSubmit = async () => {
    try {
      const encrypted = await encryptU8(value, address);
      const tx = await contract.submit(encrypted.data, encrypted.proof);
      await tx.wait();
    } catch (error) {
      setTxError(error.message);
    }
  };

  return (
    <div>
      {encryptError && <div className="error">Encryption error: {encryptError.message}</div>}
      {txError && <div className="error">Transaction error: {txError}</div>}
      <button onClick={handleSubmit} disabled={isEncrypting}>
        Submit
      </button>
    </div>
  );
}
```

---

## 📊 Type Reference

### Encryption Result

```typescript
interface EncryptionResult {
  data: Uint8Array;  // Encrypted data to pass to contract
  proof: string;     // Zero-knowledge proof
}
```

### SDK Configuration

```typescript
interface FhevmConfig {
  network: {
    chainId: number;           // Network chain ID (11155111 = Sepolia)
    rpcUrl: string;            // RPC endpoint URL
    gatewayUrl?: string;       // Optional gateway URL
  };
  aclAddress?: string;         // Optional ACL contract address
  kmsVerifierAddress?: string; // Optional KMS verifier address
}
```

### FHEVM Solidity Types

```solidity
ebool      // Encrypted boolean
euint8     // Encrypted 8-bit unsigned integer (0-255)
euint16    // Encrypted 16-bit unsigned integer (0-65535)
euint32    // Encrypted 32-bit unsigned integer (0-4294967295)
euint64    // Encrypted 64-bit unsigned integer
```

---

## 🎨 React Hooks Summary

| Hook | Purpose | Returns |
|------|---------|---------|
| `useFhevm()` | Main SDK state | `{ sdk, isInitialized, error, account }` |
| `useConnect()` | Wallet connection | `{ connect, disconnect, isConnecting, isConnected }` |
| `useEncrypt()` | Encryption operations | `{ encryptBool, encryptU8, encryptU16, encryptU32, isEncrypting, error }` |
| `useDecrypt()` | Decryption operations | `{ requestDecryption, publicDecrypt, isDecrypting, error }` |
| `useContract()` | Contract instance | `contract` (ethers Contract) |
| `useAccount()` | Account info | `{ address, isConnected }` |
| `useNetwork()` | Network info | `{ chainId }` |

---

## 🔗 Smart Contract Integration

### Sample FHEVM Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/contracts/TFHE.sol";

contract SecretVoting {
    struct Proposal {
        string title;
        euint8 yesVotes;  // Encrypted yes votes
        euint8 noVotes;   // Encrypted no votes
        bool revealed;
        uint64 finalYes;  // Revealed results
        uint64 finalNo;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    function vote(
        uint256 proposalId,
        einput encryptedVote,
        bytes calldata inputProof
    ) external {
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        // Convert encrypted input to euint8
        euint8 vote = TFHE.asEuint8(encryptedVote, inputProof);

        // Homomorphic addition (encrypted computation!)
        Proposal storage p = proposals[proposalId];
        p.yesVotes = TFHE.add(p.yesVotes, vote);
        p.noVotes = TFHE.add(p.noVotes, TFHE.sub(TFHE.asEuint8(1), vote));

        hasVoted[proposalId][msg.sender] = true;
    }

    function revealResults(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(!p.revealed, "Already revealed");

        // Decrypt results (makes them public)
        p.finalYes = TFHE.decrypt(p.yesVotes);
        p.finalNo = TFHE.decrypt(p.noVotes);
        p.revealed = true;
    }
}
```

### Calling from SDK

```typescript
// Deploy contract
const factory = new ContractFactory(abi, bytecode, signer);
const contract = await factory.deploy();
await contract.waitForDeployment();

// Vote (encrypted)
const voteValue = 1; // Yes
const encrypted = await sdk.encryptU8(voteValue, contract.address);
await contract.vote(0, encrypted.data, encrypted.proof);

// Reveal (admin)
await contract.revealResults(0);

// Read results (public)
const proposal = await contract.proposals(0);
console.log('Yes:', proposal.finalYes, 'No:', proposal.finalNo);
```

---

## 🌐 Deployment Checklist

### 1. Environment Setup

```bash
# .env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...

# Next.js .env.local
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### 2. Deploy Contract

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Verify Contract

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### 4. Deploy Frontend (Vercel)

```bash
npm run build
vercel --prod
```

---

## 📞 Troubleshooting

### "SDK not initialized"
```typescript
// Wait for initialization
const { isInitialized } = useFhevm();
if (!isInitialized) return <div>Loading...</div>;
```

### "User rejected request"
```typescript
// User declined wallet signature
// Handle gracefully, don't retry automatically
```

### "Invalid encrypted input"
```typescript
// Ensure contract address matches encryption
const encrypted = await sdk.encryptU8(value, CONTRACT_ADDRESS);
//                                            ^^^^^^^^^^^^^^^^ Must match!
```

### "Network mismatch"
```typescript
// Verify chainId matches
const config = {
  network: {
    chainId: 11155111,  // Must match MetaMask network
    rpcUrl: '...'
  }
};
```

---

## 🎯 Best Practices

1. **Always validate inputs before encryption**
   ```typescript
   if (value < 0 || value > 255) throw new Error('Invalid u8 value');
   const encrypted = await sdk.encryptU8(value, address);
   ```

2. **Use appropriate integer sizes**
   ```typescript
   // Good
   const age = await sdk.encryptU8(25, address);      // 0-255
   const price = await sdk.encryptU16(1000, address); // 0-65535

   // Bad (wastes gas)
   const age = await sdk.encryptU32(25, address);     // Overkill
   ```

3. **Handle loading states**
   ```tsx
   const { isEncrypting } = useEncrypt();
   return <button disabled={isEncrypting}>Submit</button>;
   ```

4. **Provide user feedback**
   ```tsx
   {isEncrypting && <Spinner />}
   {error && <ErrorMessage>{error.message}</ErrorMessage>}
   ```

5. **Document which values are encrypted**
   ```solidity
   // Good
   euint32 private secretBalance;  // Encrypted, requires user signature to read
   uint256 public totalSupply;     // Public, anyone can read
   ```

---

## 📚 Additional Resources

- [Full Documentation](./packages/fhevm-sdk/README.md)
- [Environmental Voting Example](./examples/environmental-voting/README.md)
- [Next.js Demo Guide](./examples/nextjs-demo/README.md)
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)

---

**💡 Pro Tip**: Start with the environmental-voting example to see a complete real-world implementation!

```bash
cd examples/environmental-voting
npm test              # Run 57+ tests
npm run interact:sdk  # Interactive demo
```
