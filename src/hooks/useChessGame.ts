'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Chess, Move, Square, PieceSymbol } from 'chess.js';
import { PlayerColor, GameStatus, GameResult, CapturedPieces } from '@/types/chess';
import { identifyOpening } from '@/lib/openings';
import { soundManager } from '@/lib/sounds';

export interface UseChessGameReturn {
    game: Chess;
    fen: string;
    history: Move[];
    historyIndex: number;
    playerColor: PlayerColor;
    turn: 'w' | 'b';
    isPlayerTurn: boolean;
    gameStatus: GameStatus;
    gameResult: GameResult | null;
    capturedPieces: CapturedPieces;
    lastMove: { from: Square; to: Square } | null;
    inCheck: boolean;
    openingName: string | null;
    legalMoves: string[];
    boardMatrix: ReturnType<Chess['board']>;
    pendingPremove: { from: Square; to: Square; promotion?: string } | null;

    makeMove: (from: Square, to: Square, promotion?: string) => Move | null;
    makeEngineMove: (moveStr: string) => Move | null;
    setPosition: (fen: string) => void;
    restoreGame: (savedFen: string, savedColor: PlayerColor, savedPgn?: string) => void;
    newGame: (playerColor: PlayerColor) => void;
    
    // Evaluation persistence
    historySnapshots: {fen: string; inCheck: boolean; turn: 'w' | 'b'; evaluation?: number | null; mate?: number | null}[];
    updateSnapshotEvaluation: (fen: string, evaluation: number | null, mate: number | null) => void;

    // Actions
    resign: () => void;
    setGameOver: (result: GameResult) => void;
    goToMove: (index: number) => void;
    goToFirst: () => void;
    goToPrev: () => void;
    goToNext: () => void;
    goToLast: () => void;
    getPgn: () => string;
    getFen: () => string;
    isPromotion: (from: Square, to: Square) => boolean;
    setPremove: (premove: { from: Square; to: Square; promotion?: string } | null) => void;
    clearPremove: () => void;
}

export function useChessGame(initialColor: PlayerColor = 'w'): UseChessGameReturn {
    const gameRef = useRef(new Chess());
    const [fen, setFen] = useState(gameRef.current.fen());
    const [history, setHistory] = useState<Move[]>([]);
    const [historySnapshots, setHistorySnapshots] = useState<{fen: string; inCheck: boolean; turn: 'w' | 'b'; evaluation?: number | null; mate?: number | null}[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [playerColor, setPlayerColor] = useState<PlayerColor>(initialColor);
    const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
    const [pendingPremove, setPendingPremove] = useState<{ from: Square; to: Square; promotion?: string } | null>(null);

    const [turn, setTurn] = useState<'w' | 'b'>(gameRef.current.turn() as 'w' | 'b');
    const [inCheck, setInCheck] = useState<boolean>(gameRef.current.isCheck());
    const [legalMoves, setLegalMoves] = useState<string[]>(gameRef.current.moves());

    const isPlayerTurn = turn === playerColor;

    // Memoize board matrix keyed on FEN — avoids creating new 8x8 array on every render
    // Use a new instance rather than gameRef because gameRef handles live play
    const boardMatrix = useMemo(() => {
        try {
            return new Chess(fen).board();
        } catch {
            return gameRef.current.board();
        }
    }, [fen]);

    const capturedPieces = useMemo((): CapturedPieces => {
        const captured: CapturedPieces = { w: [], b: [] };
        for (const move of history) {
            if (move.captured) {
                // captured piece belongs to the opponent of who moved
                const capturedBy = move.color;
                captured[capturedBy].push(move.captured as PieceSymbol);
            }
        }
        // Sort by piece value
        const order: Record<string, number> = { q: 0, r: 1, b: 2, n: 3, p: 4 };
        captured.w.sort((a, b) => (order[a] ?? 5) - (order[b] ?? 5));
        captured.b.sort((a, b) => (order[a] ?? 5) - (order[b] ?? 5));
        return captured;
    }, [history]);

    const openingName = useMemo(() => {
        if (history.length === 0) return null;
        const sanMoves = history.map((m) => m.san);
        return identifyOpening(sanMoves);
    }, [history]);

    const checkGameEnd = useCallback((chess: Chess) => {
        if (chess.isCheckmate()) {
            const winner = chess.turn() === 'w' ? 'b' : 'w';
            setGameStatus('checkmate');
            setGameResult({
                status: 'checkmate',
                winner: winner as PlayerColor,
                reason: 'Checkmate',
            });
            soundManager.play('gameEnd');
            return true;
        }
        if (chess.isStalemate()) {
            setGameStatus('stalemate');
            setGameResult({ status: 'stalemate', reason: 'Stalemate' });
            soundManager.play('gameEnd');
            return true;
        }
        if (chess.isDraw()) {
            setGameStatus('draw');
            let reason = 'Draw';
            if (chess.isThreefoldRepetition()) reason = 'Draw by repetition';
            else if (chess.isInsufficientMaterial()) reason = 'Insufficient material';
            setGameResult({ status: 'draw', reason });
            soundManager.play('gameEnd');
            return true;
        }
        return false;
    }, []);

    const playMoveSound = useCallback((move: Move) => {
        if (move.san.includes('+')) {
            soundManager.play('check');
        } else if (move.san === 'O-O' || move.san === 'O-O-O') {
            soundManager.play('castle');
        } else if (move.captured) {
            soundManager.play('capture');
        } else if (move.flags.includes('p')) {
            soundManager.play('promote');
        } else {
            soundManager.play('move');
        }
    }, []);

    const makeMove = useCallback(
        (from: Square, to: Square, promotion?: string): Move | null => {
            if (gameStatus !== 'playing' && gameStatus !== 'idle') return null;

            const chess = gameRef.current;
            try {
                // If we are operating in the past, truncate history (branching)
                if (historyIndex < history.length - 1) {
                    while (chess.history().length > historyIndex + 1) {
                        chess.undo();
                    }
                }

                const move = chess.move({ from, to, promotion: (promotion || 'q') as 'q' | 'r' | 'b' | 'n' });
                if (move) {
                    const newFen = chess.fen();
                    const newTurn = chess.turn();
                    const newInCheck = chess.isCheck();

                    setFen(newFen);
                    setTurn(newTurn);
                    setInCheck(newInCheck);
                    setLegalMoves(chess.moves());

                    const newHistory = chess.history({ verbose: true });
                    setHistory(newHistory);
                    
                    const newSnapshot = { fen: newFen, inCheck: newInCheck, turn: newTurn };
                    setHistorySnapshots(prev => [...prev.slice(0, historyIndex + 1), newSnapshot]);
                    setHistoryIndex(newHistory.length - 1);
                    
                    setLastMove({ from, to });
                    setGameStatus('playing');
                    playMoveSound(move);
                    checkGameEnd(chess);
                    return move;
                }
            } catch {
                soundManager.play('illegal');
            }
            return null;
        },
        [gameStatus, checkGameEnd, playMoveSound, historyIndex, history.length]
    );

    const makeEngineMove = useCallback(
        (moveStr: string): Move | null => {
            if (gameStatus !== 'playing' && gameStatus !== 'idle') return null;

            const chess = gameRef.current;
            try {
                // If we are operating in the past, truncate history (branching)
                if (historyIndex < history.length - 1) {
                    while (chess.history().length > historyIndex + 1) {
                        chess.undo();
                    }
                }

                const from = moveStr.substring(0, 2) as Square;
                const to = moveStr.substring(2, 4) as Square;
                const promotion = moveStr.length > 4 ? moveStr[4] : undefined;

                const move = chess.move({ from, to, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined });
                if (move) {
                    const newFen = chess.fen();
                    const newTurn = chess.turn();
                    const newInCheck = chess.isCheck();

                    setFen(newFen);
                    setTurn(newTurn);
                    setInCheck(newInCheck);
                    setLegalMoves(chess.moves());

                    const newHistory = chess.history({ verbose: true });
                    setHistory(newHistory);

                    const newSnapshot = { fen: newFen, inCheck: newInCheck, turn: newTurn };
                    setHistorySnapshots(prev => [...prev.slice(0, historyIndex + 1), newSnapshot]);
                    setHistoryIndex(newHistory.length - 1);
                    
                    setLastMove({ from, to });
                    playMoveSound(move);
                    checkGameEnd(chess);
                    return move;
                }
            } catch {
                // Invalid engine move
            }
            return null;
        },
        [gameStatus, checkGameEnd, playMoveSound, historyIndex, history.length]
    );

    const isPromotion = useCallback(
        (from: Square, to: Square): boolean => {
            const piece = gameRef.current.get(from);
            if (!piece || piece.type !== 'p') return false;
            const rank = to[1];
            return (piece.color === 'w' && rank === '8') || (piece.color === 'b' && rank === '1');
        },
        []
    );

    const setPosition = useCallback((newFen: string) => {
        gameRef.current.load(newFen);
        setFen(newFen);
        setTurn(gameRef.current.turn());
        setInCheck(gameRef.current.isCheck());
        setLegalMoves(gameRef.current.moves());
        setHistory([]);
        setHistorySnapshots([]);
        setHistoryIndex(-1);
        setLastMove(null);
        checkGameEnd(gameRef.current);
    }, [checkGameEnd]);

    const updateSnapshotEvaluation = useCallback((fen: string, evalValue: number | null, mateValue: number | null) => {
        setHistorySnapshots(prev => {
            const index = prev.findIndex(s => s.fen === fen);
            if (index === -1) return prev;
            // Only update if changed to avoid unnecessary re-renders
            if (prev[index].evaluation === evalValue && prev[index].mate === mateValue) return prev;
            const newSnapshots = [...prev];
            newSnapshots[index] = { ...newSnapshots[index], evaluation: evalValue, mate: mateValue };
            return newSnapshots;
        });    
    }, []);

    const restoreGame = useCallback(
        (savedFen: string, savedColor: PlayerColor, savedPgn?: string) => {
            const chess = gameRef.current;

            // Try to reconstruct full history from PGN
            if (savedPgn) {
                try {
                    chess.reset();
                    chess.loadPgn(savedPgn);

                    const fullHistory = chess.history({ verbose: true });
                    const snapshots: {fen: string; inCheck: boolean; turn: 'w' | 'b'; evaluation?: number | null; mate?: number | null}[] = [];

                    // Rebuild snapshots by replaying moves
                    const replayChess = new Chess();
                    for (const move of fullHistory) {
                        replayChess.move(move.san);
                        snapshots.push({
                            fen: replayChess.fen(),
                            inCheck: replayChess.isCheck(),
                            turn: replayChess.turn() as 'w' | 'b',
                        });
                    }

                    setFen(chess.fen());
                    setTurn(chess.turn());
                    setInCheck(chess.isCheck());
                    setLegalMoves(chess.moves());
                    setHistory(fullHistory);
                    setHistorySnapshots(snapshots);
                    setHistoryIndex(fullHistory.length - 1);
                    setPlayerColor(savedColor);
                    setGameStatus('playing');
                    setGameResult(null);
                    setLastMove(fullHistory.length > 0
                        ? { from: fullHistory[fullHistory.length - 1].from, to: fullHistory[fullHistory.length - 1].to }
                        : null
                    );
                    return;
                } catch {
                    // PGN parse failed, fall through to FEN-only restore
                }
            }

            // FEN-only restore (no history available)
            chess.load(savedFen);
            setFen(chess.fen());
            setTurn(chess.turn());
            setInCheck(chess.isCheck());
            setLegalMoves(chess.moves());
            setHistory([]);
            setHistorySnapshots([]);
            setHistoryIndex(-1);
            setPlayerColor(savedColor);
            setGameStatus('playing');
            setGameResult(null);
            setLastMove(null);
        },
        []
    );

    const newGame = useCallback(
        (color: PlayerColor) => {
            const chess = gameRef.current;
            chess.reset();
            setFen(chess.fen());
            setTurn(chess.turn());
            setInCheck(chess.isCheck());
            setLegalMoves(chess.moves());
            
            setHistory([]);
            setHistorySnapshots([]);
            setHistoryIndex(-1);
            setPlayerColor(color);
            setGameStatus('playing');
            setGameResult(null);
            setLastMove(null);
            setPendingPremove(null);
            soundManager.play('gameStart');
        },
        []
    );

    const resign = useCallback(() => {
        const winner = playerColor === 'w' ? 'b' : 'w';
        setGameStatus('resigned');
        setGameResult({
            status: 'resigned',
            winner: winner as PlayerColor,
            reason: `${playerColor === 'w' ? 'White' : 'Black'} resigned`,
        });
        soundManager.play('gameEnd');
    }, [playerColor]);

    const setGameOver = useCallback((result: GameResult) => {
        setGameStatus(result.status);
        setGameResult(result);
        soundManager.play('gameEnd');
    }, []);

    const goToMove = useCallback(
        (index: number) => {
            if (index < -1 || index >= history.length) return;
            setHistoryIndex(index);

            if (index === -1) {
                const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
                setFen(startFen);
                setTurn('w');
                setInCheck(false);
                setLastMove(null);
            } else {
                const snap = historySnapshots[index];
                if (snap) {
                    setFen(snap.fen);
                    setTurn(snap.turn);
                    setInCheck(snap.inCheck);
                    setLastMove({ from: history[index].from, to: history[index].to });
                }
            }
        },
        [history.length, history, historySnapshots]
    );

    const goToFirst = useCallback(() => goToMove(-1), [goToMove]);
    const goToPrev = useCallback(() => goToMove(historyIndex - 1), [goToMove, historyIndex]);
    const goToNext = useCallback(() => goToMove(historyIndex + 1), [goToMove, historyIndex]);
    const goToLast = useCallback(
        () => goToMove(history.length - 1),
        [goToMove, history.length]
    );

    const getPgn = useCallback(() => gameRef.current.pgn(), []);
    const getFen = useCallback(() => fen, [fen]);

    return {
        game: gameRef.current,
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
        openingName,
        legalMoves,
        boardMatrix,
        pendingPremove,
        makeMove,
        makeEngineMove,
        setPosition,
        restoreGame,
        newGame,
        resign,
        setGameOver,
        goToMove,
        goToFirst,
        goToPrev,
        goToNext,
        goToLast,
        getPgn,
        getFen,
        isPromotion,
        historySnapshots,
        updateSnapshotEvaluation,
        setPremove: setPendingPremove,
        clearPremove: useCallback(() => setPendingPremove(null), []),
    };
}
