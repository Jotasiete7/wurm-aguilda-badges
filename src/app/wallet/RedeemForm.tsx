'use client';

import React, { useState } from 'react';
import { redeemCode } from './actions';
import styles from './wallet.module.css';

export default function RedeemForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await redeemCode(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Sucesso!' });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro desconhecido.' });
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.redeemContainer}>
      <h3>Resgatar Código</h3>
      <form onSubmit={handleSubmit} className={styles.redeemForm}>
        <input 
          type="text" 
          name="code" 
          placeholder="Insira o código de resgate..." 
          className={`input ${styles.redeemInput}`} 
          required 
          disabled={loading}
        />
        <button type="submit" className="btn btn-accent" disabled={loading}>
          {loading ? 'Validando...' : 'Resgatar'}
        </button>
      </form>
      {message && (
        <div className={message.type === 'success' ? styles.msgSuccess : styles.msgError}>
          {message.text}
        </div>
      )}
    </div>
  );
}
