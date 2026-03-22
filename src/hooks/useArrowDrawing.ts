import { useState, useCallback } from 'react';
import { Square } from 'chess.js';

export interface Arrow {
    from: Square;
    to: Square;
    color: string;
}

export interface HighlightedSquare {
    square: Square;
    color: string;
}

export function useArrowDrawing(boardFlipped: boolean, boardRef: React.RefObject<HTMLDivElement | null>) {
    const [arrows, setArrows] = useState<Arrow[]>([]);
    const [highlightedSquares, setHighlightedSquares] = useState<HighlightedSquare[]>([]);
    
    // Internal state for tracking the current drag
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStartSquare, setDrawStartSquare] = useState<Square | null>(null);

    const clearArrows = useCallback(() => {
        setArrows([]);
        setHighlightedSquares([]);
        setIsDrawing(false);
        setDrawStartSquare(null);
    }, []);

    // Color determined by modifier keys (like Lichess/Chess.com)
    // Default: Green
    // Alt/Option: Red
    // Shift: Blue
    // Ctrl/Command: Yellow
    const getColorFromEvent = (e: React.MouseEvent | MouseEvent | React.PointerEvent) => {
        if (e.altKey) return 'var(--accent-red, #f87171)';
        if (e.shiftKey) return 'var(--accent-blue, #60a5fa)';
        if (e.ctrlKey || e.metaKey) return 'var(--accent-yellow, #facc15)';
        return 'var(--accent-green, #4ade80)'; // Default
    };

    const getSquareFromEvent = useCallback((e: React.MouseEvent | MouseEvent | React.PointerEvent): Square | null => {
        if (!boardRef.current) return null;
        
        const rect = boardRef.current.getBoundingClientRect();
        
        // Ensure click is inside the board
        if (e.clientX < rect.left || e.clientX > rect.right || 
            e.clientY < rect.top || e.clientY > rect.bottom) {
            return null;
        }

        const size = rect.width / 8;
        const col = Math.floor((e.clientX - rect.left) / size);
        const row = Math.floor((e.clientY - rect.top) / size);

        // Validation
        if (col < 0 || col > 7 || row < 0 || row > 7) return null;

        const fileIdx = boardFlipped ? 7 - col : col;
        const rankIdx = boardFlipped ? 7 - row : row;

        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        return `${files[fileIdx]}${ranks[rankIdx]}` as Square;
    }, [boardFlipped, boardRef]);

    const onContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); // Prevent standard right-click menu
    }, []);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        // Only react to right-click (button === 2)
        if (e.button !== 2) {
            // Left click clears arrows
            if (e.button === 0) {
                clearArrows();
            }
            return;
        }

        const square = getSquareFromEvent(e);
        if (square) {
            setIsDrawing(true);
            setDrawStartSquare(square);
        }
    }, [getSquareFromEvent, clearArrows]);

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDrawing || e.button !== 2 || !drawStartSquare) {
            setIsDrawing(false);
            setDrawStartSquare(null);
            return;
        }

        const endSquare = getSquareFromEvent(e);
        const color = getColorFromEvent(e);

        if (endSquare) {
            if (endSquare === drawStartSquare) {
                // Clicked on a single square -> Toggle highlight
                setHighlightedSquares(prev => {
                    const exists = prev.find(h => h.square === endSquare);
                    if (exists) {
                        // If it exists with same color, remove it. If different color, update it.
                        if (exists.color === color) {
                            return prev.filter(h => h.square !== endSquare);
                        } else {
                            return prev.map(h => h.square === endSquare ? { square: endSquare, color } : h);
                        }
                    } else {
                        return [...prev, { square: endSquare, color }];
                    }
                });
            } else {
                // Dragged from one square to another -> Toggle arrow
                setArrows(prev => {
                    const exists = prev.find(a => a.from === drawStartSquare && a.to === endSquare);
                    if (exists) {
                         if (exists.color === color) {
                             return prev.filter(a => !(a.from === drawStartSquare && a.to === endSquare));
                         } else {
                             return prev.map(a => (a.from === drawStartSquare && a.to === endSquare) ? { ...a, color } : a);
                         }
                    } else {
                        return [...prev, { from: drawStartSquare, to: endSquare, color }];
                    }
                });
            }
        }

        setIsDrawing(false);
        setDrawStartSquare(null);
    }, [isDrawing, drawStartSquare, getSquareFromEvent]);

    return {
        arrows,
        highlightedSquares,
        clearArrows,
        onContextMenu,
        onPointerDown,
        onPointerUp
    };
}
