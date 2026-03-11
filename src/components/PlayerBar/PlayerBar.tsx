'use client';

import React from 'react';
import { PieceSymbol } from 'chess.js';
import styles from './PlayerBar.module.css';
import { PIECE_VALUES } from '@/lib/engine';

const PIECE_UNICODE: Record<string, Record<string, string>> = {
    w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

interface PlayerBarProps {
    name: string;
    elo?: number;
    isBot?: boolean;
    isActive?: boolean;
    isThinking?: boolean;
    capturedPieces: PieceSymbol[];
    capturedColor: 'w' | 'b'; // the color of pieces captured (opponent's color)
    materialAdvantage: number;
    timeRef?: React.MutableRefObject<{ w: number; b: number }>;
    playerColor: 'w' | 'b';
    showClock?: boolean;
    formatTime?: (s: number) => string;
}

export default React.memo(function PlayerBar({
    name,
    elo,
    isBot = false,
    isActive = false,
    isThinking = false,
    capturedPieces,
    capturedColor,
    materialAdvantage,
    timeRef,
    playerColor,
    showClock = false,
    formatTime,
}: PlayerBarProps) {
    const materialDisplay = materialAdvantage > 0 ? `+${materialAdvantage}` : '';

    // Local display time decoupled from VDOM tree
    const [displayTime, setDisplayTime] = React.useState<number | undefined>(
        timeRef ? timeRef.current[playerColor] : undefined
    );

    // Update display time visually
    React.useEffect(() => {
        if (!showClock || !timeRef) return;

        // Initial sync on mount/change
        setDisplayTime(timeRef.current[playerColor]);

        // Keep local display smooth
        const interval = setInterval(() => {
            setDisplayTime(timeRef.current[playerColor]);
        }, 100);

        return () => clearInterval(interval);
    }, [showClock, timeRef, playerColor, isActive]);

    const isLowTime = displayTime !== undefined && displayTime < 30;

    return (
        <div className={`${styles.playerBar} ${isActive ? styles.active : ''}`}>
            {/* Avatar */}
            <div className={`${styles.avatar} ${isBot ? styles.avatarBot : styles.avatarHuman}`}>
                {isBot ? '🤖' : '👤'}
            </div>

            {/* Info Container */}
            <div className={styles.info}>
                <div className={styles.nameRow}>
                    <span className={styles.name}>{name}</span>
                    {elo !== undefined && <span className={styles.elo}>{elo}</span>}
                    {isThinking && (
                        <span className={styles.thinking}>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                        </span>
                    )}
                </div>

                {/* Captured Pieces & Advantage */}
                <div className={styles.materialRow}>
                    {capturedPieces.length > 0 && (
                        <span className={styles.capturedPieces}>
                            {capturedPieces.map((piece, i) => (
                                <span key={i} className={styles.capturedPiece}>
                                    {PIECE_UNICODE[capturedColor]?.[piece] || piece}
                                </span>
                            ))}
                        </span>
                    )}
                    {materialAdvantage > 0 && (
                        <span className={styles.materialAdvantage}>{materialDisplay}</span>
                    )}
                </div>
            </div>

            {/* Clock */}
            {showClock && displayTime !== undefined && formatTime && (
                <div
                    className={`${styles.clock} ${
                        isActive ? styles.clockActive : styles.clockInactive
                    } ${isLowTime ? styles.clockLow : ''}`}
                >
                    {formatTime(displayTime)}
                </div>
            )}
        </div>
    );
});
