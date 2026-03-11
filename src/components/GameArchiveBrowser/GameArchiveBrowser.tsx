'use client';

import React from 'react';
import { X, Search, Trash2, RotateCcw } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import styles from './GameArchiveBrowser.module.css';

interface GameArchiveBrowserProps {
    open: boolean;
    onClose: () => void;
}

export default function GameArchiveBrowser({ open, onClose }: GameArchiveBrowserProps) {
    const { archiveData, chessGame, setAppState } = useGame();
    const { archivedGames, deleteGame, clearArchive } = archiveData;

    if (!open) return null;

    const handleReview = (pgn: string, color: 'w' | 'b') => {
        chessGame.restoreGame('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', color, pgn);
        setAppState('review');
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Game Archive</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close Archive">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    {archivedGames.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Search size={48} className={styles.emptyIcon} />
                            <p>No completed games yet.</p>
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Opponent</th>
                                        <th>Result</th>
                                        <th>Moves</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archivedGames.map((game) => (
                                        <tr key={game.id}>
                                            <td>{new Date(game.date).toLocaleDateString()}</td>
                                            <td>
                                                <div className={styles.opponent}>
                                                    <span className={styles.colorIndicator} style={{ backgroundColor: game.playerColor === 'w' ? '#fff' : '#000', border: '1px solid #666' }} />
                                                    {game.opponentName}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.resultBadge} ${styles[game.result] || ''}`}>
                                                    {game.result}
                                                </span>
                                            </td>
                                            <td>{game.movesCount}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                        onClick={() => handleReview(game.pgn, game.playerColor)}
                                                        title="Review Game"
                                                    >
                                                        <RotateCcw size={14} style={{ marginRight: '4px' }} />
                                                        Review
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-danger"
                                                        style={{ width: '28px', height: '28px' }}
                                                        onClick={() => deleteGame(game.id)}
                                                        title="Delete Game"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {archivedGames.length > 0 && (
                    <div className={styles.footer}>
                        <button className="btn btn-secondary" onClick={clearArchive}>
                            <Trash2 size={16} /> Clear All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
