'use client';

import React, { useState } from 'react';
import styles from './admin.module.css';

export default function ImagePreviewInput({ defaultValue = '' }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [error, setError] = useState(false);

  return (
    <div className={styles.formGroup}>
      <label>URL da Imagem</label>
      <div className={styles.imageInputRow}>
        <input
          type="text"
          name="image_url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(false); }}
          className="input"
          required
          placeholder="https://i.postimg.cc/..."
          style={{ flex: 1 }}
        />
        {url && (
          <div className={styles.imageThumb}>
            {error ? (
              <span className={styles.imageThumbError}>⚠</span>
            ) : (
              <img
                src={url}
                alt="Preview"
                onError={() => setError(true)}
                onLoad={() => setError(false)}
                className={styles.imageThumbImg}
              />
            )}
          </div>
        )}
      </div>
      <small className={styles.hint}>Use um link direto HTTPS (ex: https://i.postimg.cc/...)</small>
    </div>
  );
}
