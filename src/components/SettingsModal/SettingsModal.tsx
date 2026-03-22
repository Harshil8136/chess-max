'use client';

import React, { useState } from 'react';
import { X, Palette, Volume2, Monitor, Gamepad2, Sun, Moon, Gem, Star, Zap, Hexagon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useGame } from '@/contexts/GameContext';
import { PIECE_SETS } from '@/hooks/useSettings';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

type TabType = 'appearance' | 'gameplay' | 'advanced';

export default React.memo(function SettingsModal({ open, onClose }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const { settingsData } = useGame();
    const { settings, updateSetting } = settingsData;
    const [activeTab, setActiveTab] = useState<TabType>('appearance');

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

                <div className={styles.body}>
                    {/* Sidebar Tabs */}
                    <div className={styles.sidebar}>
                        <button 
                            className={`${styles.tab} ${activeTab === 'appearance' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('appearance')}
                        >
                            <Palette size={18} /> <span>Appearance</span>
                        </button>
                        <button 
                            className={`${styles.tab} ${activeTab === 'gameplay' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('gameplay')}
                        >
                            <Gamepad2 size={18} /> <span>Gameplay</span>
                        </button>
                        <button 
                            className={`${styles.tab} ${activeTab === 'advanced' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('advanced')}
                        >
                            <Monitor size={18} /> <span>Advanced</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className={styles.contentArea}>
                        {activeTab === 'appearance' && (
                            <div className={styles.tabContent}>
                                {/* Theme Section */}
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>App Theme</div>
                                    <div className={styles.themeGrid}>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'default' ? styles.themeActive : ''}`}
                                            onClick={() => setTheme('default')}
                                        >
                                            <Sun size={20} />
                                            <span>Default</span>
                                        </button>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'midnight' ? styles.themeActive : ''}`}
                                            onClick={() => setTheme('midnight')}
                                        >
                                            <Moon size={20} />
                                            <span>Midnight</span>
                                        </button>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'stealth' ? styles.themeActive : ''}`}
                                            onClick={() => setTheme('stealth')}
                                        >
                                            <Monitor size={20} />
                                            <span>Stealth</span>
                                        </button>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'emerald' ? styles.themeActive : ''}`}
                                            onClick={() => setTheme('emerald')}
                                        >
                                            <Hexagon size={20} />
                                            <span>Emerald</span>
                                        </button>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'ruby' ? styles.themeActive : ''}`}
                                            onClick={() => setTheme('ruby')}
                                        >
                                            <Gem size={20} />
                                            <span>Ruby</span>
                                        </button>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'sapphire' ? styles.themeActive : ''}`}
                                            onClick={() => setTheme('sapphire')}
                                        >
                                            <Star size={20} />
                                            <span>Sapphire</span>
                                        </button>
                                        <button
                                            className={`${styles.themeOption} ${theme === 'cyberpunk' ? styles.themeActive : ''}`}
                                            onClick={() => setTheme('cyberpunk')}
                                        >
                                            <Zap size={20} />
                                            <span>Cyberpunk</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Board Section */}
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Board Display</div>
                                    
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
                                        <div className={styles.boardThemeGrid}>
                                            {['blue', 'green', 'brown', 'purple', 'slate', 'emerald', 'ruby', 'sapphire', 'cyberpunk'].map((color) => (
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
                                </div>
                            </div>
                        )}

                        {activeTab === 'gameplay' && (
                            <div className={styles.tabContent}>
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Audio & Alerts</div>
                                    <div className={styles.toggleRow}>
                                        <span><Volume2 size={16} className={styles.inlineIcon} /> Sound Effects</span>
                                        <button
                                            className={`${styles.toggle} ${settings.soundEnabled ? styles.toggleOn : ''}`}
                                            onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                                            aria-label="Toggle Sound"
                                        >
                                            <span className={styles.toggleKnob} />
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Game Interface</div>
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
                                </div>

                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Game Mechanics</div>
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
                            </div>
                        )}

                        {activeTab === 'advanced' && (
                            <div className={styles.tabContent}>
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Stealth Mode</div>
                                    <div className={styles.inputRow}>
                                        <label className={styles.inputLabel}>
                                            Panic URL (Double-Escape)
                                            <span className={styles.inputHelper}>
                                                Pressing Escape twice quickly will instantly redirect to this URL.
                                            </span>
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
