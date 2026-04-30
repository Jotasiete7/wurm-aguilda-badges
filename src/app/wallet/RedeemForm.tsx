'use client';

import React, { useState } from 'react';
import { redeemCode } from './actions';
import styles from './wallet.module.css';
import { useLanguage } from '@/lib/i18n';

export default function RedeemForm() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const translateError = (error: string) => {
    if (error.includes("Usuário não autenticado")) return t("User not authenticated.", "Usuário não autenticado.");
    if (error.includes("Muitas tentativas")) return t("Too many attempts. Wait a minute and try again.", "Muitas tentativas. Aguarde um minuto e tente novamente.");
    if (error.includes("Código vazio")) return t("Empty code.", "Código vazio.");
    if (error.includes("Você já possui")) return t("You already own this Badge.", "Você já possui esta Insígnia.");
    if (error.includes("inválido, expirado ou esgotado")) return t("Invalid, expired or exhausted code.", "Código inválido, expirado ou esgotado.");
    if (error.includes("sucesso")) return t("Badge redeemed successfully! ✨", "Insígnia resgatada com sucesso! ✨");
    return t(error, error); // Fallback
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await redeemCode(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: translateError(result.message || 'Success!') });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'error', text: translateError(result.error || 'Unknown error.') });
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.redeemContainer}>
      <h3>{t('Redeem Code', 'Resgatar Código')}</h3>
      <form onSubmit={handleSubmit} className={styles.redeemForm}>
        <input 
          type="text" 
          name="code" 
          placeholder={t('Enter redemption code...', 'Insira o código de resgate...')} 
          className={`input ${styles.redeemInput}`} 
          required 
          disabled={loading}
        />
        <button type="submit" className="btn btn-accent" disabled={loading}>
          {loading ? t('Validating...', 'Validando...') : t('Redeem', 'Resgatar')}
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
