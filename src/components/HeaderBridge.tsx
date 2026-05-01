'use client';

import React from 'react';
import { Header } from '@antigravity/layout/Header';
import { LanguageSwitch } from '@antigravity/modules/LanguageSwitch';
import { useLanguage, T } from '@/lib/i18n';
import Link from 'next/link';

interface HeaderBridgeProps {
    session: any;
    isAdmin: boolean;
    logoutAction: any;
}

export const HeaderBridge: React.FC<HeaderBridgeProps> = ({ session, isAdmin, logoutAction }) => {
    const { lang, setLang } = useLanguage();

    const navigation = [
        ...(session?.user ? [
            { label: <T en="Inventory" pt="Inventário" />, href: '/wallet' },
            { label: <T en="Hall of Fame" pt="Hall da Fama" />, href: '/ranking' },
        ] : []),
        ...(isAdmin ? [
            { label: <T en="⚔ Guild Panel" pt="⚔ Painel da Guilda" />, href: '/admin', adminOnly: true }
        ] : [])
    ];

    const authData = {
        user: session?.user ? {
            name: session.user.name,
            image: session.user.image
        } : null,
        isAdmin,
        logoutForm: session?.user ? (
            <form action={logoutAction}>
                <button type="submit" className="btn" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}>
                    <T en="Logout" pt="Desconectar" />
                </button>
            </form>
        ) : null,
        loginButton: !session?.user ? (
            <Link href="/login" className="btn btn-primary">
                <T en="Login with Discord" pt="Entrar com Discord" />
            </Link>
        ) : null
    };

    const languageSwitch = (
        <LanguageSwitch 
            lang={lang} 
            onLanguageChange={setLang} 
            styles={require('./Header.module.css')} // We will use the bridge to pass styles if needed, but actually the Header has its own styles
        />
    );

    // Wait, the Header.tsx already has its own CSS Module. 
    // I need to make sure the LanguageSwitch in Header.tsx uses the right styles.
    
    return (
        <Header 
            currentToolId="badges"
            brandSubName="Badges"
            lang={lang}
            auth={authData}
            navigation={navigation}
            LinkComponent={Link}
            extraModules={
                <LanguageSwitch 
                    lang={lang} 
                    onLanguageChange={setLang} 
                    styles={require('@antigravity/layout/Header.module.css')}
                />
            }
        />
    );
};
