'use client';

import React from 'react';
import { X, Keyboard, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';
import styles from './KeyboardShortcutsModal.module.css';

interface KeyboardShortcutsModalProps {
    open: boolean;
    onClose: () => void;
}

export default React.memo(function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
    if (!open) return null;

    const shortcuts = [
        { key: 'Left Arrow', description: 'Previous Move', icon: <ArrowLeft size={16} /> },
        { key: 'Right Arrow', description: 'Next Move', icon: <ArrowRight size={16} /> },
        { key: 'Up Arrow', description: 'First Move', icon: <ArrowUp size={16} /> },
        { key: 'Down Arrow', description: 'Last Move', icon: <ArrowDown size={16} /> },
        { key: 'F', description: 'Flip Board', icon: <RefreshCcw size={16} /> },
        { key: '?', description: 'Show CSS Keyboard Shortcuts', icon: <Keyboard size={16} /> }
    ];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleWrap}>
                        <Keyboard size={20} className={styles.titleIcon} />
                        <h2 className={styles.title}>Keyboard Shortcuts</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close Shortcuts">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    <ul className={styles.list}>
                        {shortcuts.map((shortcut, index) => (
                            <li key={index} className={styles.item}>
                                <div className={styles.keyDisplay}>
                                    <span className={styles.kbd}>{shortcut.key}</span>
                                </div>
                                <div className={styles.descDisplay}>
                                    {shortcut.icon}
                                    <span>{shortcut.description}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
});
