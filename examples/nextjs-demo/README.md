# Next.js FHEVM Demo

**Complete Next.js integration showcasing `@fhevm/sdk`**

This example demonstrates how to integrate the FHEVM SDK into a Next.js application with React hooks.

---

## 🚀 Features

- ✅ Full Next.js 14 integration
- ✅ React hooks from `@fhevm/sdk/react`
- ✅ TypeScript support
- ✅ Encrypted voting interface
- ✅ Wallet connection
- ✅ Real-time encryption status
- ✅ Beautiful UI with CSS modules

---

## 📦 Installation

```bash
# From root directory
npm install

# Or in this directory
npm install
```

---

## 🔧 Configuration

1. **Copy environment file**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit .env.local**
   ```env
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your deployed contract
   ```

3. **Deploy voting contract** (from environmental-voting example)
   ```bash
   cd ../environmental-voting
   npm run deploy
   # Copy contract address to .env.local
   ```

---

## 🎯 Usage

```bash
# Development
npm run dev

# Open http://localhost:3000

# Build for production
npm run build

# Start production server
npm start
```

---

## 🏗️ Project Structure

```
nextjs-demo/
├── pages/
│   ├── _app.tsx           # SDK Provider setup
│   └── index.tsx          # Main page
├── components/
│   ├── ConnectWallet.tsx  # Wallet connection
│   └── VotingInterface.tsx # Voting UI
├── styles/
│   ├── globals.css
│   ├── Home.module.css
│   └── Components.module.css
├── lib/                   # Utilities (if needed)
├── public/                # Static assets
├── .env.example
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 💻 SDK Integration Examples

### 1. App Setup (_app.tsx)

```tsx
import { FhevmProvider } from '@fhevm/sdk/react';

export default function App({ Component, pageProps }) {
  return (
    <FhevmProvider
      config={{
        network: {
          chainId: 11155111,
          rpcUrl: process.env.NEXT_PUBLIC_RPC_URL
        }
      }}
      autoConnect={true}
    >
      <Component {...pageProps} />
    </FhevmProvider>
  );
}
```

### 2. Wallet Connection

```tsx
import { useConnect } from '@fhevm/sdk/react';

function ConnectWallet() {
  const { connect, isConnecting } = useConnect();

  return (
    <button onClick={connect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

### 3. Encrypt and Vote

```tsx
import { useEncrypt, useContract } from '@fhevm/sdk/react';

function VoteButton() {
  const { encryptU8, isEncrypting } = useEncrypt();
  const contract = useContract(contractAddress, abi);

  const handleVote = async () => {
    // Encrypt vote
    const encrypted = await encryptU8(1, contractAddress); // 1 = yes

    // Submit to contract
    const tx = await contract.vote(
      proposalId,
      encrypted.data,
      encrypted.proof
    );

    await tx.wait();
  };

  return (
    <button onClick={handleVote} disabled={isEncrypting}>
      Vote
    </button>
  );
}
```

### 4. Check Connection Status

```tsx
import { useFhevm, useAccount } from '@fhevm/sdk/react';

function Dashboard() {
  const { isInitialized, error } = useFhevm();
  const { address, chainId } = useAccount();

  if (!isInitialized) return <div>Connecting...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      Connected: {address}
      Network: {chainId}
    </div>
  );
}
```

### 5. Decrypt Results

```tsx
import { useDecrypt } from '@fhevm/sdk/react';

function Results() {
  const { publicDecrypt, isDecrypting } = useDecrypt();

  const showResults = async () => {
    const yesVotes = await publicDecrypt(
      contractAddress,
      yesVotesHandle
    );

    const noVotes = await publicDecrypt(
      contractAddress,
      noVotesHandle
    );

    return { yes: yesVotes, no: noVotes };
  };

  return (
    <button onClick={showResults} disabled={isDecrypting}>
      Show Results
    </button>
  );
}
```

---

## 🎨 UI Components

### ConnectWallet Component
- Wallet connection button
- Loading states
- Error handling
- Connection status

### VotingInterface Component
- Proposal display
- Vote selection (Yes/No)
- Encryption feedback
- Transaction status
- Privacy information
- SDK code example

---

## 🔐 Privacy Features

The demo showcases:

1. **Client-Side Encryption**
   - Votes encrypted before leaving browser
   - Uses `encryptU8()` from SDK

2. **Vote Privacy**
   - Individual votes never visible on-chain
   - Only encrypted ciphertext stored

3. **Result Aggregation**
   - Admin reveals aggregated totals only
   - Uses `publicDecrypt()` for final results

4. **EIP-712 Signatures**
   - User consent for decryption
   - Secure signature flow

---

## 🧪 Testing

```bash
# Type check
npm run lint

# Build test
npm run build

# Manual testing
npm run dev
# Open browser and test all features
```

### Test Checklist

- [ ] Wallet connects successfully
- [ ] SDK initializes without errors
- [ ] Vote encrypts correctly
- [ ] Transaction submits to blockchain
- [ ] UI shows proper loading states
- [ ] Error messages display correctly
- [ ] Privacy info is clear

---

## 📱 Responsive Design

The UI is fully responsive:
- Desktop (> 768px): Full layout
- Tablet (768px - 600px): Adjusted layout
- Mobile (< 600px): Single column

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# NEXT_PUBLIC_RPC_URL
# NEXT_PUBLIC_CONTRACT_ADDRESS
```

### Other Platforms

Works with:
- Netlify
- Railway
- AWS Amplify
- Any Node.js hosting

---

## 🎓 Key Learnings

### SDK Integration Benefits

1. **Simple Setup**
   - One `FhevmProvider` wrapper
   - Auto-initialization
   - No manual provider setup

2. **React Hooks**
   - `useFhevm()` - Connection state
   - `useEncrypt()` - Encryption operations
   - `useDecrypt()` - Decryption operations
   - `useContract()` - Contract interactions

3. **Type Safety**
   - Full TypeScript support
   - IntelliSense in IDE
   - Compile-time error checking

4. **Developer Experience**
   - Minimal boilerplate
   - Clear error messages
   - Loading states built-in

---

## 📚 Resources

- **@fhevm/sdk Docs**: [../../../packages/fhevm-sdk/README.md](../../packages/fhevm-sdk/README.md)
- **Next.js Docs**: https://nextjs.org/docs
- **Zama FHEVM**: https://docs.zama.ai/fhevm
- **React Hooks**: https://react.dev/reference/react

---

## 🐛 Troubleshooting

### "Cannot find module '@fhevm/sdk/react'"

```bash
# Build SDK first
cd ../../packages/fhevm-sdk
npm run build
```

### "Network connection failed"

- Check RPC URL in `.env.local`
- Verify MetaMask is connected to Sepolia
- Try alternative RPC provider

### "Contract not deployed"

```bash
# Deploy contract first
cd ../environmental-voting
npm run deploy
# Copy address to .env.local
```

---

## 📄 License

MIT License - Part of FHEVM SDK monorepo

---

## 🙏 Credits

Built with:
- **Next.js** - React framework
- **@fhevm/sdk** - FHEVM integration
- **Zama** - FHEVM technology
- **Ethers.js** - Blockchain interactions

---

**Ready to build privacy-preserving dApps with Next.js!** 🚀
