'use client';

import React from 'react';
import { useLanguage, Language } from '../lib/i18n';
import styles from './LanguageSelector.module.css';

const LanguageSelector: React.FC = () => {
    const { lang, setLang } = useLanguage();

    const languages: { code: Language; label: string }[] = [
        { code: 'pt', label: 'PT' },
        { code: 'en', label: 'EN' },
    ];

    return (
        <div className={styles.selectorContainer}>
            {languages.map((l, index) => (
                <React.Fragment key={l.code}>
                    <button
                        onClick={() => setLang(l.code)}
                        className={`${styles.langBtn} ${lang === l.code ? styles.langBtnActive : ''}`}
                        title={l.code === 'pt' ? 'Português' : 'English'}
                    >
                        {l.label}
                    </button>
                    {index < languages.length - 1 && <div className={styles.divider} />}
                </React.Fragment>
            ))}
        </div>
    );
};

export default LanguageSelector;
