'use client';

import React, { useState } from 'react';
import styles from './admin.module.css';

interface AdminFormProps {
  action: (fd: FormData) => Promise<{ success: boolean; message: string }>;
  children: React.ReactNode;
  submitLabel: string;
  variant?: 'primary' | 'accent';
}

/** Wraps any admin form with success/error feedback without full page reload */
export default function AdminForm({ action, children, submitLabel, variant = 'primary' }: AdminFormProps) {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const result = await action(fd);
    setStatus({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) (e.target as HTMLFormElement).reset();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {children}
      <button
        type="submit"
        className={`btn btn-${variant}`}
        style={{ width: '100%', marginTop: '0.5rem' }}
        disabled={loading}
      >
        {loading ? 'Aguarde...' : submitLabel}
      </button>
      {status && (
        <div className={status.type === 'success' ? styles.msgSuccess : styles.msgError}>
          {status.text}
        </div>
      )}
    </form>
  );
}
