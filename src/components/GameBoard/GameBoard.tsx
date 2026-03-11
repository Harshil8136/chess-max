import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Square } from 'chess.js';
import { SettingsState } from '@/hooks/useSettings';
import { getPieceUrl } from './pieceUtils';
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
    onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
    onSquareClick: (args: SquareHandlerArgs) => void;
    boardMatrix: any[][];
    settings: SettingsState;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default React.memo(function GameBoard({
    fen,
    boardFlipped,
    appState,
    gameStatus,
    isPlayerTurn,
    historyIndex,
    historyLength,
    lastMove,
    selectedSquare,
    inCheck,
    turn,
    bestMove,
    legalTargetSquares,
    pendingPremove,
    onPieceDrop,
    onSquareClick,
    boardMatrix,
    settings,
}: GameBoardProps) {
    const boardRef = useRef<HTMLDivElement>(null);

    // Track dragging piece so we can apply z-index elevation correctly during drag
    const [draggingPieceId, setDraggingPieceId] = useState<string | null>(null);

    // Determine if user can interact
    const allowInteraction =
        appState === 'review' ||
        (gameStatus === 'playing' && historyIndex === historyLength - 1);

    // Build the squares grid (8x8)
    const squares = useMemo(() => {
        const grid = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                // If board is flipped, invert ranks and files visually
                const fileIdx = boardFlipped ? 7 - c : c;
                const rankIdx = boardFlipped ? 7 - r : r;

                const file = FILES[fileIdx];
                const rank = RANKS[rankIdx];
                const squareName = `${file}${rank}` as Square;

                // Color pattern: top-left is h1 if flipped (light), a8 if normal (light)
                // (fileIdx + rankIdx) % 2 === 0 means light square
                const isLight = (fileIdx + rankIdx) % 2 === 0;

                const piece = boardMatrix?.[rankIdx]?.[fileIdx];

                grid.push({
                    r,
                    c,
                    fileIdx,
                    rankIdx,
                    squareName,
                    isLight,
                    piece,
                });
            }
        }
        return grid;
    }, [boardFlipped, boardMatrix]);

    // Handle drag end locally to map coordinates back to target square
    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, sourceSquare: Square, pieceInfo: { color: string, type: string }) => {
        setDraggingPieceId(null);

        if (!allowInteraction || !boardRef.current) {
            return;
        }

        const boardRect = boardRef.current.getBoundingClientRect();
        
        // Ensure point is inside the board bounds
        if (
            info.point.x < boardRect.left ||
            info.point.x > boardRect.right ||
            info.point.y < boardRect.top ||
            info.point.y > boardRect.bottom
        ) {
            return; // Dropped outside board
        }

        const size = boardRect.width / 8;
        const col = Math.floor((info.point.x - boardRect.left) / size);
        const row = Math.floor((info.point.y - boardRect.top) / size);

        // Map visual row/col back to logical file/rank based on flip state
        const targetFileIdx = boardFlipped ? 7 - col : col;
        const targetRankIdx = boardFlipped ? 7 - row : row;
        
        // Validate indices
        if (targetFileIdx < 0 || targetFileIdx > 7 || targetRankIdx < 0 || targetRankIdx > 7) return;

        const targetSquareName = `${FILES[targetFileIdx]}${RANKS[targetRankIdx]}` as Square;

        // Same square = treat as click
        if (sourceSquare === targetSquareName) {
            onSquareClick({ piece: { pieceType: pieceInfo.color + pieceInfo.type }, square: sourceSquare });
            return;
        }

        // Drop
        onPieceDrop({
            piece: { isSparePiece: false, position: sourceSquare, pieceType: pieceInfo.color + pieceInfo.type },
            sourceSquare,
            targetSquare: targetSquareName
        });
    };

    return (
        <div 
            className={styles.boardWrapper} 
            ref={boardRef}
            // Inject theme CSS vars so the module.css can read them
            style={{
                '--sq-light': `var(--board-${settings.boardTheme}-light, var(--board-light))`,
                '--sq-dark': `var(--board-${settings.boardTheme}-dark, var(--board-dark))`
            } as React.CSSProperties}
        >
            <div className={styles.grid}>
                {squares.map((sq) => {
                    // Highlights logic
                    const isLastMove = lastMove && (lastMove.from === sq.squareName || lastMove.to === sq.squareName);
                    const isSelected = selectedSquare === sq.squareName;
                    const isPremove = pendingPremove && (pendingPremove.from === sq.squareName || pendingPremove.to === sq.squareName);
                    const isCheck = inCheck && sq.piece?.type === 'k' && sq.piece?.color === turn;
                    
                    // Legal move dots
                    const isLegalMove = settings.showLegalMoves && selectedSquare && legalTargetSquares.includes(sq.squareName);
                    const isCapture = isLegalMove && sq.piece;

                    // Coordinate labels
                    // We render a-h on the bottom row, 1-8 on the left col (adjusted for flip)
                    const showFileLabel = sq.r === 7;
                    const showRankLabel = sq.c === 0;

                    return (
                        <div
                            key={sq.squareName}
                            className={`${styles.square} ${sq.isLight ? styles.squareLight : styles.squareDark}`}
                            onClick={() => {
                                if (allowInteraction) {
                                    onSquareClick({ 
                                        piece: sq.piece ? { pieceType: sq.piece.color + sq.piece.type } : null, 
                                        square: sq.squareName 
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

                            {/* State Highlights (opacity overlays for performance) */}
                            {isLastMove && settings.highlightLastMove && <div className={`${styles.overlay} ${styles.lastMoveOverlay}`} />}
                            {isPremove && <div className={`${styles.overlay} ${styles.premoveOverlay}`} />}
                            {isSelected && <div className={`${styles.overlay} ${styles.selectedOverlay}`} />}
                            {isCheck && <div className={`${styles.overlay} ${styles.checkOverlay}`} />}

                            {/* Legal Move Indicators (Framer Motion pulsating animation) */}
                            {isLegalMove && (
                                <motion.div
                                    animate={{ scale: [0.85, 1.05, 0.85], opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className={isCapture ? styles.legalCaptureDot : styles.legalDot}
                                />
                            )}

                            {/* Best Move Arrow (Review Mode) */}
                            {appState === 'review' && bestMove && bestMove.length >= 4 && 
                             bestMove.substring(0, 2) === sq.squareName && (
                                <svg className={styles.arrowCanvas} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                                    {/* Compute arrow delta manually. Size of square = 100. */}
                                    {(() => {
                                        const endSq = bestMove.substring(2, 4);
                                        const endMatch = squares.find(s => s.squareName === endSq);
                                        if (endMatch) {
                                            const dx = (endMatch.c - sq.c) * 100;
                                            const dy = (endMatch.r - sq.r) * 100;
                                            // Render an SVG arrow from center to center
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
                        </div>
                    );
                })}
            </div>

            {/* Render Pieces using layoutId so Framer Motion animates their moves across squares */}
            {/* We map over pieces rather than squares to decouple them, allowing smooth transitions */}
            <div className={styles.arrowCanvas} style={{ zIndex: 3 }}>
                {squares.map((sq) => {
                    const piece = sq.piece;
                    if (!piece) return null;

                    // Create a unique ID for the piece instance on this square
                    // Warning: chess.js doesn't give us unique piece IDs tracking across moves,
                    // so we use the traditional react-chessboard workaround: keying by the square it's on right now,
                    // but providing layoutId by the piece type to attempt to spring them.
                    
                    // Actually, to get true piece moving animation, we need a stable ID for the piece.
                    // Instead, since it's an 8x8 grid where pieces just appear on squares, 
                    // a simple way is to use layoutId keyed by the standard notation, but because identical pawns exist,
                    // it handles them generically. 
                    // Let's use `${sq.squareName}-${piece.color}${piece.type}` as the unique key,
                    // but `layoutId` only by piece ID if tracking was perfect.
                    // For now, simpler: static keys, using Framer Motion `layout` on the piece wrapper container.

                    const pieceKey = `${sq.squareName}-${piece.color}${piece.type}`;
                    const isDragging = draggingPieceId === pieceKey;
                    
                    return (
                        <div 
                            key={pieceKey}
                            style={{
                                position: 'absolute',
                                width: '12.5%',
                                height: '12.5%',
                                left: `${sq.c * 12.5}%`,
                                top: `${sq.r * 12.5}%`,
                                pointerEvents: isDragging ? 'none' : 'auto',
                                zIndex: isDragging ? 10 : 1,
                            }}
                        >
                            <motion.div
                                layoutId={pieceKey} // We use pieceKey so it transitions from the old position on re-render if we had stable IDs...
                                layout
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                className={`${styles.pieceContainer} ${isDragging ? styles.dragging : ''}`}
                                drag={allowInteraction}
                                dragSnapToOrigin
                                dragElastic={0}
                                onDragStart={() => setDraggingPieceId(pieceKey)}
                                onDragEnd={(e, info) => handleDragEnd(e, info, sq.squareName, piece)}
                                whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
                                onClick={(e) => {
                                    // Let square click handle it, but prevent bubbling issues if needed
                                }}
                            >
                                <img 
                                    src={getPieceUrl(piece.color, piece.type, settings.pieceSet)} 
                                    className={styles.pieceImg} 
                                    alt={`${piece.color} ${piece.type}`} 
                                    draggable={false}
                                />
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
