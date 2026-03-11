'use client';

import React from 'react';
import { X, Palette, Volume2, BarChart3, Moon, Sun, Monitor, AlignJustify } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useGame } from '@/contexts/GameContext';
import { PIECE_SETS } from '@/hooks/useSettings';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export default React.memo(function SettingsModal({ open, onClose }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const { settingsData } = useGame();
    const { settings, updateSetting } = settingsData;

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>Settings</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close Settings">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Theme Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <Palette size={16} /> Theme
                        </div>
                        <div className={styles.themeGrid}>
                            <button
                                className={`${styles.themeOption} ${theme === 'default' ? styles.themeActive : ''}`}
                                onClick={() => setTheme('default')}
                            >
                                <Sun size={18} />
                                <span>Default</span>
                            </button>
                            <button
                                className={`${styles.themeOption} ${theme === 'midnight' ? styles.themeActive : ''}`}
                                onClick={() => setTheme('midnight')}
                            >
                                <Moon size={18} />
                                <span>Midnight</span>
                            </button>
                            <button
                                className={`${styles.themeOption} ${theme === 'stealth' ? styles.themeActive : ''}`}
                                onClick={() => setTheme('stealth')}
                            >
                                <Monitor size={18} />
                                <span>Stealth</span>
                            </button>
                        </div>
                    </div>

                    {/* Sound Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <Volume2 size={16} /> Sound
                        </div>
                        <div className={styles.toggleRow}>
                            <span>Sound Effects</span>
                            <button
                                className={`${styles.toggle} ${settings.soundEnabled ? styles.toggleOn : ''}`}
                                onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                                aria-label="Toggle Sound"
                            >
                                <span className={styles.toggleKnob} />
                            </button>
                        </div>
                    </div>

                    {/* Board Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <BarChart3 size={16} /> Board Display
                        </div>
                        
                        <div className={styles.settingGroup}>
                            <div className={styles.settingLabel}>Piece Set</div>
                            <div className={styles.pieceSetGrid}>
                                {PIECE_SETS.map((set) => (
                                    <button
                                        key={set}
                                        className={`${styles.pieceSetOption} ${settings.pieceSet === set ? styles.pieceSetActive : ''}`}
                                        onClick={() => updateSetting('pieceSet', set)}
                                        aria-label={`${set} piece set`}
                                    >
                                        {set}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.settingGroup}>
                            <div className={styles.settingLabel}>Board Theme</div>
                            <div className={styles.themeGrid}>
                                {['blue', 'green', 'brown', 'purple', 'slate'].map((color) => (
                                    <button
                                        key={color}
                                        className={`${styles.boardColorOption} ${settings.boardTheme === color ? styles.boardColorActive : ''}`}
                                        style={{ backgroundColor: `var(--board-${color}-dark)` }}
                                        onClick={() => updateSetting('boardTheme', color as any)}
                                        aria-label={`${color} board`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.toggleRow}>
                            <span>Show Legal Move Indicators</span>
                            <button
                                className={`${styles.toggle} ${settings.showLegalMoves ? styles.toggleOn : ''}`}
                                onClick={() => updateSetting('showLegalMoves', !settings.showLegalMoves)}
                            >
                                <span className={styles.toggleKnob} />
                            </button>
                        </div>
                        
                        <div className={styles.toggleRow}>
                            <span>Highlight Last Move</span>
                            <button
                                className={`${styles.toggle} ${settings.highlightLastMove ? styles.toggleOn : ''}`}
                                onClick={() => updateSetting('highlightLastMove', !settings.highlightLastMove)}
                            >
                                <span className={styles.toggleKnob} />
                            </button>
                        </div>

                        <div className={styles.toggleRow}>
                            <span>Evaluation Bar</span>
                            <button
                                className={`${styles.toggle} ${settings.showEvalBar ? styles.toggleOn : ''}`}
                                onClick={() => updateSetting('showEvalBar', !settings.showEvalBar)}
                            >
                                <span className={styles.toggleKnob} />
                            </button>
                        </div>
                        
                        <div className={styles.toggleRow}>
                            <span>Auto-Flip Board (Pass & Play)</span>
                            <button
                                className={`${styles.toggle} ${settings.autoFlipBoard ? styles.toggleOn : ''}`}
                                onClick={() => updateSetting('autoFlipBoard', !settings.autoFlipBoard)}
                            >
                                <span className={styles.toggleKnob} />
                            </button>
                        </div>
                        
                        <div className={styles.toggleRow}>
                            <span>Auto-Queen on Premove</span>
                            <button
                                className={`${styles.toggle} ${settings.autoQueenPremove ? styles.toggleOn : ''}`}
                                onClick={() => updateSetting('autoQueenPremove', !settings.autoQueenPremove)}
                            >
                                <span className={styles.toggleKnob} />
                            </button>
                        </div>
                    </div>

                    {/* Stealth Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <Monitor size={16} /> Stealth Mode Options
                        </div>
                        <div className={styles.inputRow}>
                            <label className={styles.inputLabel}>
                                Panic URL (Double-Escape)
                            </label>
                            <input
                                type="url"
                                className={styles.textInput}
                                value={settings.panicUrl}
                                onChange={(e) => updateSetting('panicUrl', e.target.value)}
                                placeholder="https://google.com"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
