'use client';

import React, { useRef, useEffect } from 'react';
import { Move } from 'chess.js';
import { MoveAnalysis } from '@/hooks/useAnalysis';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import styles from './MoveHistory.module.css';

interface MoveHistoryProps {
    moves: Move[];
    currentIndex: number;
    openingName: string | null;
    onGoToMove: (index: number) => void;
    onGoToFirst: () => void;
    onGoToPrev: () => void;
    onGoToNext: () => void;
    onGoToLast: () => void;
    getMoveClassification?: (index: number, moveColor: 'w' | 'b') => MoveAnalysis | null;
}

export default React.memo(function MoveHistory({
    moves,
    currentIndex,
    openingName,
    onGoToMove,
    onGoToFirst,
    onGoToPrev,
    onGoToNext,
    onGoToLast,
    getMoveClassification,
}: MoveHistoryProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current move
    useEffect(() => {
        if (scrollRef.current) {
            const activeEl = scrollRef.current.querySelector(`.${styles.moveActive}`);
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [currentIndex]);

    // Group moves into pairs (white, black)
    const movePairs: Array<{ number: number; white: Move | null; black: Move | null; whiteIndex: number; blackIndex: number }> = [];
    for (let i = 0; i < moves.length; i += 2) {
        movePairs.push({
            number: Math.floor(i / 2) + 1,
            white: moves[i] || null,
            black: moves[i + 1] || null,
            whiteIndex: i,
            blackIndex: i + 1,
        });
    }

    const getMoveClass = (move: Move | null, index: number): string => {
        let cls = styles.move;
        if (index === currentIndex) cls += ` ${styles.moveActive}`;
        if (move?.san.includes('+') || move?.san.includes('#')) cls += ` ${styles.moveCheck}`;
        else if (move?.captured) cls += ` ${styles.moveCapture}`;
        return cls;
    };

    const renderBadge = (index: number, color: 'w' | 'b') => {
        if (!getMoveClassification) return null;
        const analysis = getMoveClassification(index, color);
        if (!analysis || !analysis.classification) return null;

        switch (analysis.classification) {
            case 'blunder': return <span className={`${styles.badge} ${styles.badgeBlunder}`} title="Blunder">??</span>;
            case 'mistake': return <span className={`${styles.badge} ${styles.badgeMistake}`} title="Mistake">?</span>;
            case 'inaccuracy': return <span className={`${styles.badge} ${styles.badgeInaccuracy}`} title="Inaccuracy">?!</span>;
            case 'best': return <span className={`${styles.badge} ${styles.badgeBest}`} title="Best Move">★</span>;
            case 'excellent': return <span className={`${styles.badge} ${styles.badgeExcellent}`} title="Excellent">!</span>;
            default: return null;
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <span className={styles.openingName}>{openingName || 'Starting Position'}</span>
                <span className={styles.moveCount}>{moves.length} moves</span>
            </div>

            <div className={styles.moves} ref={scrollRef}>
                {moves.length === 0 ? (
                    <div className={styles.empty}>Play a move to begin</div>
                ) : (
                    movePairs.map((pair) => (
                        <div key={pair.number} className={styles.moveRow}>
                            <span className={styles.moveNumber}>{pair.number}.</span>
                            {pair.white && (
                                <span
                                    className={getMoveClass(pair.white, pair.whiteIndex)}
                                    onClick={() => onGoToMove(pair.whiteIndex)}
                                >
                                    {pair.white.san}
                                    {renderBadge(pair.whiteIndex, 'w')}
                                </span>
                            )}
                            {pair.black && (
                                <span
                                    className={getMoveClass(pair.black, pair.blackIndex)}
                                    onClick={() => onGoToMove(pair.blackIndex)}
                                >
                                    {pair.black.san}
                                    {renderBadge(pair.blackIndex, 'b')}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className={styles.controls}>
                <button className="btn btn-icon" onClick={onGoToFirst} title="First move" aria-label="First move"><ChevronsLeft size={18} /></button>
                <button className="btn btn-icon" onClick={onGoToPrev} title="Previous move" aria-label="Previous move"><ChevronLeft size={18} /></button>
                <button className="btn btn-icon" onClick={onGoToNext} title="Next move" aria-label="Next move"><ChevronRight size={18} /></button>
                <button className="btn btn-icon" onClick={onGoToLast} title="Last move" aria-label="Last move"><ChevronsRight size={18} /></button>
            </div>
        </div>
    );
});
