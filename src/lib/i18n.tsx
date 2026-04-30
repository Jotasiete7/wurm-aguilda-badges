'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'pt';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (en: string, pt: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Language>('pt'); // Default to PT for this project

    useEffect(() => {
        const saved = localStorage.getItem('guilda_badges_lang');
        if (saved === 'pt' || saved === 'en') {
            setLangState(saved);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('guilda_badges_lang', newLang);
        document.documentElement.lang = newLang;
    };

    const t = (en: string, pt: string) => {
        return lang === 'en' ? en : pt;
    };

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const T: React.FC<{ en: string; pt: string }> = ({ en, pt }) => {
    const { t } = useLanguage();
    return <>{t(en, pt)}</>;
};
