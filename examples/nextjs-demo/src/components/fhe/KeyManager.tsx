/**
 * Key Manager Component
 *
 * Manages FHE public/private keys
 */

'use client';

import { useState } from 'react';
import { useFhevm } from '@fhevm/sdk/react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import styles from '../../styles/Components.module.css';

export default function KeyManager() {
  const { sdk, account } = useFhevm();
  const [keys, setKeys] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateKeys = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would generate and store keys
      // For demo purposes, we show mock keys
      setKeys({
        address: account,
        publicKey: '0x' + Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Key generation failed:', err);
      alert('Key generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportKeys = () => {
    if (!keys) return;

    const dataStr = JSON.stringify(keys, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fhe-keys-${account}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="Key Manager" subtitle="Manage your FHE encryption keys">
      <div className={styles.form}>
        <p>
          Generate and manage your FHE public/private key pair for encrypted operations.
        </p>

        <Button
          onClick={handleGenerateKeys}
          isLoading={isLoading}
        >
          Generate Key Pair
        </Button>

        {keys && (
          <div className={styles.result}>
            <h4>Generated Keys</h4>
            <p><strong>Address:</strong> {keys.address}</p>
            <p><strong>Public Key:</strong> <code>{keys.publicKey}</code></p>
            <p><strong>Generated:</strong> {keys.timestamp}</p>

            <Button
              variant="secondary"
              onClick={handleExportKeys}
            >
              Export Keys
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
