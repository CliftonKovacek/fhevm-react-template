# Contributing to Universal FHEVM SDK

Thank you for your interest in contributing to the Universal FHEVM SDK! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Documentation](#documentation)

---

## Code of Conduct

This project follows the principles of respect, inclusivity, and collaboration. Please:

- Be respectful and considerate
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Basic understanding of TypeScript
- Familiarity with FHEVM concepts (helpful but not required)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/fhevm-sdk.git
cd fhevm-sdk
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/original/fhevm-sdk.git
```

---

## Development Setup

### Install Dependencies

```bash
# Install all dependencies
npm install

# Build the SDK
npm run build:sdk

# Build all packages
npm run build:all
```

### Verify Setup

```bash
# Run tests
npm run test:sdk

# Run linting
npm run lint

# Start development environment
npm run dev:nextjs
```

---

## Making Changes

### Branch Naming

Create a descriptive branch name:

```bash
git checkout -b feature/add-vue-support
git checkout -b fix/encryption-error
git checkout -b docs/update-readme
```

Prefix conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### Commit Messages

Write clear, descriptive commit messages:

```
feat: add Vue composables for FHE operations

- Implement useFhevm composable
- Add useEncrypt and useDecrypt hooks
- Update documentation with Vue examples
```

Format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation change
- `test:` - Test additions
- `refactor:` - Code refactoring
- `chore:` - Build or tooling changes

---

## Testing

### Running Tests

```bash
# Run all tests
npm run test:all

# Run SDK tests only
npm run test:sdk

# Run tests in watch mode
npm run test:sdk -- --watch

# Run with coverage
npm run test:coverage
```

### Writing Tests

All new features should include tests:

```typescript
import { describe, it, expect } from 'vitest';
import { createFhevmSDK } from '../src/index';

describe('FhevmSDK', () => {
  it('should initialize correctly', async () => {
    const sdk = createFhevmSDK(config);
    await sdk.init();
    expect(sdk.isInitialized()).toBe(true);
  });

  it('should encrypt u8 values', async () => {
    const sdk = createFhevmSDK(config);
    await sdk.init();
    const result = await sdk.encryptU8(42, contractAddress);
    expect(result.data).toBeDefined();
    expect(result.proof).toBeDefined();
  });
});
```

---

## Submitting Changes

### Before Submitting

1. **Update Documentation**
   - Update README if API changes
   - Add JSDoc comments
   - Update examples if needed

2. **Run All Checks**
   ```bash
   npm run lint
   npm run test:all
   npm run build:all
   ```

3. **Sync with Upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Pull Request Process

1. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature
   ```

2. **Create Pull Request**
   - Go to GitHub and create a PR
   - Use a clear, descriptive title
   - Fill out the PR template
   - Link related issues

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests added/updated
   - [ ] All tests passing
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)
   - [ ] Commit messages are clear
   ```

4. **Code Review**
   - Address reviewer feedback
   - Make requested changes
   - Keep discussion constructive

---

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for public APIs

```typescript
// Good
interface EncryptionResult {
  data: Uint8Array;
  proof: string;
}

async function encrypt(value: number): Promise<EncryptionResult> {
  // ...
}

// Bad
async function encrypt(value: any): Promise<any> {
  // ...
}
```

### Naming Conventions

- **Variables/Functions:** camelCase
- **Classes:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **Files:** kebab-case or camelCase

```typescript
const MAX_RETRY_COUNT = 3;

class FhevmSDK {
  private instanceId: string;

  async encryptValue(value: number): Promise<EncryptionResult> {
    // ...
  }
}
```

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters

```typescript
// Good
const sdk = createFhevmSDK({
  network: { chainId: 11155111, rpcUrl: 'https://...' },
});

// Format with Prettier
npm run format
```

### Error Handling

- Always handle errors appropriately
- Provide meaningful error messages
- Use try-catch for async operations

```typescript
async function encryptData(value: number): Promise<EncryptionResult> {
  try {
    this.ensureInitialized();
    const encrypted = await this.instance.encrypt_uint8(value);
    return { data: encrypted, proof: '...' };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error(`Failed to encrypt value: ${error.message}`);
  }
}
```

---

## Documentation

### Code Documentation

Use JSDoc for all public APIs:

```typescript
/**
 * Encrypt an 8-bit unsigned integer
 *
 * @param value - The value to encrypt (0-255)
 * @param contractAddress - Target contract address
 * @returns Encrypted data and proof
 * @throws {Error} If value is out of range or SDK not initialized
 *
 * @example
 * ```typescript
 * const encrypted = await sdk.encryptU8(42, '0x...');
 * await contract.submitValue(encrypted.data, encrypted.proof);
 * ```
 */
async encryptU8(value: number, contractAddress: string): Promise<EncryptionResult>
```

### README Updates

When adding features:
- Update feature list
- Add usage examples
- Update API reference
- Include migration notes for breaking changes

### Example Code

Provide working examples:
- Include in examples/ directory
- Add detailed comments
- Show common use cases
- Include error handling

---

## Areas for Contribution

We welcome contributions in:

### Features
- Additional framework adapters (Angular, Svelte, etc.)
- Enhanced error handling
- Performance optimizations
- CLI tools
- Browser extension integration

### Documentation
- Tutorial improvements
- API reference enhancements
- More examples
- Translation to other languages

### Testing
- Additional test coverage
- Integration tests
- Performance benchmarks
- Browser compatibility tests

### Bug Fixes
- Check open issues
- Reproduce and fix bugs
- Add regression tests

---

## Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Create an issue with reproduction steps
- **Feature Requests:** Open an issue with detailed proposal
- **Chat:** Join Zama Discord community

---

## Release Process

Maintainers handle releases:

1. Version bump in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm
5. Create GitHub release

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

Thank you for contributing to Universal FHEVM SDK! Your efforts help make privacy-preserving blockchain applications accessible to all developers.
