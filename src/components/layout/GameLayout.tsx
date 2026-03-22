'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useGameKeyboard } from '@/hooks/useGameKeyboard';
import { getMaterialAdvantage } from '@/lib/engine';
import { soundManager } from '@/lib/sounds';
import { Square } from 'chess.js';
import { PlayerColor } from '@/types/chess';
import { motion } from 'framer-motion';

import WelcomeScreen from './WelcomeScreen';
import LoadingScreen from './LoadingScreen';
import GameSidebar from './GameSidebar';
import { Home } from 'lucide-react'; // Added for floating mobile home button
import GameBoard from '@/components/GameBoard/GameBoard';
import EvalBar from '@/components/EvalBar/EvalBar';
import PlayerBar from '@/components/PlayerBar/PlayerBar';
import NewGameDialog from '@/components/NewGameDialog/NewGameDialog';
import GameOverModal from '@/components/GameOverModal/GameOverModal';
import SettingsModal from '@/components/SettingsModal/SettingsModal';
import GameArchiveBrowser from '@/components/GameArchiveBrowser/GameArchiveBrowser';
import FenImporter from '@/components/FenImporter/FenImporter';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal/KeyboardShortcutsModal';

// Inline types from react-chessboard v5
type PieceDropHandlerArgs = {
    piece: { isSparePiece: boolean; position: string; pieceType: string };
    sourceSquare: string;
    targetSquare: string | null;
};
type SquareHandlerArgs = {
    piece: { pieceType: string } | null;
    square: string;
};

export default function GameLayout() {
    // Consume from global GameContext
    const {
        chessGame,
        stockfish,
        clock,
        eloLevel,
        timeControl,
        boardFlipped,
        appState,
        setBoardFlipped,
        startGame: handleStartGame,
        rematch: handleRematch,
        handleReview,
        setAppState,
        settingsData,
        analysis,
    } = useGame();


    const {
        fen,
        history,
        historyIndex,
        playerColor,
        turn,
        isPlayerTurn,
        gameStatus,
        gameResult,
        capturedPieces,
        lastMove,
        inCheck,
        boardMatrix,
        makeMove,
        goToFirst,
        goToPrev,
        goToNext,
        goToLast,
        isPromotion,
        pendingPremove,
        setPremove,
        clearPremove,
    } = chessGame;

    const { evaluation, mate, isThinking } = stockfish;

    const [showNewGameDialog, setShowNewGameDialog] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showArchive, setShowArchive] = useState(false);
    const [showImporter, setShowImporter] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

    React.useEffect(() => {
        if (
            gameStatus === 'playing' &&
            isPlayerTurn &&
            pendingPremove
        ) {
            // Check if the premove is still pseudo-legal or legal in the new position
            // (chess.js strict validation happens inside makeMove)
            // It's possible the square is no longer valid, or the piece was captured.
            const move = makeMove(pendingPremove.from, pendingPremove.to, pendingPremove.promotion);

            if (move) {
                // Premove succeeded
                setSelectedSquare(null);
                if (timeControl.initial > 0) {
                    clock.switchClock();
                }
            } else {
                // Premove failed (illegal in the new position)
                // Just cancel it and let the player play normally
                // Optional: play an error sound or show toast, but silent cancel is standard
            }
            clearPremove();
        }
    }, [isPlayerTurn, gameStatus, pendingPremove, makeMove, clock, timeControl.initial, clearPremove]);

    useGameKeyboard({
        showNewGameDialog,
        goToFirst,
        goToLast,
        goToNext,
        goToPrev,
        setBoardFlipped,
        onOpenHelp: () => setShowHelp(true),
    });

    const handlePieceDrop = useCallback(
        ({ sourceSquare, targetSquare, piece }: PieceDropHandlerArgs): boolean => {
            if (!targetSquare) return false;
            const isPlaying = gameStatus === 'playing';
            
            // If it's a review, just allow it if it's a valid move (which switches state to playing)
            if (appState === 'review') {
                const move = makeMove(sourceSquare as Square, targetSquare as Square);
                if (move) {
                    setSelectedSquare(null);
                    setAppState('playing');
                    if (timeControl.initial > 0) clock.switchClock();
                    return true;
                }
                return false;
            }

            // Normal playing state
            if (!isPlaying) return false;

            const from = sourceSquare as Square;
            const to = targetSquare as Square;

            // PREMOVE LOGIC: It's the opponent's turn
            if (!isPlayerTurn) {
                // Check if the piece being dragged actually belongs to the player
                const pieceInfo = piece.pieceType; // e.g. "wP", "bK"
                const pieceColor = pieceInfo[0] as PlayerColor;
                
                if (pieceColor === playerColor) {
                    // It's our piece, so queue it as a premove
                    // If it's a promotion, we'll just assume Queen for premoves for simplicity
                    // or we could open the dialog, but standard chess sites auto-queen on premove
                    const isPromote = isPromotion(from, to);
                    if (isPromote && !settingsData.settings.autoQueenPremove) {
                        setPendingPromotion({ from, to });
                        return false;
                    }
                    setPremove({ from, to, promotion: isPromote ? 'q' : undefined });
                    // Return false so react-chessboard snaps it back visually, 
                    // leaving only our CSS highlight in place
                    return false; 
                }
                return false;
            }

            // Normal Move Logic (It's our turn)
            if (isPromotion(from, to)) {
                setPendingPromotion({ from, to });
                return false; // Don't complete the move yet
            }

            const move = makeMove(from, to);
            if (move) {
                setSelectedSquare(null);
                if (timeControl.initial > 0) {
                    clock.switchClock();
                }
                return true;
            }
            return false;
        },
        [isPlayerTurn, gameStatus, appState, setAppState, isPromotion, makeMove, timeControl.initial, clock, playerColor, setPremove, settingsData.settings.autoQueenPremove]
    );

    const handleSquareClick = useCallback(
        ({ square }: SquareHandlerArgs) => {
            const sq = square as Square;
            const isPlaying = gameStatus === 'playing';
            
            // Allow selecting if reviewing, or if playing (even if not our turn, to allow pre-selecting)
            const canSelect = isPlaying || appState === 'review';
            if (!canSelect) return;

            if (selectedSquare) {
                // If we are playing but it's NOT our turn, treat a click-click as a premove attempt
                if (isPlaying && !isPlayerTurn) {
                    const piece = chessGame.game.get(selectedSquare);
                    if (piece && piece.color === playerColor) {
                        const isPromote = isPromotion(selectedSquare, sq);
                        if (isPromote && !settingsData.settings.autoQueenPremove) {
                            setPendingPromotion({ from: selectedSquare, to: sq });
                            setSelectedSquare(null);
                            return;
                        }
                        setPremove({ from: selectedSquare, to: sq, promotion: isPromote ? 'q' : undefined });
                        setSelectedSquare(null);
                        return;
                    }
                    setSelectedSquare(sq); // Just change selection
                    return;
                }

                // Normal turn logic
                // If this is a promotion, show the dialog
                if (isPromotion(selectedSquare, sq)) {
                    setPendingPromotion({ from: selectedSquare, to: sq });
                    setSelectedSquare(null);
                    return;
                }

                const move = makeMove(selectedSquare, sq);
                if (move) {
                    setSelectedSquare(null);
                    if (appState === 'review') {
                        setAppState('playing');
                    }
                    if (timeControl.initial > 0) {
                        clock.switchClock();
                    }
                    return;
                }
            }
            setSelectedSquare(sq);
        },
        [isPlayerTurn, gameStatus, appState, setAppState, selectedSquare, isPromotion, makeMove, timeControl.initial, clock, chessGame.game, playerColor, setPremove, settingsData.settings.autoQueenPremove]
    );

    // Handle the player's promotion choice
    const handlePromotionSelect = useCallback(
        (piece: string) => {
            if (!pendingPromotion) return;

            if (!isPlayerTurn) {
                // It's a premove choice
                setPremove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
                setPendingPromotion(null);
                setSelectedSquare(null);
                return;
            }

            const move = makeMove(pendingPromotion.from, pendingPromotion.to, piece);
            if (move) {
                if (appState === 'review') {
                    setAppState('playing');
                }
                if (timeControl.initial > 0) {
                    clock.switchClock();
                }
            }
            setPendingPromotion(null);
            setSelectedSquare(null);
        },
        [pendingPromotion, makeMove, appState, setAppState, timeControl.initial, clock, isPlayerTurn, setPremove]
    );

    const materialAdv = getMaterialAdvantage(capturedPieces);

    // Compute legal target squares for selected piece (for dot indicators)
    const legalTargetSquares = useMemo(() => {
        if (!selectedSquare) return [];
        try {
            const verboseMoves = chessGame.game.moves({ square: selectedSquare, verbose: true });
            return verboseMoves.map((m: any) => m.to);
        } catch {
            return [];
        }
    }, [selectedSquare, fen, chessGame.game]);

    const isFlipped = boardFlipped;
    const topPlayer = isFlipped ? playerColor : (playerColor === 'w' ? 'b' : 'w');
    const bottomPlayer = isFlipped ? (playerColor === 'w' ? 'b' : 'w') : playerColor;
    const topIsBot = topPlayer !== playerColor;
    const bottomIsBot = bottomPlayer !== playerColor;

    const topCaptured = capturedPieces[topPlayer as 'w' | 'b'];
    const bottomCaptured = capturedPieces[bottomPlayer as 'w' | 'b'];
    const topMaterialAdv = topPlayer === 'w' ? materialAdv : -materialAdv;
    const bottomMaterialAdv = bottomPlayer === 'w' ? materialAdv : -materialAdv;
    const showClock = timeControl.initial > 0;

    const playedMoveColor = historyIndex >= 0 && history[historyIndex] ? history[historyIndex].color : null;
    const moveAnalysis = (appState === 'review' && playedMoveColor && historyIndex >= 0) 
        ? analysis.getMoveClassification(historyIndex + 1, playedMoveColor) 
        : null;
    const moveClassification = moveAnalysis?.classification || null;

    // Sync sound setting with global SoundManager
    React.useEffect(() => {
        soundManager.enabled = settingsData.settings.soundEnabled;
    }, [settingsData.settings.soundEnabled]);

    if (appState === 'welcome') {
        return (
            <div className="min-h-[100dvh] w-full overflow-hidden bg-bg-primary">
                <WelcomeScreen 
                    onPlayNow={() => setShowNewGameDialog(true)} 
                    onQuickPlay={(settings) => {
                        handleStartGame(settings);
                    }}
                />
                <NewGameDialog
                    open={showNewGameDialog}
                    onClose={() => setShowNewGameDialog(false)}
                    onStartGame={handleStartGame}
                />
            </div>
        );
    }

    if (appState === 'loading') {
        return (
            <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-primary">
                <main className="flex flex-col items-center justify-center flex-1 w-full">
                    <LoadingScreen />
                </main>
            </div>
        );
    }

    const isGameOver =
        gameStatus === 'checkmate' ||
        gameStatus === 'stalemate' ||
        gameStatus === 'draw' ||
        gameStatus === 'resigned' ||
        gameStatus === 'timeout';

    return (
        <div className="min-h-[100dvh] flex flex-col overflow-hidden relative">
            
            {/* Ambient Animated Background Layer */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[var(--accent-green)]/15 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-purple,var(--accent-blue))]/15 blur-[140px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
                <div className="absolute -bottom-[20%] left-[15%] w-[50%] h-[50%] rounded-full bg-[var(--accent-orange,var(--accent-red))]/10 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
            </div>

            {/* Mobile Branding & Home Button (Floats above board) */}
            <div className="lg:hidden absolute top-4 left-4 z-50 flex items-center gap-2 drop-shadow-md">
                <span className="text-xl">♟️</span>
                <span className="text-lg font-extrabold text-[#e8e6e3] tracking-tight">
                    Chess <span className="text-[var(--accent-green)]">Max</span>
                </span>
            </div>
            <button
                onClick={() => setAppState('welcome')}
                className="lg:hidden absolute top-2 right-4 z-50 flex items-center justify-center size-10 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-md hover:bg-black/60 transition-colors shadow-lg"
                aria-label="Back to Home"
            >
                <Home size={18} />
            </button>

            {/* pt-16 on mobile gives space for the floating header, perfectly centered on desktop */}
            <main className="flex-1 flex justify-center items-center p-4 pt-16 lg:p-4 gap-4 md:gap-8 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] relative z-10 max-lg:flex-col max-lg:items-center max-lg:max-h-full">
                <motion.div 
                    className="flex gap-2 md:gap-3 items-stretch justify-center w-full max-w-[1240px] shrink-0 max-lg:w-full h-fit flex-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    {/* Eval Bar */}
                    {settingsData.settings.showEvalBar && (
                        <div className="py-[min(6dvh,40px)] flex"> 
                            <EvalBar
                                evaluation={evaluation}
                                mate={mate}
                                flipped={playerColor === 'b'}
                            />
                        </div>
                    )}

                    {/* Arena Container */}
                    <div className="flex flex-col w-[min(80dvh,850px)] max-w-[calc(100vw-400px)] max-lg:max-w-none max-lg:w-[min(85vw,65dvh)] max-sm:w-[min(100vw-16px,100dvh-200px)] relative rounded-2xl overflow-hidden shadow-[var(--shadow-lg,0_8px_32px_rgba(0,0,0,0.5))] border border-[var(--glass-border)] [backdrop-filter:blur(var(--glass-blur,24px))] [-webkit-backdrop-filter:blur(var(--glass-blur,24px))] bg-[var(--glass-bg)] ring-1 ring-white/5 relative group">
                        {/* Subtle theme glow for Arena */}
                        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[var(--shadow-glow-green,none)] opacity-50 transition-opacity duration-700 group-hover:opacity-100 z-10" />
                        {/* Top Player Bar */}
                        <div className="w-full relative z-10 bg-black/40 border-b border-white/5 backdrop-blur-md">
                            <PlayerBar
                                name={topIsBot ? `Stockfish (${eloLevel.name})` : 'You'}
                                elo={topIsBot ? eloLevel.elo : undefined}
                                isBot={topIsBot}
                                isActive={turn === topPlayer}
                                isThinking={topIsBot && isThinking}
                                capturedPieces={topCaptured}
                                capturedColor={topPlayer === 'w' ? 'b' : 'w'}
                                materialAdvantage={Math.max(0, topMaterialAdv)}
                                timeRef={clock.timeRef}
                                playerColor={topPlayer as 'w' | 'b'}
                                showClock={showClock}
                                formatTime={clock.formatTime}
                            />
                        </div>

                        {/* Chess Board */}
                        <div className="w-full aspect-square relative z-0 shadow-inner">
                            <GameBoard
                                fen={fen}
                                boardFlipped={boardFlipped}
                                appState={appState}
                                gameStatus={gameStatus}
                                isPlayerTurn={isPlayerTurn}
                                historyIndex={historyIndex}
                                historyLength={history.length}
                                lastMove={lastMove}
                                selectedSquare={selectedSquare}
                                inCheck={inCheck}
                                turn={turn}
                                bestMove={appState === 'review' ? analysis.cache[historyIndex + 1]?.bestMove ?? null : stockfish.bestMove}
                                moveClassification={moveClassification}
                                legalTargetSquares={legalTargetSquares}
                                pendingPremove={pendingPremove}
                                pendingPromotion={pendingPromotion}
                                onPromotionSelect={handlePromotionSelect}
                                onPromotionCancel={() => setPendingPromotion(null)}
                                onPieceDrop={handlePieceDrop}
                                onSquareClick={handleSquareClick}
                                boardMatrix={boardMatrix}
                                settings={settingsData.settings}
                            />
                        </div>

                        {/* Bottom Player Bar */}
                        <div className="w-full relative z-10 bg-black/40 border-t border-white/5 backdrop-blur-md">
                            <PlayerBar
                                name={bottomIsBot ? `Stockfish (${eloLevel.name})` : 'You'}
                                elo={bottomIsBot ? eloLevel.elo : undefined}
                                isBot={bottomIsBot}
                                isActive={turn === bottomPlayer}
                                isThinking={bottomIsBot && isThinking}
                                capturedPieces={bottomCaptured}
                                capturedColor={bottomPlayer === 'w' ? 'b' : 'w'}
                                materialAdvantage={Math.max(0, bottomMaterialAdv)}
                                timeRef={clock.timeRef}
                                playerColor={bottomPlayer as 'w' | 'b'}
                                showClock={showClock}
                                formatTime={clock.formatTime}
                            />
                        </div>
                    </div>

                    {/* Side Panel (Consumes Context automatically) */}
                    <motion.div 
                        className="w-[clamp(320px,30vw,450px)] flex flex-col shrink-0 bg-[var(--glass-bg)] [backdrop-filter:blur(var(--glass-blur,24px))] [-webkit-backdrop-filter:blur(var(--glass-blur,24px))] rounded-2xl max-h-[90dvh] overflow-hidden max-lg:hidden shadow-[var(--shadow-lg,0_8px_32px_rgba(0,0,0,0.4))] border border-[var(--glass-border)] ring-1 ring-white/5 relative group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    >
                        <GameSidebar 
                            onNewGame={() => setShowNewGameDialog(true)}
                            onOpenSettings={() => setShowSettings(true)}
                            onOpenArchive={() => setShowArchive(true)}
                            onOpenHelp={() => setShowHelp(true)}
                            onGoHome={() => setAppState('welcome')}
                        />
                    </motion.div>
                </motion.div>
            </main>

            {/* Game Over Modal */}
            {isGameOver && gameResult && appState !== 'review' && (
                <GameOverModal
                    result={gameResult}
                    playerColor={playerColor}
                    onRematch={handleRematch}
                    onReview={handleReview}
                    onNewGame={() => {
                        setShowNewGameDialog(true);
                    }}
                />
            )}

            {/* New Game Dialog */}
            <NewGameDialog
                open={showNewGameDialog}
                onClose={() => setShowNewGameDialog(false)}
                onStartGame={handleStartGame}
            />

            {/* Settings Modal */}
            <SettingsModal
                open={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* Game Archive Browser */}
            <GameArchiveBrowser 
                open={showArchive}
                onClose={() => setShowArchive(false)}
            />

            {/* FEN/PGN Importer */}
            <FenImporter 
                open={showImporter}
                onClose={() => setShowImporter(false)}
            />

            {/* Keyboard Shortcuts Help */}
            <KeyboardShortcutsModal 
                open={showHelp}
                onClose={() => setShowHelp(false)}
            />
        </div>
    );
}
