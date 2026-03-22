'use client';

import React, { useState } from 'react';
import styles from './NewGameDialog.module.css';
import { ELO_LEVELS, TIME_CONTROLS, DEFAULT_ELO, DEFAULT_TIME_CONTROL } from '@/lib/elo';
import { PlayerColor, EloLevel, TimeControl, GameMode } from '@/types/chess';

interface NewGameDialogProps {
    open: boolean;
    onClose: () => void;
    onStartGame: (settings: {
        gameMode: GameMode;
        playerColor: PlayerColor;
        eloLevel: EloLevel;
        timeControl: TimeControl;
    }) => void;
}

export default React.memo(function NewGameDialog({ open, onClose, onStartGame }: NewGameDialogProps) {
    const [gameMode, setGameMode] = useState<GameMode>('vs_computer');
    const [selectedColor, setSelectedColor] = useState<PlayerColor | 'random'>('w');
    const [eloIndex, setEloIndex] = useState(ELO_LEVELS.indexOf(DEFAULT_ELO));
    const [selectedTimeControl, setSelectedTimeControl] = useState(DEFAULT_TIME_CONTROL);

    if (!open) return null;

    const currentElo = ELO_LEVELS[eloIndex];

    const handlePlay = () => {
        let color: PlayerColor;
        if (selectedColor === 'random') {
            color = Math.random() < 0.5 ? 'w' : 'b';
        } else {
            color = selectedColor;
        }

        onStartGame({
            gameMode,
            playerColor: color,
            eloLevel: currentElo,
            timeControl: selectedTimeControl,
        });
        onClose();
    };

    return (
        <div className={styles.overlayContainer}>
            <div className={styles.overlayBlur} onClick={onClose} />
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.title}>New Game</h2>

                {/* Game Mode Selection */}
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Game Mode</div>
                    <div className={styles.modePicker}>
                        <button
                            className={`${styles.modeOption} ${gameMode === 'vs_computer' ? styles.modeOptionActive : ''}`}
                            onClick={() => setGameMode('vs_computer')}
                        >
                            Play Computer
                        </button>
                        <button
                            className={`${styles.modeOption} ${gameMode === 'pass_and_play' ? styles.modeOptionActive : ''}`}
                            onClick={() => setGameMode('pass_and_play')}
                        >
                            Pass & Play
                        </button>
                    </div>
                </div>

                {/* Color Selection (Only vs Computer) */}
                {gameMode === 'vs_computer' && (
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>Play as</div>
                    <div className={styles.colorPicker}>
                        <button
                            className={`${styles.colorOption} ${selectedColor === 'w' ? styles.colorOptionActive : ''}`}
                            onClick={() => setSelectedColor('w')}
                            title="White"
                        >
                            ♔
                        </button>
                        <button
                            className={`${styles.colorOption} ${selectedColor === 'random' ? styles.colorOptionActive : ''}`}
                            onClick={() => setSelectedColor('random')}
                            title="Random"
                        >
                            🎲
                        </button>
                        <button
                            className={`${styles.colorOption} ${selectedColor === 'b' ? styles.colorOptionActive : ''}`}
                            onClick={() => setSelectedColor('b')}
                            title="Black"
                        >
                            ♚
                        </button>
                    </div>
                </div>
                )}

                {/* AI Personality Selection (Only vs Computer) */}
                {gameMode === 'vs_computer' && (
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Choose Opponent</div>
                    <div className={styles.aiSelectorConfig}>
                        <div className={styles.aiCardsContainer}>
                            {ELO_LEVELS.map((elo, idx) => (
                                <button
                                    key={elo.elo}
                                    className={`${styles.aiCard} ${eloIndex === idx ? styles.aiCardActive : ''}`}
                                    onClick={() => setEloIndex(idx)}
                                >
                                    <div className={styles.aiAvatar}>{elo.avatar || '🤖'}</div>
                                    <div className={styles.aiName}>{elo.name}</div>
                                    <div className={styles.aiElo}>ELO {elo.elo}</div>
                                </button>
                            ))}
                        </div>
                        <div className={styles.aiDescContainer}>
                            <div className={styles.aiDescText}>{currentElo.description}</div>
                        </div>
                    </div>
                </div>
                )}

                {/* Time Control */}
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Time Control</div>
                    <div className={styles.timeGrid}>
                        {TIME_CONTROLS.map((tc) => (
                            <button
                                key={tc.name}
                                className={`${styles.timeOption} ${selectedTimeControl.name === tc.name ? styles.timeOptionActive : ''
                                    }`}
                                onClick={() => setSelectedTimeControl(tc)}
                            >
                                {tc.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Play Button */}
                <button className={styles.playButton} onClick={handlePlay}>
                    Play
                </button>
            </div>
        </div>
    );
});
