'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useGameKeyboard } from '@/hooks/useGameKeyboard';
import { getMaterialAdvantage } from '@/lib/engine';
import { soundManager } from '@/lib/sounds';
import { Square } from 'chess.js';
import { PlayerColor } from '@/types/chess';
import { motion, AnimatePresence } from 'framer-motion';

import styles from '@/app/page.module.css';

import LayoutHeader from './LayoutHeader';
import WelcomeScreen from './WelcomeScreen';
import LoadingScreen from './LoadingScreen';
import GameSidebar from './GameSidebar';
import GameBoard from '@/components/GameBoard/GameBoard';
import EvalBar from '@/components/EvalBar/EvalBar';
import PlayerBar from '@/components/PlayerBar/PlayerBar';
import GameControls from '@/components/GameControls/GameControls';
import NewGameDialog from '@/components/NewGameDialog/NewGameDialog';
import GameOverModal from '@/components/GameOverModal/GameOverModal';
import SettingsModal from '@/components/SettingsModal/SettingsModal';
import PromotionDialog from '@/components/PromotionDialog/PromotionDialog';
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
        resign,
        goToFirst,
        goToPrev,
        goToNext,
        goToLast,
        getPgn,
        getFen,
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
    const [toast, setToast] = useState<string | null>(null);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    }, []);

    // Effect to execute pending premove automatically when it becomes the player's turn
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

    const handleCopyPgn = useCallback(() => {
        navigator.clipboard.writeText(getPgn()).then(() => showToast('PGN copied!'));
    }, [getPgn, showToast]);

    const handleCopyFen = useCallback(() => {
        navigator.clipboard.writeText(getFen()).then(() => showToast('FEN copied!'));
    }, [getFen, showToast]);

    // Sync sound setting with global SoundManager
    React.useEffect(() => {
        soundManager.enabled = settingsData.settings.soundEnabled;
    }, [settingsData.settings.soundEnabled]);

    if (appState === 'welcome') {
        return (
            <div className={styles.page}>
                <LayoutHeader 
                    onNewGame={() => setShowNewGameDialog(true)} 
                    onOpenSettings={() => setShowSettings(true)} 
                    onOpenArchive={() => setShowArchive(true)}
                    onOpenHelp={() => setShowHelp(true)}
                />
                <main className={styles.main}>
                    <WelcomeScreen onPlayNow={() => setShowNewGameDialog(true)} />
                </main>
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
            <div className={styles.page}>
                <LayoutHeader 
                    onNewGame={() => setShowNewGameDialog(true)} 
                    onOpenSettings={() => setShowSettings(true)} 
                    onOpenArchive={() => setShowArchive(true)}
                    onOpenHelp={() => setShowHelp(true)}
                />
                <main className={styles.main}>
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
        <div className={styles.page}>
            <LayoutHeader 
                onNewGame={() => setShowNewGameDialog(true)} 
                onOpenSettings={() => setShowSettings(true)} 
                onOpenArchive={() => setShowArchive(true)}
                onOpenHelp={() => setShowHelp(true)}
                controls={
                    <GameControls
                        gameActive={gameStatus === 'playing'}
                        canResign={gameStatus === 'playing' && history.length > 0}
                        soundEnabled={settingsData.settings.soundEnabled}
                        onNewGame={() => setShowNewGameDialog(true)}
                        onResign={resign}
                        onToggleSound={() => settingsData.updateSetting('soundEnabled', !settingsData.settings.soundEnabled)}
                        onFlipBoard={() => setBoardFlipped((prev) => !prev)}
                        onCopyPgn={handleCopyPgn}
                        onCopyFen={handleCopyFen}
                        onOpenImport={() => setShowImporter(true)}
                        isReviewMode={appState === 'review'}
                        onExitReview={() => setShowNewGameDialog(true)}
                        onOpenSettings={() => setShowSettings(true)}
                    />
                }
            />

            <main className={styles.main}>
                <motion.div 
                    className={styles.boardSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    {settingsData.settings.showEvalBar && (
                        <EvalBar
                            evaluation={evaluation}
                            mate={mate}
                            flipped={playerColor === 'b'}
                        />
                    )}

                    <div className={styles.boardColumn}>
                        {/* Top Player Bar */}
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

                        {/* Chess Board */}
                        <div className={styles.boardWrapper}>
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
                                bestMove={stockfish.bestMove}
                                legalTargetSquares={legalTargetSquares}
                                pendingPremove={pendingPremove}
                                onPieceDrop={handlePieceDrop}
                                onSquareClick={handleSquareClick}
                                boardMatrix={boardMatrix}
                                settings={settingsData.settings}
                            />
                        </div>

                        {/* Bottom Player Bar */}
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
                </motion.div>

                {/* Side Panel (Consumes Context automatically) */}
                <motion.div 
                    className={styles.sidePanel}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                >
                    <GameSidebar />
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

            {/* Toast */}
            {toast && <div className={styles.toast}>{toast}</div>}

            {/* Settings Modal */}
            <SettingsModal
                open={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* Promotion Dialog */}
            {pendingPromotion && (
                <PromotionDialog
                    color={playerColor === 'w' ? 'w' : 'b'}
                    onSelect={handlePromotionSelect}
                    onCancel={() => setPendingPromotion(null)}
                />
            )}

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
