/**
 * Computation Demo Component
 *
 * Demonstrates homomorphic computation on encrypted data
 */

'use client';

import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import styles from '../../styles/Components.module.css';

export default function ComputationDemo() {
  const { encryptU8, isEncrypting } = useEncrypt();

  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');
  const [operation, setOperation] = useState<'add' | 'multiply'>('add');
  const [contractAddress] = useState<string>('0x0000000000000000000000000000000000000000');
  const [result, setResult] = useState<any>(null);

  const handleCompute = async () => {
    try {
      setResult(null);

      // Encrypt both values
      const encrypted1 = await encryptU8(parseInt(value1), contractAddress);
      const encrypted2 = await encryptU8(parseInt(value2), contractAddress);

      // In a real implementation, you would call a smart contract
      // that performs the computation on encrypted values
      // For demo purposes, we show the encrypted inputs
      setResult({
        operation,
        inputs: {
          value1: value1,
          value2: value2,
          encrypted1: Array.from(encrypted1.data).slice(0, 10).join(',') + '...',
          encrypted2: Array.from(encrypted2.data).slice(0, 10).join(',') + '...',
        },
        note: 'In production, the smart contract would perform ' + operation + ' on these encrypted values without decryption',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Computation failed:', err);
      alert(`Computation failed: ${err.message}`);
    }
  };

  return (
    <Card
      title="Homomorphic Computation"
      subtitle="Compute on encrypted data without decryption"
    >
      <div className={styles.form}>
        <Input
          label="First Value"
          type="number"
          value={value1}
          onChange={(e) => setValue1(e.target.value)}
          placeholder="Enter first number (0-255)"
          helperText="Enter a number between 0 and 255"
        />

        <div className={styles.inputWrapper}>
          <label className={styles.label}>Operation</label>
          <select
            className={styles.input}
            value={operation}
            onChange={(e) => setOperation(e.target.value as any)}
          >
            <option value="add">Addition</option>
            <option value="multiply">Multiplication</option>
          </select>
        </div>

        <Input
          label="Second Value"
          type="number"
          value={value2}
          onChange={(e) => setValue2(e.target.value)}
          placeholder="Enter second number (0-255)"
          helperText="Enter a number between 0 and 255"
        />

        <Button
          onClick={handleCompute}
          isLoading={isEncrypting}
          disabled={!value1 || !value2}
        >
          Compute on Encrypted Data
        </Button>

        {result && (
          <div className={styles.result}>
            <h4>Computation Result</h4>
            <p><strong>Operation:</strong> {result.operation}</p>
            <p><strong>Value 1:</strong> {result.inputs.value1}</p>
            <p><strong>Value 2:</strong> {result.inputs.value2}</p>
            <p><strong>Encrypted 1:</strong> <code>{result.inputs.encrypted1}</code></p>
            <p><strong>Encrypted 2:</strong> <code>{result.inputs.encrypted2}</code></p>
            <p><strong>Note:</strong> {result.note}</p>
            <p><strong>Timestamp:</strong> {result.timestamp}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
