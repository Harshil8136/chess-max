'use client';

import React from 'react';
import styles from './GameOverModal.module.css';
import { GameResult, PlayerColor } from '@/types/chess';
import { useGame } from '@/contexts/GameContext';
import EvaluationGraph from '@/components/EvaluationGraph/EvaluationGraph';
import { PositionAnalysis } from '@/hooks/useAnalysis';

interface GameOverModalProps {
    result: GameResult;
    playerColor: PlayerColor;
    onRematch: () => void;
    onNewGame: () => void;
    onReview: () => void;
}

export default React.memo(function GameOverModal({
    result,
    playerColor,
    onRematch,
    onNewGame,
    onReview,
}: GameOverModalProps) {
    const { chessGame: { historySnapshots } } = useGame();
    const isPlayerWin = result.winner === playerColor;
    const isDraw = !result.winner;

    const fakeAnalysisCache = React.useMemo(() => {
        const cache: Record<number, PositionAnalysis> = {};
        cache[0] = { evaluation: 0.0, mate: null, bestMove: '' };
        historySnapshots.forEach((snap, i) => {
            cache[i + 1] = { evaluation: snap.evaluation ?? null, mate: snap.mate ?? null, bestMove: '' };
        });
        return cache;
    }, [historySnapshots]);

    let icon = '🤝';
    let title = 'Draw';
    let titleClass = styles.winnerDraw;

    if (result.status === 'checkmate') {
        if (isPlayerWin) {
            icon = '🏆';
            title = 'You Win!';
            titleClass = styles.winnerWin;
        } else {
            icon = '😞';
            title = 'You Lost';
            titleClass = styles.winnerLose;
        }
    } else if (result.status === 'resigned') {
        if (isPlayerWin) {
            icon = '🏳️';
            title = 'You Win!';
            titleClass = styles.winnerWin;
        } else {
            icon = '🏳️';
            title = 'You Resigned';
            titleClass = styles.winnerLose;
        }
    } else if (result.status === 'timeout') {
        if (isPlayerWin) {
            icon = '⏱️';
            title = 'You Win!';
            titleClass = styles.winnerWin;
        } else {
            icon = '⏱️';
            title = 'Time Out';
            titleClass = styles.winnerLose;
        }
    } else if (isDraw) {
        icon = '🤝';
        title = 'Draw';
        titleClass = styles.winnerDraw;
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.icon}>{icon}</div>
                <div className={styles.result}>Game Over</div>
                <div className={`${styles.winner} ${titleClass}`}>{title}</div>
                <div className={styles.reason}>{result.reason}</div>

                {historySnapshots.length > 0 && (
                    <div className={styles.graphContainer}>
                        <EvaluationGraph 
                            analysisCache={fakeAnalysisCache}
                            historyLength={historySnapshots.length}
                            currentIndex={historySnapshots.length}
                            onGoToMove={() => {}}
                            isAnalysisComplete={true}
                            analysisProgress={100}
                            compact={true}
                        />
                    </div>
                )}

                <div className={styles.actions}>
                    <button className={styles.rematchBtn} onClick={onRematch}>
                        Rematch
                    </button>
                    <button className={styles.reviewBtn} onClick={onReview}>
                        Review Game
                    </button>
                    <button className={styles.newGameBtn} onClick={onNewGame}>
                        New Game
                    </button>
                </div>
            </div>
        </div>
    );
});
