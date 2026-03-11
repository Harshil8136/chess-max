'use client';

import React from 'react';
import { Settings, Archive, HelpCircle } from 'lucide-react';
import styles from '@/app/page.module.css';

interface LayoutHeaderProps {
    onNewGame: () => void;
    onOpenSettings?: () => void;
    onOpenArchive?: () => void;
    onOpenHelp?: () => void;
    controls?: React.ReactNode;
}

/**
 * Extracts the top-level Header into its own file.
 */
export default React.memo(function LayoutHeader({ onNewGame, onOpenSettings, onOpenArchive, onOpenHelp, controls }: LayoutHeaderProps) {

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <span className={styles.logoIcon}>♟️</span>
                <span className={styles.logoText}>
                    Chess <span className={styles.logoAccent}>Max</span>
                </span>
            </div>
            
            {controls ? (
                <div className={styles.headerControlsWrapper}>
                    {controls}
                </div>
            ) : (
                <div className={styles.headerActions} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                        className="btn btn-icon" 
                        onClick={onOpenHelp} 
                        title="Keyboard Shortcuts" 
                        aria-label="Help" 
                        style={{ background: 'transparent', padding: '8px' }}
                    >
                        <HelpCircle size={20} color="var(--text-secondary)" />
                    </button>
                    <button 
                        className="btn btn-icon" 
                        onClick={onOpenArchive} 
                        title="Game Archive" 
                        aria-label="Archive" 
                        style={{ background: 'transparent', padding: '8px' }}
                    >
                        <Archive size={20} color="var(--text-secondary)" />
                    </button>
                    <button 
                        className="btn btn-icon" 
                        onClick={onOpenSettings} 
                        title="Settings" 
                        aria-label="Settings" 
                        style={{ background: 'transparent', padding: '8px' }}
                    >
                        <Settings size={20} color="var(--text-secondary)" />
                    </button>
                    <button className="btn btn-primary" onClick={onNewGame}>
                        New Game
                    </button>
                </div>
            )}
        </header>
    );
});
