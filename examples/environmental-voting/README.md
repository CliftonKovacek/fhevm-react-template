# Environmental Voting - Example dApp

**Privacy-preserving environmental governance using `@fhevm/sdk`**

This example demonstrates how to use the FHEVM SDK in a real-world voting application.

---

## Features

- ✅ **Encrypted voting using `@fhevm/sdk`** - Complete SDK integration
- ✅ Admin-controlled proposal management
- ✅ Time-bound voting periods
- ✅ Result revelation with aggregated tallies
- ✅ 57+ test cases, 95% coverage
- ✅ **Two interaction modes**: Traditional Hardhat & SDK-based

---

## Quick Start

```bash
# Install dependencies (from root)
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Sepolia
npm run deploy

# Interact with SDK
npm run interact:sdk
```

---

## SDK Integration Example

This example shows how to integrate `@fhevm/sdk` into a Hardhat project.

### Two Interaction Modes

1. **Traditional Mode** (`scripts/interact.js`)
   - Uses Hardhat + direct fhevmjs
   - Run: `npm run interact`

2. **SDK Mode** (`scripts/interact-sdk.js`) ⭐ **Recommended**
   - Uses @fhevm/sdk for simplified interaction
   - Run: `npm run interact:sdk`
   - **Much simpler code!**

### SDK Integration Steps

#### 1. Install SDK

```bash
# Already included in package.json
npm install @fhevm/sdk
```

#### 2. Initialize SDK (scripts/interact-sdk.js)

```javascript
const { createFhevmSDK } = require('@fhevm/sdk');

// Simple one-liner setup
const sdk = createFhevmSDK({
  network: {
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL
  }
});

await sdk.init();
console.log('✅ SDK initialized');
```

#### 3. Encrypt Vote

```javascript
// Get contract
const contract = sdk.getContract(contractAddress, ABI);

// Encrypt vote (1 = yes, 0 = no)
console.log('🔒 Encrypting your vote...');
const encrypted = await sdk.encryptU8(1, contractAddress);

// Submit encrypted vote
await contract.vote(proposalId, encrypted.data, encrypted.proof);
console.log('✅ Vote submitted - fully encrypted!');
```

#### 4. Decrypt Results (Admin only)

```javascript
// Admin reveals results
const tx = await contract.revealResults(proposalId);
await tx.wait();

// Fetch revealed results (now public)
const proposal = await contract.getProposal(proposalId);
console.log(`Yes: ${proposal.yesVotes}`);
console.log(`No: ${proposal.noVotes}`);
```

### Code Comparison

**Before (Traditional):**
```javascript
// ~30 lines of boilerplate
const instance = await createFhevmInstance({...});
const encrypted = instance.encrypt_uint8(value);
const proof = await instance.generateInputProof(...);
// Complex setup, many steps
```

**After (SDK):**
```javascript
// 3 lines total
const sdk = createFhevmSDK(config);
await sdk.init();
const encrypted = await sdk.encryptU8(value, address);
// That's it!
```

**10x simpler!**

---

## Project Structure

```
environmental-voting/
├── contracts/
│   └── EnvironmentalVoting.sol    # Smart contract with FHEVM
├── scripts/
│   ├── deploy.js                  # Deployment script
│   └── interact.js                # SDK integration example
├── test/
│   └── EnvironmentalVoting.test.js
├── hardhat.config.js
├── .env.example
└── README.md
```

---

## Smart Contract

```solidity
// Using FHEVM types
import "@fhevm/solidity/contracts/TFHE.sol";

contract EnvironmentalVoting {
    struct Proposal {
        string title;
        euint8 yesVotes;  // Encrypted yes votes
        euint8 noVotes;   // Encrypted no votes
        // ...
    }

    function vote(
        uint256 proposalId,
        einput encryptedVote,
        bytes calldata inputProof
    ) external {
        euint8 vote = TFHE.asEuint8(encryptedVote, inputProof);
        // Homomorphic addition
        proposal.yesVotes = TFHE.add(proposal.yesVotes, vote);
    }
}
```

---

## Testing

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Expected: 57+ tests passing, 95% coverage
```

---

## Deployment

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your values

# 2. Deploy to Sepolia
npm run deploy

# 3. Verify contract
npm run verify

# 4. Interact with contract
npm run interact
```

---

## Key Learnings

### Using the SDK

1. **Initialization is simple**
   ```javascript
   const sdk = createFhevmSDK(config);
   await sdk.init();
   ```

2. **Encryption is one line**
   ```javascript
   const encrypted = await sdk.encryptU8(value, contractAddress);
   ```

3. **Decryption respects permissions**
   ```javascript
   // User decryption (with signature)
   await sdk.requestDecryption(address, handle);

   // Public decryption (no signature)
   await sdk.publicDecrypt(address, handle);
   ```

### Best Practices

- ✅ Always validate inputs before encryption
- ✅ Use appropriate integer sizes (U8, U16, U32)
- ✅ Handle encryption errors gracefully
- ✅ Test both encrypted and decrypted values
- ✅ Document which values are public vs private

---

## License

MIT License
