'use client';

import { useState } from 'react';
import { X, Upload, Hash, FileText } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Chess } from 'chess.js';
import styles from './FenImporter.module.css';

interface FenImporterProps {
    open: boolean;
    onClose: () => void;
}

export default function FenImporter({ open, onClose }: FenImporterProps) {
    const { chessGame, setAppState } = useGame();
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const handleImport = () => {
        setError(null);
        const trimmed = input.trim();
        
        if (!trimmed) {
            setError('Please enter a FEN or PGN string.');
            return;
        }

        const isPgn = trimmed.startsWith('[') || trimmed.includes('1. ');
        const chess = new Chess();

        try {
            if (isPgn) {
                // Try parsing as PGN
                chess.loadPgn(trimmed);
                // We use restoreGame to handle the history reconstruction properly
                chessGame.restoreGame(chess.fen(), 'w', trimmed);
            } else {
                // Try parsing as FEN
                chess.load(trimmed);
                chessGame.setPosition(trimmed);
            }
            
            // Go to review mode when importing games
            setAppState('review');
            setInput('');
            onClose();
        } catch (e) {
            setError('Invalid format. Could not parse the FEN or PGN string.');
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Import Game</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close Importer">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    <p className={styles.description}>
                        Paste a FEN string to load a specific position, or a PGN string to load a full game with move history.
                    </p>
                    
                    <div className={styles.formatHints}>
                        <div className={styles.hint}>
                            <Hash size={14} className={styles.hintIcon} />
                            <span><strong>FEN:</strong> e.g., <code className={styles.code}>rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</code></span>
                        </div>
                        <div className={styles.hint}>
                            <FileText size={14} className={styles.hintIcon} />
                            <span><strong>PGN:</strong> e.g., <code className={styles.code}>1. e4 e5 2. Nf3 Nc6</code></span>
                        </div>
                    </div>

                    <textarea
                        className={styles.textarea}
                        placeholder="Paste FEN or PGN here..."
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setError(null);
                        }}
                        rows={8}
                        autoFocus
                    />
                    
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleImport}
                        disabled={!input.trim()}
                    >
                        <Upload size={16} /> Load Game
                    </button>
                </div>
            </div>
        </div>
    );
}
