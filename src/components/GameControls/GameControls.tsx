'use client';

import React from 'react';
import { Plus, Flag, RefreshCcw, Volume2, VolumeX, ClipboardCopy, Hash, Settings, LogOut, FileDown } from 'lucide-react';
import styles from './GameControls.module.css';

interface GameControlsProps {
    gameActive: boolean;
    canResign: boolean;
    soundEnabled: boolean;
    onNewGame: () => void;
    onResign?: () => void;
    canUndo?: boolean;
    onUndo?: () => void;
    onToggleSound: () => void;
    onFlipBoard: () => void;
    onCopyPgn: () => void;
    onCopyFen: () => void;
    onOpenImport?: () => void;
    isReviewMode?: boolean;
    onExitReview?: () => void;
    onOpenSettings?: () => void;
}

export default React.memo(function GameControls({
    gameActive,
    canResign,
    soundEnabled,
    onNewGame,
    onResign,
    canUndo,
    onUndo,
    onToggleSound,
    onFlipBoard,
    onCopyPgn,
    onCopyFen,
    onOpenImport,
    isReviewMode = false,
    onExitReview,
    onOpenSettings,
}: GameControlsProps) {
    if (isReviewMode) {
        return (
            <div className={styles.commandDeckWrapper}>
                <div className={styles.commandDeck}>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', background: 'var(--accent-blue)', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
                        onClick={onExitReview}
                    >
                        <LogOut size={16} /> Exit Review
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.commandDeckWrapper}>
            <div className={styles.commandDeck}>
                <button className="btn btn-icon" onClick={onNewGame} title="New Game" aria-label="New Game">
                    <Plus size={18} />
                </button>

                {canUndo && onUndo && (
                    <button className="btn btn-icon" onClick={onUndo} title="Undo Move" aria-label="Undo Move">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                    </button>
                )}

                {canResign && gameActive && (
                    <button className="btn btn-icon" onClick={onResign} title="Resign" aria-label="Resign" style={{ color: 'var(--accent-red)' }}>
                        <Flag size={18} />
                    </button>
                )}

                <div className={styles.separator} />

                <button className="btn btn-icon" onClick={onFlipBoard} title="Flip Board" aria-label="Flip Board">
                    <RefreshCcw size={18} />
                </button>

                <button className="btn btn-icon" onClick={onToggleSound} title={soundEnabled ? 'Mute' : 'Unmute'} aria-label={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}>
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                <div className={styles.separator} />

                <button className={`btn btn-icon ${styles.hideOnMobile}`} onClick={onCopyPgn} title="Copy PGN" aria-label="Copy PGN">
                    <ClipboardCopy size={18} />
                </button>

                <button className={`btn btn-icon ${styles.hideOnMobile}`} onClick={onCopyFen} title="Copy FEN" aria-label="Copy FEN">
                    <Hash size={18} />
                </button>

                {onOpenImport && (
                    <button className={`btn btn-icon ${styles.hideOnMobile}`} onClick={onOpenImport} title="Import Game" aria-label="Import Game" style={{ marginLeft: 'auto', color: 'var(--accent-blue)' }}>
                        <FileDown size={18} />
                    </button>
                )}

                {onOpenSettings && (
                    <>
                        <div className={styles.separator} />
                        <button className="btn btn-icon" onClick={onOpenSettings} title="Settings" aria-label="Settings">
                            <Settings size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});
