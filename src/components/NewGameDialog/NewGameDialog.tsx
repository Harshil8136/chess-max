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
        <div className={styles.overlay} onClick={onClose}>
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

                {/* ELO Selection (Only vs Computer) */}
                {gameMode === 'vs_computer' && (
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Computer Strength</div>
                    <div className={styles.eloSection}>
                        <div className={styles.eloDisplay}>
                            <span className={styles.eloValue}>{currentElo.elo}</span>
                            <span className={styles.eloName}>{currentElo.name}</span>
                        </div>
                        <input
                            type="range"
                            className={styles.eloSlider}
                            min={0}
                            max={ELO_LEVELS.length - 1}
                            step={1}
                            value={eloIndex}
                            onChange={(e) => setEloIndex(parseInt(e.target.value))}
                        />
                        <div className={styles.eloDesc}>{currentElo.description}</div>
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
