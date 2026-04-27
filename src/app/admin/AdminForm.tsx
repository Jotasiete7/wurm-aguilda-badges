'use client';

import React, { useState } from 'react';
import styles from './admin.module.css';

interface AdminFormProps {
  action: (fd: FormData) => Promise<{ success: boolean; message: string }>;
  children?: React.ReactNode;
  submitLabel: string;
  variant?: 'primary' | 'accent' | 'danger' | 'default';
  onSuccess?: () => void;
}

/** Wraps any admin form with success/error feedback without full page reload */
export default function AdminForm({ action, children, submitLabel, variant = 'primary', onSuccess }: AdminFormProps) {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const btnStyle: React.CSSProperties = variant === 'danger'
    ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }
    : variant === 'default'
    ? { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }
    : {};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const result = await action(fd);
    setStatus({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      (e.target as HTMLFormElement).reset();
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {children}
      <button
        type="submit"
        className={variant === 'primary' || variant === 'accent' ? `btn btn-${variant}` : undefined}
        style={variant === 'danger' || variant === 'default' ? { ...btnStyle, width: '100%', marginTop: '0.5rem' } : { width: '100%', marginTop: '0.5rem' }}
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
