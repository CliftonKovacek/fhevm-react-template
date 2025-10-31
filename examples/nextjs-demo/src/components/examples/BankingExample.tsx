/**
 * Banking Example Component
 *
 * Demonstrates privacy-preserving financial operations
 */

'use client';

import { useState } from 'react';
import { useEncrypt, useDecrypt } from '@fhevm/sdk/react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import styles from '../../styles/Components.module.css';

export default function BankingExample() {
  const { encryptU32, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();

  const [amount, setAmount] = useState<string>('');
  const [operation, setOperation] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [contractAddress] = useState<string>('0x0000000000000000000000000000000000000000');
  const [balance, setBalance] = useState<string>('***');
  const [transactionResult, setTransactionResult] = useState<any>(null);

  const handleTransaction = async () => {
    try {
      setTransactionResult(null);

      // Encrypt the amount
      const encrypted = await encryptU32(parseInt(amount), contractAddress);

      // Simulate transaction
      setTransactionResult({
        operation,
        amount: amount,
        encrypted: Array.from(encrypted.data).slice(0, 20).join(',') + '...',
        proof: encrypted.proof.slice(0, 50) + '...',
        status: 'Success',
        timestamp: new Date().toISOString(),
      });

      // Update mock balance
      if (operation === 'deposit') {
        setBalance('Balance updated (encrypted on-chain)');
      }
    } catch (err: any) {
      console.error('Transaction failed:', err);
      alert(`Transaction failed: ${err.message}`);
    }
  };

  const handleViewBalance = async () => {
    // Simulate balance reveal
    setBalance('$10,000 (decrypted for display only)');
  };

  return (
    <Card
      title="Private Banking"
      subtitle="Confidential financial operations with FHE"
    >
      <div className={styles.form}>
        <div className={styles.balanceDisplay}>
          <h4>Account Balance</h4>
          <p className={styles.balance}>{balance}</p>
          <Button
            variant="secondary"
            onClick={handleViewBalance}
            isLoading={isDecrypting}
          >
            Reveal Balance (Private)
          </Button>
        </div>

        <div className={styles.inputWrapper}>
          <label className={styles.label}>Operation</label>
          <select
            className={styles.input}
            value={operation}
            onChange={(e) => setOperation(e.target.value as any)}
          >
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <Input
          label="Amount (USD)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          helperText="Amount will be encrypted before sending to blockchain"
        />

        <Button
          onClick={handleTransaction}
          isLoading={isEncrypting}
          disabled={!amount}
        >
          Execute {operation.charAt(0).toUpperCase() + operation.slice(1)}
        </Button>

        {transactionResult && (
          <div className={styles.result}>
            <h4>Transaction Result</h4>
            <p><strong>Operation:</strong> {transactionResult.operation}</p>
            <p><strong>Amount:</strong> ${transactionResult.amount}</p>
            <p><strong>Status:</strong> {transactionResult.status}</p>
            <p><strong>Encrypted:</strong> <code>{transactionResult.encrypted}</code></p>
            <p><strong>Note:</strong> Your transaction amount is encrypted on-chain. Only you can decrypt your balance.</p>
            <p><strong>Timestamp:</strong> {transactionResult.timestamp}</p>
          </div>
        )}

        <div className={styles.info}>
          <p>
            <strong>Privacy Features:</strong>
          </p>
          <ul>
            <li>Transaction amounts are encrypted on-chain</li>
            <li>Only you can decrypt your balance</li>
            <li>Computations happen on encrypted data</li>
            <li>Zero-knowledge proofs ensure validity</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
