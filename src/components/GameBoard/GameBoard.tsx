import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Square } from 'chess.js';
import { SettingsState } from '@/hooks/useSettings';
import { useArrowDrawing } from '@/hooks/useArrowDrawing';
import { getPieceUrl } from './pieceUtils';
import { BoardArrows } from './BoardArrows';
import { InlinePromotionDialog } from './InlinePromotionDialog';
import styles from './GameBoard.module.css';

type PieceDropHandlerArgs = {
    piece: { isSparePiece: boolean; position: string; pieceType: string };
    sourceSquare: string;
    targetSquare: string | null;
};

type SquareHandlerArgs = {
    piece: { pieceType: string } | null;
    square: string;
};

interface GameBoardProps {
    fen: string;
    boardFlipped: boolean;
    appState: 'welcome' | 'loading' | 'playing' | 'review';
    gameStatus: string;
    isPlayerTurn: boolean;
    historyIndex: number;
    historyLength: number;
    lastMove: { from: string; to: string } | null;
    selectedSquare: Square | null;
    inCheck: boolean;
    turn: 'w' | 'b';
    bestMove: string | null;
    legalTargetSquares: string[];
    pendingPremove: { from: Square; to: Square; promotion?: string } | null;
    pendingPromotion: { from: Square; to: Square } | null;
    onPromotionSelect: (piece: string) => void;
    onPromotionCancel: () => void;
    onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
    onSquareClick: (args: SquareHandlerArgs) => void;
    boardMatrix: any[][];
    settings: SettingsState;
    moveClassification?: string | null;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// ─── Detect moved pieces by diffing two board matrices ─────────────────────
interface PieceMove {
    piece: { color: string; type: string };
    fromR: number; fromC: number;
    toR: number; toC: number;
}

function diffBoards(
    prev: any[][] | null,
    curr: any[][],
    boardFlipped: boolean
): PieceMove[] {
    if (!prev) return [];

    const moves: PieceMove[] = [];
    const disappeared: { r: number; c: number; piece: any }[] = [];
    const appeared: { r: number; c: number; piece: any }[] = [];

    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const prevP = prev[rank]?.[file];
            const currP = curr[rank]?.[file];

            const prevKey = prevP ? `${prevP.color}${prevP.type}` : null;
            const currKey = currP ? `${currP.color}${currP.type}` : null;

            if (prevKey && !currKey) {
                // Piece disappeared from this square
                disappeared.push({ r: rank, c: file, piece: prevP });
            } else if (!prevKey && currKey) {
                // Piece appeared on this square
                appeared.push({ r: rank, c: file, piece: currP });
            } else if (prevKey && currKey && prevKey !== currKey) {
                // Different piece now (capture + arrival)
                disappeared.push({ r: rank, c: file, piece: prevP });
                appeared.push({ r: rank, c: file, piece: currP });
            }
        }
    }

    // Match disappeared → appeared by piece type
    for (const app of appeared) {
        const matchIdx = disappeared.findIndex(
            d => d.piece.color === app.piece.color && d.piece.type === app.piece.type
        );
        if (matchIdx !== -1) {
            const dis = disappeared[matchIdx];
            disappeared.splice(matchIdx, 1);

            // Convert board coords (rank/file) to visual coords (r/c for CSS)
            const fromVisual = boardFlipped
                ? { r: 7 - dis.r, c: 7 - dis.c }
                : { r: dis.r, c: dis.c };
            const toVisual = boardFlipped
                ? { r: 7 - app.r, c: 7 - app.c }
                : { r: app.r, c: app.c };

            moves.push({
                piece: app.piece,
                fromR: fromVisual.r,
                fromC: fromVisual.c,
                toR: toVisual.r,
                toC: toVisual.c,
            });
        }
    }

    return moves;
}

// ─── Animated Piece Component ──────────────────────────────────────────────
interface AnimatedPieceProps {
    squareR: number;
    squareC: number;
    piece: { color: string; type: string };
    pieceSet: string;
    allowInteraction: boolean;
    isDragging: boolean;
    onDragStart: () => void;
    onDragEnd: (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
    // Animation: initial offset from source square
    initialOffsetX: number;
    initialOffsetY: number;
    shouldAnimate: boolean;
}

const AnimatedPiece = React.memo(function AnimatedPiece({
    squareR, squareC, piece, pieceSet, allowInteraction,
    isDragging, onDragStart, onDragEnd,
    initialOffsetX, initialOffsetY, shouldAnimate,
}: AnimatedPieceProps) {
    const controls = useAnimation();
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (shouldAnimate && !hasAnimated.current && (initialOffsetX !== 0 || initialOffsetY !== 0)) {
            hasAnimated.current = true;
            // Start at offset, animate to 0
            controls.set({ x: initialOffsetX, y: initialOffsetY });
            controls.start({
                x: 0,
                y: 0,
                transition: {
                    type: 'spring',
                    stiffness: 320,
                    damping: 28,
                    mass: 0.6,
                },
            });
        }
    }, [shouldAnimate, initialOffsetX, initialOffsetY, controls]);

    return (
        <div
            style={{
                position: 'absolute',
                width: '12.5%',
                height: '12.5%',
                left: `${squareC * 12.5}%`,
                top: `${squareR * 12.5}%`,
                pointerEvents: isDragging ? 'none' : 'auto',
                zIndex: isDragging ? 10 : 2,
            }}
        >
            {/* Ghost piece: semi-transparent copy at origin while dragging */}
            {isDragging && (
                <div className={styles.pieceContainer} style={{ opacity: 0.35, filter: 'grayscale(0.3)' }}>
                    <img
                        src={getPieceUrl(piece.color as 'w' | 'b', piece.type, pieceSet)}
                        className={styles.pieceImg}
                        alt=""
                        draggable={false}
                    />
                </div>
            )}

            <motion.div
                animate={controls}
                className={`${styles.pieceContainer} ${isDragging ? styles.pieceDragging : ''}`}
                drag={allowInteraction}
                dragSnapToOrigin
                dragElastic={0.05}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                whileDrag={{
                    scale: 1.15,
                    filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.5))',
                    cursor: 'grabbing',
                }}
            >
                <img
                    src={getPieceUrl(piece.color as 'w' | 'b', piece.type, pieceSet)}
                    className={styles.pieceImg}
                    alt={`${piece.color} ${piece.type}`}
                    draggable={false}
                />
            </motion.div>
        </div>
    );
});

// ─── Main GameBoard Component ──────────────────────────────────────────────
export default React.memo(function GameBoard({
    fen: _fen,
    boardFlipped,
    appState,
    gameStatus,
    isPlayerTurn: _isPlayerTurn,
    historyIndex,
    historyLength,
    lastMove,
    selectedSquare,
    inCheck,
    turn,
    bestMove,
    legalTargetSquares,
    pendingPremove,
    pendingPromotion,
    onPromotionSelect,
    onPromotionCancel,
    onPieceDrop,
    onSquareClick,
    boardMatrix,
    settings,
    moveClassification,
}: GameBoardProps) {
    const boardRef = useRef<HTMLDivElement>(null);

    // Track dragging piece
    const [draggingPieceId, setDraggingPieceId] = useState<string | null>(null);

    // Store previous board for diff-based slide animation
    const prevBoardRef = useRef<any[][] | null>(null);
    const [animatingMoves, setAnimatingMoves] = useState<PieceMove[]>([]);

    // Right-click arrows & highlights
    const { 
        arrows, 
        highlightedSquares, 
        clearArrows, 
        onContextMenu, 
        onPointerDown, 
        onPointerUp 
    } = useArrowDrawing(boardFlipped, boardRef);

    // Diff boards on change to detect piece movements
    useEffect(() => {
        if (prevBoardRef.current && boardMatrix) {
            const moves = diffBoards(prevBoardRef.current, boardMatrix, boardFlipped);
            if (moves.length > 0) {
                setAnimatingMoves(moves);
                // Clear animation state after the spring settles
                const timer = setTimeout(() => setAnimatingMoves([]), 400);
                return () => clearTimeout(timer);
            }
        }
        prevBoardRef.current = boardMatrix;
    }, [boardMatrix, boardFlipped]);

    // Determine if user can interact
    const allowInteraction =
        appState === 'review' ||
        (gameStatus === 'playing' && historyIndex === historyLength - 1);

    // Build the squares grid (8x8)
    const squares = useMemo(() => {
        const grid = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const fileIdx = boardFlipped ? 7 - c : c;
                const rankIdx = boardFlipped ? 7 - r : r;

                const file = FILES[fileIdx];
                const rank = RANKS[rankIdx];
                const squareName = `${file}${rank}` as Square;
                const isLight = (fileIdx + rankIdx) % 2 === 0;
                const piece = boardMatrix?.[rankIdx]?.[fileIdx];

                grid.push({ r, c, fileIdx, rankIdx, squareName, isLight, piece });
            }
        }
        return grid;
    }, [boardFlipped, boardMatrix]);

    // Handle drag end
    const handleDragEnd = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, sourceSquare: Square, pieceInfo: { color: string; type: string }) => {
            setDraggingPieceId(null);

            if (!allowInteraction || !boardRef.current) return;

            const boardRect = boardRef.current.getBoundingClientRect();

            if (
                info.point.x < boardRect.left ||
                info.point.x > boardRect.right ||
                info.point.y < boardRect.top ||
                info.point.y > boardRect.bottom
            ) {
                return;
            }

            const size = boardRect.width / 8;
            const col = Math.floor((info.point.x - boardRect.left) / size);
            const row = Math.floor((info.point.y - boardRect.top) / size);

            const targetFileIdx = boardFlipped ? 7 - col : col;
            const targetRankIdx = boardFlipped ? 7 - row : row;

            if (targetFileIdx < 0 || targetFileIdx > 7 || targetRankIdx < 0 || targetRankIdx > 7) return;

            const targetSquareName = `${FILES[targetFileIdx]}${RANKS[targetRankIdx]}` as Square;

            if (sourceSquare === targetSquareName) {
                clearArrows();
                onSquareClick({ piece: { pieceType: pieceInfo.color + pieceInfo.type }, square: sourceSquare });
                return;
            }

            clearArrows();
            onPieceDrop({
                piece: { isSparePiece: false, position: sourceSquare, pieceType: pieceInfo.color + pieceInfo.type },
                sourceSquare,
                targetSquare: targetSquareName,
            });
        },
        [allowInteraction, boardFlipped, onPieceDrop, onSquareClick]
    );

    // Find animation offset for a piece on a given visual square
    const getAnimationOffset = useCallback(
        (squareR: number, squareC: number, piece: { color: string; type: string }) => {
            if (!boardRef.current) return { x: 0, y: 0, shouldAnimate: false };

            for (const move of animatingMoves) {
                if (
                    move.toR === squareR &&
                    move.toC === squareC &&
                    move.piece.color === piece.color &&
                    move.piece.type === piece.type
                ) {
                    const boardWidth = boardRef.current.getBoundingClientRect().width;
                    const squareSize = boardWidth / 8;
                    const offsetX = (move.fromC - move.toC) * squareSize;
                    const offsetY = (move.fromR - move.toR) * squareSize;
                    return { x: offsetX, y: offsetY, shouldAnimate: true };
                }
            }
            return { x: 0, y: 0, shouldAnimate: false };
        },
        [animatingMoves]
    );

    return (
        <div
            className={styles.boardWrapper}
            ref={boardRef}
            onContextMenu={onContextMenu}
            onPointerDownCapture={onPointerDown} // use Capture phase so pieces don't eat it
            onPointerUpCapture={onPointerUp}
            onPointerLeave={onPointerUp}
            style={{
                '--sq-light': `var(--board-${settings.boardTheme}-light, var(--board-light))`,
                '--sq-dark': `var(--board-${settings.boardTheme}-dark, var(--board-dark))`,
            } as React.CSSProperties}
        >
            {/* Right-click Arrows and Highlights */}
            <BoardArrows arrows={arrows} highlightedSquares={highlightedSquares} boardFlipped={boardFlipped} />

            {/* Square grid layer */}
            <div className={styles.grid}>
                {squares.map((sq) => {
                    const isLastMove = lastMove && (lastMove.from === sq.squareName || lastMove.to === sq.squareName);
                    const isSelected = selectedSquare === sq.squareName;
                    const isPremoveFrom = pendingPremove?.from === sq.squareName;
                    const isPremoveTo = pendingPremove?.to === sq.squareName;
                    const isPremove = isPremoveFrom || isPremoveTo;
                    const isCheck = inCheck && sq.piece?.type === 'k' && sq.piece?.color === turn;
                    const isLegalMove = settings.showLegalMoves && selectedSquare && legalTargetSquares.includes(sq.squareName);
                    const isCapture = isLegalMove && sq.piece;
                    const showFileLabel = sq.r === 7;
                    const showRankLabel = sq.c === 0;

                    return (
                        <div
                            key={sq.squareName}
                            className={`${styles.square} ${sq.isLight ? styles.squareLight : styles.squareDark}`}
                            onClick={() => {
                                clearArrows();
                                if (allowInteraction) {
                                    onSquareClick({
                                        piece: sq.piece ? { pieceType: sq.piece.color + sq.piece.type } : null,
                                        square: sq.squareName,
                                    });
                                }
                            }}
                        >
                            {/* Coordinate Labels */}
                            {showRankLabel && (
                                <div className={`${styles.rankLabel} ${sq.isLight ? styles.labelOnLight : styles.labelOnDark}`}>
                                    {RANKS[sq.rankIdx]}
                                </div>
                            )}
                            {showFileLabel && (
                                <div className={`${styles.fileLabel} ${sq.isLight ? styles.labelOnLight : styles.labelOnDark}`}>
                                    {FILES[sq.fileIdx]}
                                </div>
                            )}

                            {/* State Highlights */}
                            {isLastMove && settings.highlightLastMove && <div className={`${styles.overlay} ${styles.lastMoveOverlay}`} />}
                            {isPremove && <div className={`${styles.overlay} ${styles.premoveOverlay}`} />}
                            {isSelected && <div className={`${styles.overlay} ${styles.selectedOverlay}`} />}
                            {isCheck && <div className={`${styles.overlay} ${styles.checkOverlay}`} />}

                            {/* Legal Move Indicators — static dots (no pulsation) */}
                            {isLegalMove && (
                                <div className={isCapture ? styles.legalCaptureDot : styles.legalDot} />
                            )}

                            {/* Explicit Premove Target Dot */}
                            {isPremoveTo && (
                                <div className={styles.premoveTargetDot} />
                            )}

                            {/* Best Move Arrow (Review Mode) */}
                            {appState === 'review' && bestMove && bestMove.length >= 4 &&
                             bestMove.substring(0, 2) === sq.squareName && (
                                <svg className={styles.arrowCanvas} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                                    {(() => {
                                        const endSq = bestMove.substring(2, 4);
                                        const endMatch = squares.find(s => s.squareName === endSq);
                                        if (endMatch) {
                                            const dx = (endMatch.c - sq.c) * 100;
                                            const dy = (endMatch.r - sq.r) * 100;
                                            return (
                                                <g opacity="0.6">
                                                    <line x1="50" y1="50" x2={50 + dx} y2={50 + dy} stroke="var(--accent-green)" strokeWidth="12" strokeLinecap="round" />
                                                    <circle cx={50 + dx} cy={50 + dy} r="14" fill="var(--accent-green)" />
                                                </g>
                                            );
                                        }
                                        return null;
                                    })()}
                                </svg>
                            )}

                            {/* Classification Badge overlay */}
                            {isLastMove && sq.squareName === lastMove.to && moveClassification && (
                                <div className={`${styles.classificationBadge} ${
                                    moveClassification === 'blunder' ? styles.badgeBlunder :
                                    moveClassification === 'mistake' ? styles.badgeMistake :
                                    moveClassification === 'inaccuracy' ? styles.badgeInaccuracy :
                                    moveClassification === 'good' ? styles.badgeGood :
                                    moveClassification === 'excellent' ? styles.badgeExcellent :
                                    moveClassification === 'best' ? styles.badgeBest :
                                    moveClassification === 'brilliant' ? styles.badgeBrilliant :
                                    moveClassification === 'book' ? styles.badgeBook :
                                    moveClassification === 'forced' ? styles.badgeForced : ''
                                }`}>
                                    {moveClassification === 'blunder' ? '??' :
                                     moveClassification === 'mistake' ? '?' :
                                     moveClassification === 'inaccuracy' ? '?!' :
                                     moveClassification === 'good' ? '✓' :
                                     moveClassification === 'excellent' ? '★' :
                                     moveClassification === 'best' ? '★' :
                                     moveClassification === 'brilliant' ? '!!' :
                                     moveClassification === 'book' ? '📖' :
                                     moveClassification === 'forced' ? '→' : ''}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Piece Layer — absolutely positioned animated pieces */}
            <div className={styles.pieceLayer}>
                {squares.map((sq) => {
                    const piece = sq.piece;
                    if (!piece) return null;

                    const pieceKey = `${sq.squareName}-${piece.color}${piece.type}`;
                    const isDragging = draggingPieceId === pieceKey;
                    const anim = getAnimationOffset(sq.r, sq.c, piece);

                    return (
                        <AnimatedPiece
                            key={pieceKey}
                            squareR={sq.r}
                            squareC={sq.c}
                            piece={piece}
                            pieceSet={settings.pieceSet}
                            allowInteraction={allowInteraction}
                            isDragging={isDragging}
                            onDragStart={() => setDraggingPieceId(pieceKey)}
                            onDragEnd={(e, info) => handleDragEnd(e, info, sq.squareName, piece)}
                            initialOffsetX={anim.x}
                            initialOffsetY={anim.y}
                            shouldAnimate={anim.shouldAnimate}
                        />
                    );
                })}
            </div>

            {/* Inline Promotion Dialog */}
            {pendingPromotion && (
                (() => {
                    const toSquare = pendingPromotion.to;
                    const c = toSquare.charCodeAt(0) - 97; // 'a' = 0
                    const r = 8 - parseInt(toSquare[1]);   // '8' = 0

                    const visualC = boardFlipped ? 7 - c : c;
                    const visualR = boardFlipped ? 7 - r : r;
                    
                    const promotingPieceColor = turn; // Current turn player is the one promoting

                    return (
                        <InlinePromotionDialog
                            color={promotingPieceColor}
                            pieceSet={settings.pieceSet}
                            onSelect={onPromotionSelect}
                            onCancel={onPromotionCancel}
                            squareR={visualR}
                            squareC={visualC}
                        />
                    );
                })()
            )}
        </div>
    );
});
