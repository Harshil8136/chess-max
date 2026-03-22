import { Arrow, HighlightedSquare } from '@/hooks/useArrowDrawing';

interface BoardArrowsProps {
    arrows: Arrow[];
    highlightedSquares: HighlightedSquare[];
    boardFlipped: boolean;
}

function squareToXY(squareName: string, boardFlipped: boolean): { x: number; y: number } {
    const fileIdx = squareName.charCodeAt(0) - 97; // 'a' = 0
    const rank = parseInt(squareName[1]);
    const rankIdx = 8 - rank; // '8' = 0, '1' = 7

    const visualC = boardFlipped ? 7 - fileIdx : fileIdx;
    const visualR = boardFlipped ? 7 - rankIdx : rankIdx;

    // Return percentage coordinates (center of the square)
    return {
        x: (visualC * 12.5) + 6.25,
        y: (visualR * 12.5) + 6.25
    };
}

export function BoardArrows({ arrows, highlightedSquares, boardFlipped }: BoardArrowsProps) {
    if (arrows.length === 0 && highlightedSquares.length === 0) {
        return null;
    }

    // Need unique colors for markers
    const uniqueArrowColors = Array.from(new Set(arrows.map(a => a.color)));

    return (
        <svg 
            style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%', 
                pointerEvents: 'none', 
                zIndex: 4 
            }}
        >
            <defs>
                {uniqueArrowColors.map(color => (
                    <marker
                        key={`arrowhead-${color}`}
                        id={`arrowhead-${color.replace(/[^\w-]/g, '')}`}
                        markerWidth="4"
                        markerHeight="3"
                        refX="2.5"
                        refY="1.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 4 1.5, 0 3" fill={color} />
                    </marker>
                ))}
            </defs>

            {/* Render highlighted squares */}
            {highlightedSquares.map((h, i) => {
                const { x, y } = squareToXY(h.square, boardFlipped);
                return (
                    <rect
                        key={`highlight-${h.square}-${i}`}
                        x={`${x - 6.25}%`}
                        y={`${y - 6.25}%`}
                        width="12.5%"
                        height="12.5%"
                        fill={h.color}
                        opacity={0.5}
                    />
                );
            })}

            {/* Render arrows */}
            {arrows.map((a, i) => {
                const fromXY = squareToXY(a.from, boardFlipped);
                const toXY = squareToXY(a.to, boardFlipped);

                // Calculate geometry to shrink the line slightly so it points *at* the center, not past it
                const dx = toXY.x - fromXY.x;
                const dy = toXY.y - fromXY.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Shrink distance by 3% to fit the arrowhead nicely
                const shrinkFactor = (distance - 3.5) / distance;
                const adjToX = fromXY.x + (dx * shrinkFactor);
                const adjToY = fromXY.y + (dy * shrinkFactor);

                return (
                    <line
                        key={`arrow-${a.from}-${a.to}-${i}`}
                        x1={`${fromXY.x}%`}
                        y1={`${fromXY.y}%`}
                        x2={`${adjToX}%`}
                        y2={`${adjToY}%`}
                        stroke={a.color}
                        strokeWidth="1.8%"
                        strokeLinecap="round"
                        opacity={0.8}
                        markerEnd={`url(#arrowhead-${a.color.replace(/[^\w-]/g, '')})`}
                    />
                );
            })}
        </svg>
    );
}
