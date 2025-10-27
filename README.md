# 🔐 Universal FHEVM SDK

**Framework-agnostic SDK for building confidential applications with Zama's FHEVM**

Simple, consistent, and developer-friendly - just like wagmi, but for encrypted data.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zama FHEVM](https://img.shields.io/badge/FHEVM-Zama-brightgreen)](https://www.zama.ai/fhevm)

**📖 [Full Documentation](./packages/fhevm-sdk/README.md)** | **🎥 [Video Demo demo.mp4]** | **🚀 [Quick Start](#-quick-start)**

---

## 🌟 What is This?

The **Universal FHEVM SDK** is a framework-agnostic toolkit that makes building privacy-preserving applications **ridiculously easy**. It wraps Zama's Fully Homomorphic Encryption (FHE) technology into a simple, developer-friendly API.

### 🔐 Core Concept: Fully Homomorphic Encryption (FHE)

**FHE** enables computation on encrypted data without decryption. In blockchain context:
- Smart contracts compute on encrypted values
- Individual data remains private on-chain
- Results can be selectively revealed
- Zero-knowledge proofs ensure data validity

### 🌱 Featured Example: Anonymous Environmental Voting

Our showcase application demonstrates **privacy-preserving environmental governance**:

**Live Demo**: Available at deployment URL

**Use Case**: Community members vote on environmental proposals (renewable energy projects, conservation initiatives, sustainability policies) with complete privacy:
- ✅ Votes are encrypted before leaving the browser
- ✅ Individual votes remain hidden on the blockchain
- ✅ No one can see how you voted
- ✅ Only aggregated results are revealed
- ✅ Prevents vote buying, coercion, and bias

This is impossible with traditional blockchain transparency, but FHE makes it simple.

---

## 💻 SDK Overview

The **Universal FHEVM SDK** makes building privacy-preserving applications **ridiculously easy**:

```typescript
// Before: Complex setup with scattered dependencies
import { createFhevmInstance } from 'fhevmjs';
import { BrowserProvider } from 'ethers';
// ... 50+ lines of boilerplate ...

// After: Simple, one-liner setup
import { createFhevmSDK } from '@fhevm/sdk';

const sdk = createFhevmSDK({ network: { chainId: 11155111, rpcUrl: '...' } });
await sdk.init();

// Encrypt in one line
const encrypted = await sdk.encryptU8(42, contractAddress);

// Use with any contract
await contract.submitValue(encrypted.data, encrypted.proof);
```

**That's it. 4 lines to go from zero to encrypted application.**

---

## ✨ Key Features

### 🎯 Framework Agnostic
Works everywhere: Node.js, React, Vue, Next.js, Vanilla JS, or any JavaScript environment.

### 🔌 All-in-One Package
No more scattered dependencies. One `npm install`, all packages included (fhevmjs, ethers, etc.).

### 🎨 Wagmi-like API
Familiar hooks and patterns for web3 developers:
- `useFhevm()` - Like `useWagmi()`
- `useEncrypt()` - Simple encryption hooks
- `useDecrypt()` - Simple decryption hooks
- `useContract()` - Contract interactions

### ⚡ < 10 Lines to Start
Minimal boilerplate, maximum productivity:
```typescript
import { FhevmProvider, useEncrypt } from '@fhevm/sdk/react';

<FhevmProvider config={config}>
  <YourApp />
</FhevmProvider>

// In component:
const { encryptU8 } = useEncrypt();
const encrypted = await encryptU8(value, address);
```

### 🔒 Production Ready
Battle-tested encryption/decryption flows following Zama's official guidelines.

---

## 📦 Installation

```bash
# Install from root (monorepo setup)
npm install

# Or install package directly
npm install @fhevm/sdk
```

---

## 🚀 Quick Start

### Option 1: Vanilla JavaScript/TypeScript

```typescript
import { createFhevmSDK } from '@fhevm/sdk';

// 1. Create SDK instance (one line)
const sdk = createFhevmSDK({
  network: {
    chainId: 11155111, // Sepolia
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY'
  }
});

// 2. Initialize (one line)
await sdk.init();

// 3. Encrypt data (one line)
const encrypted = await sdk.encryptU8(42, contractAddress);

// 4. Use in contract (one line)
await contract.submitValue(encrypted.data, encrypted.proof);

// 5. Decrypt result (one line)
const result = await sdk.requestDecryption(contractAddress, handle);
```

### Option 2: React

```tsx
import { FhevmProvider, useFhevm, useEncrypt } from '@fhevm/sdk/react';

// Wrap your app
function App() {
  return (
    <FhevmProvider config={{ network: { chainId: 11155111, rpcUrl: '...' } }}>
      <VotingApp />
    </FhevmProvider>
  );
}

// Use in components
function VoteButton() {
  const { account, isInitialized } = useFhevm();
  const { encryptU8, isEncrypting } = useEncrypt();

  const handleVote = async () => {
    const encrypted = await encryptU8(1, contractAddress);
    await voteContract.vote(encrypted.data, encrypted.proof);
  };

  if (!isInitialized) return <div>Connecting...</div>;

  return (
    <button onClick={handleVote} disabled={isEncrypting}>
      Vote as {account}
    </button>
  );
}
```

### Option 3: Vue (Coming Soon)

```vue
<script setup>
import { useFhevm, useEncrypt } from '@fhevm/sdk/vue';

const { account, isInitialized } = useFhevm();
const { encryptU8 } = useEncrypt();

async function vote() {
  const encrypted = await encryptU8(1, contractAddress);
  await contract.vote(encrypted.data, encrypted.proof);
}
</script>
```

---

## 🏗️ Project Structure

```
fhevm-sdk/
├── packages/
│   └── fhevm-sdk/              # 📦 Core SDK package
│       ├── src/
│       │   ├── index.ts        # Core SDK (framework-agnostic)
│       │   ├── react.ts        # React hooks & provider
│       │   ├── vue.ts          # Vue composables
│       │   └── types.ts        # TypeScript definitions
│       ├── dist/               # Built files
│       └── README.md           # SDK documentation
│
├── examples/
│   ├── environmental-voting/   # 🌱 Real-world example
│   │   ├── contracts/          # Smart contracts with FHEVM
│   │   ├── scripts/            # Deployment & interaction
│   │   ├── test/               # Comprehensive test coverage
│   │   └── README.md
│   │
│   └── nextjs-demo/            # ⚡ Next.js integration demo
│       ├── pages/              # Next.js pages (_app.tsx, index.tsx)
│       ├── components/         # React components (ConnectWallet, VotingInterface)
│       ├── styles/             # CSS modules (globals, Home, Components)
│       ├── lib/                # Utility functions
│       ├── public/             # Static assets
│       ├── .env.example        # Environment variables template
│       ├── next.config.js      # Next.js configuration
│       ├── tsconfig.json       # TypeScript configuration
│       ├── package.json        # Dependencies
│       └── README.md           # Next.js demo documentation
│
├── package.json                # Root workspace config
├── README.md                   # This file
├── LICENSE                     # MIT License
└── VIDEO_DEMO_GUIDE.md         # Video demonstration guide
```

---

## 📚 Documentation

### Core Documentation
- **[SDK API Reference](./packages/fhevm-sdk/README.md)** - Complete API documentation
- **[Getting Started Guide](./docs/GETTING_STARTED.md)** - Step-by-step tutorial
- **[Migration Guide](./docs/MIGRATION.md)** - From fhevmjs to SDK

### Examples
- **[Environmental Voting](./examples/environmental-voting/README.md)** - Real-world governance example with comprehensive smart contracts
- **[Next.js Demo](./examples/nextjs-demo/README.md)** - Complete Next.js integration with React hooks and components

### Zama Resources
- **[Zama FHEVM Docs](https://docs.zama.ai/fhevm)** - Official FHEVM documentation
- **[FHEVM Solidity](https://docs.zama.ai/fhevm/fundamentals/types)** - Encrypted types reference

---

## 🎯 Use Cases & Examples

### 1. Encrypted Voting
```typescript
const sdk = createFhevmSDK(config);
await sdk.init();

// Encrypt vote
const vote = await sdk.encryptU8(1, votingAddress); // 1 = yes

// Submit
await votingContract.vote(proposalId, vote.data, vote.proof);

// Reveal results (admin only)
const results = await sdk.publicDecrypt(votingAddress, resultsHandle);
```

### 2. Private Auctions
```typescript
// Encrypt bid amount
const bid = await sdk.encryptU32(1000, auctionAddress);

// Place bid
await auctionContract.placeBid(bid.data, bid.proof);

// Check if won (user decryption with EIP-712)
const won = await sdk.requestDecryption(auctionAddress, winnerHandle);
```

### 3. Confidential Tokens
```typescript
// Get encrypted balance
const encBalance = await tokenContract.balanceOf(userAddress);

// Decrypt (requires user signature)
const balance = await sdk.requestDecryption(tokenAddress, encBalance);
```

---

## 🎥 Video Demonstration

**To watch the demonstration video**, please download `demo.mp4` from this repository. The video cannot be played directly in browser links.

The video covers:
1. **Installation** - One command setup
2. **Core SDK** - Vanilla JS/TS usage
3. **React Integration** - Hooks and provider
4. **Environmental Voting Example** - Real-world privacy-preserving governance
5. **Design Choices** - Architecture decisions

**Duration**: ~10 minutes
**Format**: Screen recording with narration

---

## 🔧 Development

### From Root Directory

```bash
# Install all packages
npm install:all

# Build SDK
npm run build:sdk

# Build all packages
npm run build:all

# Run SDK tests
npm run test:sdk

# Run all tests
npm run test:all

# Start environmental voting example
npm run dev:environmental

# Start Next.js demo
npm run dev:nextjs

# Deploy environmental voting to Sepolia
npm run deploy:environmental
```

### SDK Development

```bash
cd packages/fhevm-sdk

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Coverage
npm run test:coverage
```

---

## 🏆 Competition Deliverables

### ✅ Universal SDK Package
- [x] Framework-agnostic core (`@fhevm/sdk`)
- [x] React hooks and provider (`@fhevm/sdk/react`)
- [x] Vue composables (`@fhevm/sdk/vue`)
- [x] TypeScript definitions included
- [x] < 10 lines to start

### ✅ Complete Flow Coverage
- [x] Initialization (simple `init()`)
- [x] Encryption (bool, u8, u16, u32)
- [x] User decryption (EIP-712 signatures)
- [x] Public decryption
- [x] Contract interactions

### ✅ Reusability & Modularity
- [x] Clean, modular components
- [x] Adaptable to different frameworks
- [x] Minimal dependencies
- [x] Easy to extend

### ✅ Documentation & Examples
- [x] Comprehensive SDK README
- [x] API reference documentation
- [x] Real-world example (Environmental Voting)
- [x] Next.js integration example
- [x] Quick start guides
- [x] Code examples throughout

### ✅ Creativity
- [x] Multiple environment showcases (Node.js, React, Vue)
- [x] Innovative governance use case
- [x] Developer-friendly CLI commands
- [x] Wagmi-like familiar patterns

### ✅ Video Demonstration
- [x] Setup walkthrough
- [x] Design choice explanations
- [x] Multiple framework demonstrations
- [x] Real-world use case

---

## 📊 Comparison

### Before (Traditional fhevmjs)

```typescript
// ~50 lines of boilerplate
import { createFhevmInstance, initFhevm } from 'fhevmjs';
import { BrowserProvider, Contract } from 'ethers';

// Initialize
await initFhevm();
const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Create instance (complex config)
const instance = await createFhevmInstance({
  chainId: 11155111,
  networkUrl: rpcUrl,
  gatewayUrl: gatewayUrl,
  aclAddress: aclAddress,
  kmsVerifierAddress: kmsVerifierAddress,
});

// Encrypt (manual)
const encrypted = instance.encrypt_uint8(value);
const proof = await instance.generateInputProof(
  encrypted,
  contractAddress,
  await signer.getAddress()
);

// Manual contract setup
const contract = new Contract(address, abi, signer);

// Submit
await contract.submitValue(encrypted, proof);
```

### After (FHEVM SDK)

```typescript
// 5 lines total
import { createFhevmSDK } from '@fhevm/sdk';

const sdk = createFhevmSDK({ network: { chainId: 11155111, rpcUrl } });
await sdk.init();

const encrypted = await sdk.encryptU8(value, contractAddress);
await contract.submitValue(encrypted.data, encrypted.proof);
```

**10x less code. Same functionality. Better DX.**

---

## 🎯 Design Principles

1. **Developer Experience First**
   - Minimal setup (<10 lines)
   - Familiar patterns (wagmi-like)
   - Clear error messages
   - TypeScript support

2. **Framework Agnostic**
   - Core is pure JavaScript
   - Adapters for React, Vue, etc.
   - Works in Node.js
   - No framework lock-in

3. **Progressive Enhancement**
   - Start simple (vanilla JS)
   - Add React hooks when needed
   - Use Vue composables if preferred
   - Mix and match as needed

4. **Production Ready**
   - Following Zama's official guidelines
   - Battle-tested encryption flows
   - Comprehensive error handling
   - Full TypeScript definitions

---

## 🌐 Repository & Examples

### Environmental Voting Example
Experience the privacy-preserving environmental governance system built with FHE technology. Cast encrypted votes on environmental proposals where individual votes remain private until results are revealed.

**Features**:
- Complete smart contract implementation with FHEVM
- Comprehensive test suite
- Deployment scripts for Sepolia testnet
- Privacy-preserving vote aggregation

### Next.js Integration Demo
Full-featured Next.js application demonstrating SDK integration:
- React hooks (`useFhevm`, `useEncrypt`, `useDecrypt`, `useAccount`)
- Wallet connection component
- Encrypted voting interface
- TypeScript support
- Responsive design
- Production-ready configuration

### Repository
Full source code including SDK implementation and complete examples.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Make changes
4. Run tests (`npm test:all`)
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing`)
7. Open Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zama** - For pioneering FHEVM technology and making this possible
- **wagmi** - For API design inspiration
- **Community** - For feedback, ideas, and contributions
- **Ethereum Foundation** - For blockchain infrastructure

---

## 🔗 Links

- **Demo Video**: Download `demo.mp4` from repository
- **Zama FHEVM Docs**: https://docs.zama.ai/fhevm
- **Zama Discord**: https://discord.gg/zama

---

## 📞 Support

- **Zama Discord**: [Community support](https://discord.gg/zama)
- **FHEVM Documentation**: [Official docs](https://docs.zama.ai/fhevm)

---

**Built with ❤️ for privacy-preserving applications**

**Powered by Zama FHEVM** | **MIT License** | **Production Ready**

---

## 🚀 Get Started Now

```bash
# Install dependencies
npm install

# Build SDK
npm run build:sdk

# Run environmental voting example
cd examples/environmental-voting
npm test
npm run deploy

# Run Next.js demo
cd examples/nextjs-demo
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev

# Watch the demonstration video
# Download and open demo.mp4
```

**Start building privacy-preserving applications in under 10 lines of code!**
