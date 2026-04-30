'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Network, Home, BookOpen, Pickaxe, LineChart, BookMarked, Hammer, Shield, Gavel } from 'lucide-react';
import styles from './EcosystemDropdown.module.css';
import { useLanguage } from '@/lib/i18n';

const CURRENT_TOOL = 'badges';

const EcosystemDropdown: React.FC = () => {
    const { lang } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const ECOSYSTEM_TOOLS = [
        {
            id: 'portal',
            label: 'Portal',
            href: 'https://wurm-aguild-site.pages.dev',
            icon: Home,
        },
        {
            id: 'analytics',
            label: 'Analytics',
            href: 'https://wurm-analytics-journal.pages.dev',
            icon: LineChart,
        },
        {
            id: 'recipes',
            label: lang === 'pt' ? 'Receitas' : 'Recipes',
            href: 'https://wurm-recipe-tool.pages.dev',
            icon: BookOpen,
        },
        {
            id: 'mining',
            label: lang === 'pt' ? 'Mineração' : 'Mining',
            href: 'https://wurm-mining-tool.pages.dev',
            icon: Pickaxe,
        },
        {
            id: 'liturgy',
            label: 'Liturgy',
            href: 'https://wurm-liturgy.pages.dev',
            icon: BookMarked,
        },
        {
            id: 'carpentry',
            label: 'Carpentry',
            href: 'https://wurm-carpentry-tool.pages.dev',
            icon: Hammer,
        },
        {
            id: 'auction',
            label: lang === 'pt' ? 'Leilões' : 'Auction',
            href: 'https://wurm-auction-helper.pages.dev',
            icon: Gavel,
        },
        {
            id: 'badges',
            label: 'Guilda Badges',
            href: '/',
            icon: Shield,
        },
    ];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className={styles.dropdownContainer}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                title={lang === 'pt' ? 'Ecossistema A Guilda' : 'A Guilda Ecosystem'}
                className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
            >
                <Network size={18} />
            </button>

            {isOpen && (
                <div className={styles.menu}>
                    <div className={styles.menuHeader}>
                        A Guilda
                    </div>
                    {ECOSYSTEM_TOOLS.map(({ id, label, href, icon: Icon }) => {
                        const isCurrent = id === CURRENT_TOOL;
                        return isCurrent ? (
                            <div key={id} className={styles.menuItemCurrent}>
                                <Icon size={14} />
                                <span>{label}</span>
                                <span className={styles.currentBadge}>
                                    {lang === 'pt' ? 'aqui' : 'here'}
                                </span>
                            </div>
                        ) : (
                            <a key={id} href={href} className={styles.menuItem}>
                                <Icon size={14} />
                                <span>{label}</span>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EcosystemDropdown;
