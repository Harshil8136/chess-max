import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MoveHistory from '@/components/MoveHistory/MoveHistory';
import InsightPanel from '@/components/InsightPanel/InsightPanel';
import EvaluationGraph from '@/components/EvaluationGraph/EvaluationGraph';
import ReviewStats from '@/components/ReviewStats/ReviewStats';
import { useGame } from '@/contexts/GameContext';
import { Chess } from 'chess.js';

/**
 * A dedicated unified wrapper for the right-hand analytical side.
 * Automatically consumes the GameContext so props don't have to be drilled.
 */
export default function GameSidebar() {
    const { chessGame, analysis, appState, setAppState, stockfish, isAnalysisComplete, analysisProgress } = useGame();
    const { turn } = chessGame;
    
    // Convert raw UCI PV lines to SAN
    const sanMultiPv = useMemo(() => {
        if (!stockfish.multiPv || stockfish.multiPv.length === 0 || !chessGame.fen) return stockfish.multiPv;
        
        return stockfish.multiPv.map(mpv => {
            try {
                // Load the current position to validate moves against
                const tempChess = new Chess(chessGame.fen);
                const moves = mpv.pv.split(' ');
                const sanMoves: string[] = [];
                
                for (let i = 0; i < moves.length && i < 8; i++) { // cap at 8 moves depth for UI
                    const uci = moves[i];
                    if (uci.length < 4) continue;
                    
                    const from = uci.substring(0, 2);
                    const to = uci.substring(2, 4);
                    const promotion = uci.length > 4 ? uci[4] : undefined;
                    
                    try {
                        const result = tempChess.move({ from, to, promotion });
                        if (result) {
                            sanMoves.push(result.san);
                        } else {
                            break;
                        }
                    } catch {
                        break;
                    }
                }
                
                return { ...mpv, pv: sanMoves.length > 0 ? sanMoves.join(' ') : mpv.pv };
            } catch {
                return mpv;
            }
        });
    }, [stockfish.multiPv, chessGame.fen]);

    const handleNextMistake = useCallback(() => {
        for (let i = chessGame.historyIndex + 1; i < chessGame.history.length; i++) {
            const color = i % 2 === 0 ? 'w' : 'b';
            const classif = analysis.getMoveClassification(i, color)?.classification;
            if (classif === 'blunder' || classif === 'mistake' || classif === 'inaccuracy') {
                chessGame.goToMove(i);
                return;
            }
        }
    }, [chessGame.historyIndex, chessGame.history.length, analysis, chessGame]);

    const handlePrevMistake = useCallback(() => {
        for (let i = chessGame.historyIndex - 1; i >= 0; i--) {
            const color = i % 2 === 0 ? 'w' : 'b';
            const classif = analysis.getMoveClassification(i, color)?.classification;
            if (classif === 'blunder' || classif === 'mistake' || classif === 'inaccuracy') {
                chessGame.goToMove(i);
                return;
            }
        }
    }, [chessGame.historyIndex, analysis, chessGame]);

    const handleRetry = useCallback(() => {
        if (chessGame.historyIndex > 0) {
            chessGame.goToMove(chessGame.historyIndex - 1);
        }
        setAppState('playing');
    }, [chessGame, setAppState]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%', height: '100%', minHeight: 0 }}>
            <MoveHistory
                moves={chessGame.history}
                currentIndex={chessGame.historyIndex}
                openingName={chessGame.openingName}
                onGoToMove={chessGame.goToMove}
                onGoToFirst={chessGame.goToFirst}
                onGoToPrev={chessGame.goToPrev}
                onGoToNext={chessGame.goToNext}
                onGoToLast={chessGame.goToLast}
                getMoveClassification={analysis.getMoveClassification}
            />
            {/* InsightPanel lives underneath the move history like standard analysis tools */}
            <InsightPanel
                analysis={analysis.getMoveClassification(
                    chessGame.historyIndex, 
                    turn === 'w' ? 'b' : 'w' // Evaluate the last played move
                )}
                isReviewMode={appState === 'review'}
                turn={turn}
                multiPv={sanMultiPv}
                onRetry={handleRetry}
            />

            {appState === 'review' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                        onClick={handlePrevMistake}
                        style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                        <ChevronLeft size={16} /> Prev Mistake
                    </button>
                    <button 
                        onClick={handleNextMistake}
                        style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                        Next Mistake <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {appState === 'review' && (
                <>
                    <EvaluationGraph
                        analysisCache={analysis.cache}
                        historyLength={chessGame.history.length}
                        currentIndex={chessGame.historyIndex}
                        onGoToMove={chessGame.goToMove}
                        isAnalysisComplete={isAnalysisComplete}
                        analysisProgress={analysisProgress}
                    />
                    {isAnalysisComplete && (
                        <ReviewStats stats={analysis.getAccuracyStats(chessGame.history)} />
                    )}
                </>
            )}
        </div>
    );
}
