# Video Demonstration Guide

## Overview

This guide outlines the content and structure for the video demonstration of the Universal FHEVM SDK.

**Duration:** 8-10 minutes
**Format:** Screen recording with narration
**File:** demo.mp4 (included in repository)

---

## Video Structure

### 1. Introduction (1 minute)

**Content:**
- Welcome and project overview
- What is FHEVM and why it matters
- Brief explanation of Fully Homomorphic Encryption
- What problems the SDK solves

**Key Points:**
- Privacy-preserving computation on blockchain
- Framework-agnostic SDK design
- Developer-friendly API similar to wagmi
- Less than 10 lines to get started

---

### 2. Installation & Setup (1.5 minutes)

**Demonstration:**
```bash
# Clone repository
git clone https://github.com/your-repo/fhevm-sdk.git
cd fhevm-sdk

# Install dependencies
npm install

# Build SDK
npm run build:sdk
```

**Show:**
- Clean monorepo structure
- Package organization
- Quick installation process

---

### 3. Core SDK Usage (2 minutes)

**Show Code Example:**

```typescript
import { createFhevmSDK } from '@fhevm/sdk';

// Simple initialization
const sdk = createFhevmSDK({
  network: {
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY'
  }
});

await sdk.init();

// Encrypt data
const encrypted = await sdk.encryptU8(42, contractAddress);

// Use in contract
await contract.submitValue(encrypted.data, encrypted.proof);

// Decrypt result
const result = await sdk.requestDecryption(contractAddress, handle);
```

**Demonstrate:**
- Simple API design
- One-line operations
- Type safety with TypeScript
- Error handling

---

### 4. React Integration (1.5 minutes)

**Show Next.js Demo:**

```tsx
import { FhevmProvider, useFhevm, useEncrypt } from '@fhevm/sdk/react';

function App() {
  return (
    <FhevmProvider config={config}>
      <VotingApp />
    </FhevmProvider>
  );
}

function VoteButton() {
  const { isInitialized } = useFhevm();
  const { encryptU8 } = useEncrypt();

  const handleVote = async () => {
    const encrypted = await encryptU8(1, contractAddress);
    await contract.vote(encrypted.data, encrypted.proof);
  };

  return <button onClick={handleVote}>Vote</button>;
}
```

**Demonstrate:**
- Wagmi-like hooks API
- Provider pattern
- Component integration
- Real-time encryption

---

### 5. Environmental Voting Example (2 minutes)

**Live Demo:**
- Navigate to environmental voting example
- Show the UI
- Connect wallet
- Cast encrypted vote
- Demonstrate privacy features:
  - Vote is encrypted before leaving browser
  - Individual votes hidden on blockchain
  - Only aggregated results visible
  - No one can see how you voted

**Explain:**
- Real-world use case
- Smart contract integration
- Privacy benefits
- Practical application

---

### 6. Design Choices & Architecture (1.5 minutes)

**Explain Key Decisions:**

1. **Framework Agnostic Core**
   - Pure TypeScript core
   - Separate adapters for React, Vue
   - Works in Node.js and browser

2. **Minimal Dependencies**
   - All FHE dependencies bundled
   - Single npm install
   - No version conflicts

3. **Wagmi-like API**
   - Familiar patterns for web3 devs
   - Hooks-based React integration
   - Consistent naming conventions

4. **Type Safety**
   - Full TypeScript support
   - Proper type inference
   - IntelliSense support

**Show Code Structure:**
```
packages/fhevm-sdk/
├── src/
│   ├── index.ts      # Core SDK (framework-agnostic)
│   ├── react.ts      # React hooks
│   ├── vue.ts        # Vue composables
│   └── types.ts      # TypeScript definitions
```

---

### 7. Additional Features (30 seconds)

**Quick Overview:**
- Multiple framework support (React, Vue, vanilla JS)
- Encryption/decryption for all FHE types (bool, u8, u16, u32)
- EIP-712 signature support
- Contract interaction utilities
- Network switching
- Comprehensive error handling

---

### 8. Conclusion & Next Steps (30 seconds)

**Wrap Up:**
- Summary of key benefits
- Where to find documentation
- How to get started
- Community resources

**Resources:**
- Documentation: See README.md
- Examples: Check examples/ directory
- Support: Zama Discord community
- Repository: GitHub link

---

## Recording Tips

### Technical Setup
- Use high-quality screen recording (1080p minimum)
- Clear audio with minimal background noise
- Show terminal and code editor side-by-side when possible
- Use zoom for important code sections

### Presentation Style
- Speak clearly and at moderate pace
- Explain technical concepts simply
- Highlight key features and benefits
- Show enthusiasm for the technology

### Editing
- Add captions for key features
- Highlight important code sections
- Include timestamps in video description
- Keep transitions smooth

---

## Viewing the Demo

**To watch the demonstration video**, download `demo.mp4` from the repository root. The video cannot be streamed directly from GitHub due to file size restrictions.

**Alternative:** If you prefer, the video may also be available on YouTube or another streaming platform. Check the repository README for updated links.

---

## Questions Addressed in Video

The demonstration answers these key questions:

1. How easy is it to integrate FHEVM into an application?
2. What does the developer experience look like?
3. How does it compare to using fhevmjs directly?
4. What real-world problems can it solve?
5. How does it work across different frameworks?
6. What are the privacy guarantees?

---

## Demonstration Checklist

Before recording, ensure:

- [ ] All code examples work correctly
- [ ] Environment is properly configured
- [ ] Terminal history is clean
- [ ] Code is well-formatted
- [ ] Examples are running locally
- [ ] Wallet is connected (for demo)
- [ ] No sensitive information visible
- [ ] Audio equipment tested
- [ ] Screen resolution set correctly
- [ ] Recording software configured

---

**Ready to record? Follow this guide to create a compelling demonstration of the Universal FHEVM SDK!**
