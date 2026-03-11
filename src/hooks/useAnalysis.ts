import { useState, useCallback } from 'react';
import { MoveClassification } from '@/types/chess';

export interface PositionAnalysis {
    bestMove: string;
    evaluation: number | null; // Normalized: + means White is winning
    mate: number | null;       // Normalized: + means White has mate
}

export interface MoveAnalysis extends PositionAnalysis {
    classification: MoveClassification | null;
    delta: number | null;
}

export interface AccuracyStats {
    whiteAccuracy: number;
    blackAccuracy: number;
    whiteCounts: Record<MoveClassification, number>;
    blackCounts: Record<MoveClassification, number>;
}

const calculateWinProb = (evaluation: number | null, mate: number | null): number => {
    if (mate !== null) {
        return mate > 0 ? 100 : 0;
    }
    if (evaluation !== null) {
        const cp = evaluation * 100;
        return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
    }
    return 50;
};

export function useAnalysis() {
    const [cache, setCache] = useState<Record<number, PositionAnalysis>>({});

    const saveAnalysis = useCallback((index: number, turnAtPosition: 'w' | 'b', rawEval: number | null, rawMate: number | null, bestMove: string) => {
        // UCI engines return score relative to the side to move.
        // Normalize so positive ALWAYS means White is winning.
        const normalizedEval = rawEval !== null ? (turnAtPosition === 'w' ? rawEval : -rawEval) : null;
        const normalizedMate = rawMate !== null ? (turnAtPosition === 'w' ? rawMate : -rawMate) : null;

        setCache(prev => ({
            ...prev,
            [index]: {
                evaluation: normalizedEval,
                mate: normalizedMate,
                bestMove
            }
        }));
    }, []);

    const clearAnalysis = useCallback(() => {
        setCache({});
    }, []);

    const getMoveClassification = useCallback((index: number, moveColor: 'w' | 'b'): MoveAnalysis | null => {
        const after = cache[index];
        const before = cache[index - 1];

        if (!after) return null;

        if (!before) {
            return { ...after, classification: null, delta: null };
        }

        let delta: number | null = null;
        let classification: MoveClassification | null = null;

        if (before.mate !== null && after.mate !== null) {
            // Mate to Mate
            const beforeMate = moveColor === 'w' ? before.mate : -before.mate;
            const afterMate = moveColor === 'w' ? after.mate : -after.mate;

            if (beforeMate > 0 && afterMate < 0) {
                // Had forced mate, now getting mated
                classification = 'blunder';
                delta = -99;
            } else if (beforeMate > 0 && afterMate > 0) {
                // Prolonged or shortened our mate
                delta = 0;
                classification = (afterMate > beforeMate) ? 'inaccuracy' : 'excellent';
            }
        } else if (before.mate !== null && after.evaluation !== null) {
            // Had mate, lost it
            const beforeMate = moveColor === 'w' ? before.mate : -before.mate;
            if (beforeMate > 0) {
                classification = 'blunder'; // Missed win
                delta = -10;
            } else {
                classification = 'excellent'; // Escaped mate (opponent blundered earlier, but this is a good move)
                delta = +10;
            }
        } else if (before.evaluation !== null && after.mate !== null) {
            // Walked into mate
            const afterMate = moveColor === 'w' ? after.mate : -after.mate;
            if (afterMate < 0) {
                classification = 'blunder';
                delta = -99;
            } else {
                classification = 'best'; // Found mate
                delta = +99;
            }
        } else if (before.evaluation !== null && after.evaluation !== null) {
            // Standard eval diff
            const rawDelta = after.evaluation - before.evaluation;
            delta = moveColor === 'w' ? rawDelta : -rawDelta;

            // Classify based on centipawn loss
            if (delta <= -3.0) {
                classification = 'blunder';
            } else if (delta <= -1.0) {
                classification = 'mistake';
            } else if (delta <= -0.5) {
                classification = 'inaccuracy';
            } else if (delta >= -0.1) {
                classification = 'excellent';
            } else {
                classification = 'good';
            }
        }

        return {
            ...after,
            classification,
            delta
        };
    }, [cache]);

    const getAccuracyStats = useCallback((historyTokens: { color: 'w' | 'b' }[]): AccuracyStats | null => {
        if (historyTokens.length === 0) return null;

        let whiteAccSum = 0;
        let whiteMoves = 0;
        let blackAccSum = 0;
        let blackMoves = 0;

        const whiteCounts: Record<MoveClassification, number> = {
            brilliant: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, book: 0, forced: 0
        };
        const blackCounts: Record<MoveClassification, number> = {
            brilliant: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, book: 0, forced: 0
        };

        for (let i = 0; i < historyTokens.length; i++) {
            const color = historyTokens[i].color;
            const moveData = getMoveClassification(i, color);
            
            if (moveData) {
                // Tally classification
                if (moveData.classification) {
                    if (color === 'w') {
                        whiteCounts[moveData.classification] = (whiteCounts[moveData.classification] || 0) + 1;
                    } else {
                        blackCounts[moveData.classification] = (blackCounts[moveData.classification] || 0) + 1;
                    }
                }

                // Calculate Win Probability Loss
                const before = cache[i - 1];
                const after = cache[i];
                if (before && after) {
                    const wpBefore = calculateWinProb(before.evaluation, before.mate);
                    const wpAfter = calculateWinProb(after.evaluation, after.mate);
                    
                    const wpLoss = color === 'w' ? wpBefore - wpAfter : wpAfter - wpBefore;
                    
                    let accuracy = 100;
                    if (wpLoss > 0) {
                        accuracy = 103.1668 * Math.exp(-0.04354 * wpLoss) - 3.1669;
                    }
                    accuracy = Math.max(0, Math.min(100, accuracy));

                    if (color === 'w') {
                        whiteAccSum += accuracy;
                        whiteMoves++;
                    } else {
                        blackAccSum += accuracy;
                        blackMoves++;
                    }
                }
            }
        }

        return {
            whiteAccuracy: whiteMoves > 0 ? whiteAccSum / whiteMoves : 0,
            blackAccuracy: blackMoves > 0 ? blackAccSum / blackMoves : 0,
            whiteCounts,
            blackCounts
        };
    }, [cache, getMoveClassification]);

    return { cache, saveAnalysis, clearAnalysis, getMoveClassification, getAccuracyStats };
}
