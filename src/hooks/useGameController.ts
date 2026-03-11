import { useState, useCallback, useEffect, useRef } from 'react';
import { PlayerColor, EloLevel, TimeControl, GameMode } from '@/types/chess';
import { useChessGame } from './useChessGame';
import { useStockfish } from './useStockfish';
import { useClock } from './useClock';
import { useAnalysis } from './useAnalysis';
import { useAutoSave, SavedGameState } from './useAutoSave';
import { DEFAULT_ELO, DEFAULT_TIME_CONTROL } from '@/lib/elo';

export interface UseGameControllerReturn {
    // Expose all inner properties needed by UI
    chessGame: ReturnType<typeof useChessGame>;
    stockfish: ReturnType<typeof useStockfish>;
    clock: ReturnType<typeof useClock>;
    analysis: ReturnType<typeof useAnalysis>;

    // Orchestrator State
    gameMode: GameMode;
    eloLevel: EloLevel;
    timeControl: TimeControl;
    boardFlipped: boolean;
    appState: 'welcome' | 'loading' | 'playing' | 'review';

    // Orchestrator Actions
    setEloLevel: React.Dispatch<React.SetStateAction<EloLevel>>;
    setTimeControl: React.Dispatch<React.SetStateAction<TimeControl>>;
    setBoardFlipped: React.Dispatch<React.SetStateAction<boolean>>;
    setAppState: React.Dispatch<React.SetStateAction<'welcome' | 'loading' | 'playing' | 'review'>>;

    isAnalysisComplete: boolean;
    analysisProgress: number;

    startGame: (settings: { gameMode: GameMode; playerColor: PlayerColor; eloLevel: EloLevel; timeControl: TimeControl }) => void;
    rematch: () => void;
    handleReview: () => void;

    // Reacting properties that are forwarded
    pendingGameRef: React.MutableRefObject<any>;
}

export function useGameController(): UseGameControllerReturn {
    // Nested Hooks
    const chessGame = useChessGame('w');
    const stockfish = useStockfish();
    const analysis = useAnalysis();

    // High level settings
    const [gameMode, setGameMode] = useState<GameMode>('vs_computer');
    const [eloLevel, setEloLevel] = useState<EloLevel>(DEFAULT_ELO);
    const [timeControl, setTimeControl] = useState<TimeControl>(DEFAULT_TIME_CONTROL);
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [appState, setAppState] = useState<'welcome' | 'loading' | 'playing' | 'review'>('welcome');
    const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const pendingGameRef = useRef<any>(null);
    const restoreRef = useRef<SavedGameState | null>(null);

    const clock = useClock(timeControl, (color) => {
        // Timeout: the player whose clock hit 0 loses
        const winner = color === 'w' ? 'b' : 'w';
        chessGame.setGameOver({
            status: 'timeout',
            winner: winner as PlayerColor,
            reason: `${color === 'w' ? 'White' : 'Black'} ran out of time`,
        });
    });

    const engineMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastBestMoveRef = useRef<string | null>(null);
    const batchAnalysisStartedRef = useRef(false);

    // --- EFFECT CHAINS MOVED INSIDE THE ORCHESTRATOR ---

    // 1. Best move watcher — when Stockfish returns a best move, play it
    useEffect(() => {
        if (gameMode === 'pass_and_play') return;
        if (
            stockfish.bestMove &&
            stockfish.bestMove !== lastBestMoveRef.current &&
            !chessGame.isPlayerTurn &&
            (chessGame.gameStatus === 'playing' || chessGame.gameStatus === 'idle')
        ) {
            lastBestMoveRef.current = stockfish.bestMove;

            // Add a small delay to feel more natural
            const delay = Math.max(200, Math.random() * 500);
            engineMoveTimeoutRef.current = setTimeout(() => {
                const move = chessGame.makeEngineMove(stockfish.bestMove!);
                if (move && timeControl.initial > 0) {
                    clock.switchClock();
                }
            }, delay);
        }
    }, [stockfish.bestMove, chessGame.isPlayerTurn, chessGame.gameStatus, chessGame, timeControl.initial, clock]);

    // 2. Request engine move when it's the engine's turn
    useEffect(() => {
        if (gameMode === 'pass_and_play') return;
        if (
            !chessGame.isPlayerTurn &&
            (chessGame.gameStatus === 'playing') &&
            stockfish.engineState === 'ready' &&
            chessGame.historyIndex === chessGame.history.length - 1
        ) {
            // Small delay before requesting to feel natural
            const delay = 100;
            const timeout = setTimeout(() => {
                stockfish.requestMove(chessGame.fen, eloLevel);
            }, delay);

            return () => clearTimeout(timeout);
        }
    }, [chessGame.isPlayerTurn, chessGame.gameStatus, stockfish.engineState, chessGame.fen, eloLevel, stockfish, chessGame.historyIndex, chessGame.history.length]);

    // 3. Request evaluation updates — only on player's turn to halve CPU load
    useEffect(() => {
        if (
            stockfish.engineState === 'ready' &&
            chessGame.gameStatus === 'playing' &&
            chessGame.isPlayerTurn &&
            chessGame.historyIndex === chessGame.history.length - 1
        ) {
            // Debounce the eval request so it doesn't choke the engine directly after a move
            const timeout = setTimeout(() => {
                stockfish.requestEval(chessGame.fen);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [chessGame.fen, stockfish.engineState, chessGame.gameStatus, chessGame.isPlayerTurn, chessGame.historyIndex, chessGame.history.length, stockfish]);

    // 4. Cache evaluations in chessGame history snapshots
    useEffect(() => {
        if (stockfish.evalFen && (stockfish.evaluation !== null || stockfish.mate !== null)) {
            chessGame.updateSnapshotEvaluation(stockfish.evalFen, stockfish.evaluation, stockfish.mate);
        }
    }, [stockfish.evalFen, stockfish.evaluation, stockfish.mate, chessGame.updateSnapshotEvaluation]);

    // 5. Initial move triggering for black
    useEffect(() => {
        if (gameMode === 'pass_and_play') return;
        if (
            chessGame.gameStatus === 'playing' &&
            chessGame.playerColor === 'b' &&
            chessGame.history.length === 0 &&
            stockfish.engineState === 'ready'
        ) {
            stockfish.requestMove(chessGame.fen, eloLevel);
        }
    }, [chessGame.gameStatus, chessGame.playerColor, chessGame.history.length, stockfish.engineState, chessGame.fen, eloLevel, stockfish]);

    // Cleanup timeouts
    useEffect(() => {
        return () => {
            if (engineMoveTimeoutRef.current) {
                clearTimeout(engineMoveTimeoutRef.current);
            }
        };
    }, []);

    // Batch Full Game Analysis in review mode
    useEffect(() => {
        // Reset tracking if we leave review mode
        if (appState !== 'review') {
            batchAnalysisStartedRef.current = false;
            setIsAnalysisComplete(false);
            setAnalysisProgress(0);
            return;
        }

        if (appState === 'review' && stockfish.engineState === 'ready' && !batchAnalysisStartedRef.current) {
            batchAnalysisStartedRef.current = true;
            
            // Generate FENs for batch. 
            // 0 is the starting position, 1 is the first move.
            const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            const fens = [initialFen, ...chessGame.historySnapshots.map(s => s.fen)];
            
            // If already empty or only start position, just mark complete
            if (fens.length <= 1) {
                setIsAnalysisComplete(true);
                setAnalysisProgress(100);
                return;
            }

            stockfish.requestBatchAnalysis(fens, (index, data) => {
                const turn = index === 0 ? 'w' : chessGame.historySnapshots[index - 1].turn === 'w' ? 'b' : 'w';
                analysis.saveAnalysis(index, turn, data.evaluation, data.mate, data.bestMove);
                setAnalysisProgress(Math.round(((index + 1) / fens.length) * 100));
            }, () => {
                setIsAnalysisComplete(true);
                setAnalysisProgress(100);
            });
            lastBestMoveRef.current = null;
        }
    }, [appState, stockfish.engineState, chessGame.historySnapshots, stockfish, analysis]);

    // --- GAME INITIALIZATION (SINGLE SOURCE OF TRUTH) ---
    // Watch for stockfish to finish loading, then start the pending game.
    // Handles BOTH fresh starts and auto-resume restores.
    useEffect(() => {
        if (appState === 'loading' && stockfish.engineState === 'ready' && pendingGameRef.current) {
            const settings = pendingGameRef.current;

            // Clear the pending configuration
            pendingGameRef.current = null;

            // Apply settings to Stockfish
            stockfish.configureElo(settings.eloLevel);

            // Check if this is a restore from auto-save
            if (restoreRef.current) {
                const state = restoreRef.current;
                restoreRef.current = null;

                // Restore the exact board position with full move history
                chessGame.restoreGame(state.fen, state.playerColor, state.pgn);
                setAppState('playing');

                // Restore clock times
                if (state.timeControl.initial > 0) {
                    clock.resetClock(state.timeControl);
                    clock.timeRef.current.w = state.whiteTime;
                    clock.timeRef.current.b = state.blackTime;
                    clock.startClock(state.turn);
                }

                // If it's the engine's turn, request a move
                if ((state.turn === 'w' && state.playerColor === 'b') ||
                    (state.turn === 'b' && state.playerColor === 'w')) {
                    stockfish.requestMove(state.fen, state.eloLevel);
                }
            } else {
                // Fresh new game start
                chessGame.newGame(settings.playerColor);
                setAppState('playing');

                if (settings.timeControl.initial > 0) {
                    clock.resetClock(settings.timeControl);
                    clock.startClock('w');
                }
            }
        }
    }, [appState, stockfish.engineState, stockfish, chessGame, clock]);

    // --- ACTIONS ---

    const startGame = useCallback(
        (settings: { gameMode: GameMode; playerColor: PlayerColor; eloLevel: EloLevel; timeControl: TimeControl }) => {
            setGameMode(settings.gameMode);
            setEloLevel(settings.eloLevel);
            setTimeControl(settings.timeControl);
            setBoardFlipped(settings.playerColor === 'b');
            lastBestMoveRef.current = null;

            if (stockfish.engineState === 'idle' || stockfish.engineState === 'loading') {
                // Engine not ready yet — store settings and show loading
                setAppState('loading');
                pendingGameRef.current = settings;
                if (stockfish.engineState === 'idle') {
                    stockfish.initEngine();
                }
            } else {
                // Engine already ready — start immediately
                chessGame.newGame(settings.playerColor);
                setAppState('playing');
                if (settings.timeControl.initial > 0) {
                    clock.resetClock(settings.timeControl);
                    clock.startClock('w');
                }
            }
        },
        [stockfish.engineState, stockfish, chessGame, clock]
    );

    const rematch = useCallback(() => {
        lastBestMoveRef.current = null;
        chessGame.newGame(chessGame.playerColor);
        if (timeControl.initial > 0) {
            clock.resetClock(timeControl);
            clock.startClock('w');
        }
    }, [chessGame, timeControl, clock]);

    const handleReview = useCallback(() => {
        setAppState('review');
    }, []);

    // Wire auto-save/resume functionality
    useAutoSave({
        gameStatus: chessGame.gameStatus,
        fen: chessGame.fen,
        playerColor: chessGame.playerColor,
        eloLevel,
        timeControl,
        clock,
        turn: chessGame.turn,
        engineState: stockfish.engineState,
        setEloLevel,
        setTimeControl,
        setBoardFlipped,
        setAppState,
        pendingGameRef,
        restoreRef,
        initEngine: stockfish.initEngine,
        getPgn: chessGame.getPgn,
    });

    return {
        chessGame,
        stockfish,
        clock,
        analysis,
        gameMode,
        eloLevel,
        timeControl,
        boardFlipped,
        appState,
        isAnalysisComplete,
        analysisProgress,
        setEloLevel,
        setTimeControl,
        setBoardFlipped,
        setAppState,
        startGame,
        rematch,
        handleReview,
        pendingGameRef
    };
}
