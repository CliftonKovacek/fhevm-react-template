/**
 * Encryption Demo Component
 *
 * Demonstrates encryption of different data types
 */

'use client';

import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import styles from '../../styles/Components.module.css';

export default function EncryptionDemo() {
  const { encryptU8, encryptU16, encryptU32, encryptBool, isEncrypting, error } = useEncrypt();

  const [value, setValue] = useState<string>('');
  const [dataType, setDataType] = useState<'bool' | 'u8' | 'u16' | 'u32'>('u8');
  const [contractAddress, setContractAddress] = useState<string>('0x0000000000000000000000000000000000000000');
  const [result, setResult] = useState<any>(null);

  const handleEncrypt = async () => {
    try {
      setResult(null);
      let encrypted;

      switch (dataType) {
        case 'bool':
          encrypted = await encryptBool(value === 'true', contractAddress);
          break;
        case 'u8':
          encrypted = await encryptU8(parseInt(value), contractAddress);
          break;
        case 'u16':
          encrypted = await encryptU16(parseInt(value), contractAddress);
          break;
        case 'u32':
          encrypted = await encryptU32(parseInt(value), contractAddress);
          break;
      }

      setResult({
        original: value,
        type: dataType,
        encrypted: {
          data: Array.from(encrypted.data).slice(0, 20).join(',') + '...',
          proof: encrypted.proof.slice(0, 50) + '...',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Encryption failed:', err);
      alert(`Encryption failed: ${err.message}`);
    }
  };

  return (
    <Card title="Encryption Demo" subtitle="Encrypt different data types">
      <div className={styles.form}>
        <Input
          label="Value to Encrypt"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={dataType === 'bool' ? 'true or false' : 'Enter a number'}
          helperText={`Enter a ${dataType === 'bool' ? 'boolean' : 'number'} value`}
        />

        <div className={styles.inputWrapper}>
          <label className={styles.label}>Data Type</label>
          <select
            className={styles.input}
            value={dataType}
            onChange={(e) => setDataType(e.target.value as any)}
          >
            <option value="bool">Boolean</option>
            <option value="u8">Uint8 (0-255)</option>
            <option value="u16">Uint16 (0-65535)</option>
            <option value="u32">Uint32 (0-4294967295)</option>
          </select>
        </div>

        <Input
          label="Contract Address"
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
          helperText="Target contract address for encryption"
        />

        <Button
          onClick={handleEncrypt}
          isLoading={isEncrypting}
          disabled={!value || !contractAddress}
        >
          Encrypt Data
        </Button>

        {error && (
          <div className={styles.error}>
            Error: {error.message}
          </div>
        )}

        {result && (
          <div className={styles.result}>
            <h4>Encryption Result</h4>
            <p><strong>Original:</strong> {result.original}</p>
            <p><strong>Type:</strong> {result.type}</p>
            <p><strong>Encrypted Data:</strong> <code>{result.encrypted.data}</code></p>
            <p><strong>Proof:</strong> <code>{result.encrypted.proof}</code></p>
            <p><strong>Timestamp:</strong> {result.timestamp}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
