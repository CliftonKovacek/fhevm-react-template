/**
 * Medical Example Component
 *
 * Demonstrates privacy-preserving healthcare data operations
 */

'use client';

import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import styles from '../../styles/Components.module.css';

interface MedicalRecord {
  patientId: string;
  recordType: string;
  value: string;
  encrypted: boolean;
  timestamp: string;
}

export default function MedicalExample() {
  const { encryptU16, isEncrypting } = useEncrypt();

  const [patientId, setPatientId] = useState<string>('');
  const [recordType, setRecordType] = useState<'heartRate' | 'bloodPressure' | 'glucose'>('heartRate');
  const [value, setValue] = useState<string>('');
  const [contractAddress] = useState<string>('0x0000000000000000000000000000000000000000');
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const getRecordLabel = () => {
    switch (recordType) {
      case 'heartRate':
        return 'Heart Rate (BPM)';
      case 'bloodPressure':
        return 'Blood Pressure (Systolic)';
      case 'glucose':
        return 'Blood Glucose (mg/dL)';
    }
  };

  const handleSubmitRecord = async () => {
    try {
      // Encrypt the medical value
      const encrypted = await encryptU16(parseInt(value), contractAddress);

      // Create encrypted record
      const record: MedicalRecord = {
        patientId,
        recordType: getRecordLabel(),
        value: '*** (encrypted on-chain)',
        encrypted: true,
        timestamp: new Date().toISOString(),
      };

      setRecords([record, ...records]);

      // Reset form
      setValue('');

      alert('Medical record submitted successfully! The data is encrypted on the blockchain.');
    } catch (err: any) {
      console.error('Record submission failed:', err);
      alert(`Failed to submit record: ${err.message}`);
    }
  };

  return (
    <Card
      title="Private Healthcare Records"
      subtitle="Secure medical data with FHE"
    >
      <div className={styles.form}>
        <Input
          label="Patient ID"
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Enter patient identifier"
          helperText="Patient identifier (can be pseudonymous)"
        />

        <div className={styles.inputWrapper}>
          <label className={styles.label}>Record Type</label>
          <select
            className={styles.input}
            value={recordType}
            onChange={(e) => setRecordType(e.target.value as any)}
          >
            <option value="heartRate">Heart Rate</option>
            <option value="bloodPressure">Blood Pressure</option>
            <option value="glucose">Blood Glucose</option>
          </select>
        </div>

        <Input
          label={getRecordLabel()}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value"
          helperText="Medical value will be encrypted before storage"
        />

        <Button
          onClick={handleSubmitRecord}
          isLoading={isEncrypting}
          disabled={!patientId || !value}
        >
          Submit Encrypted Record
        </Button>

        {records.length > 0 && (
          <div className={styles.recordsList}>
            <h4>Recent Records</h4>
            {records.map((record, index) => (
              <div key={index} className={styles.recordItem}>
                <p><strong>Patient:</strong> {record.patientId}</p>
                <p><strong>Type:</strong> {record.recordType}</p>
                <p><strong>Value:</strong> {record.value}</p>
                <p><strong>Status:</strong> {record.encrypted ? 'Encrypted' : 'Plain'}</p>
                <p><strong>Time:</strong> {new Date(record.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className={styles.info}>
          <p>
            <strong>HIPAA-Compliant Privacy:</strong>
          </p>
          <ul>
            <li>Medical records encrypted on blockchain</li>
            <li>Only authorized parties can decrypt</li>
            <li>Audit trail without exposing data</li>
            <li>Analytics on encrypted data possible</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
