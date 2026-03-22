import { Chess, PieceSymbol } from 'chess.js';

export interface PositionalHealth {
    centerControl: number;
    kingSafety: number;
    activity: number;
    space: number;
    material: number;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0
};

// Center squares and extended center
const CENTER_SQUARES = ['d4', 'e4', 'd5', 'e5'];
const EXTENDED_CENTER = ['c3', 'd3', 'e3', 'f3', 'c4', 'f4', 'c5', 'f5', 'c6', 'd6', 'e6', 'f6'];

/**
 * Normalizes a value between min and max to a 0-100 scale.
 */
function normalize(val: number, min: number, max: number): number {
    return Math.max(0, Math.min(100, Math.round(((val - min) / (max - min)) * 100)));
}

/**
 * Evaluates the board position and returns 0-100 scores for 5 strategic axes.
 */
export function calculatePositionalHealth(fen: string): { white: PositionalHealth, black: PositionalHealth, maxActivity: number } {
    const defaultHealth: PositionalHealth = { centerControl: 50, kingSafety: 50, activity: 50, space: 50, material: 50 };
    
    try {
        const chess = new Chess(fen);
        const board = chess.board();

        let wMaterial = 0, bMaterial = 0;
        let wSpace = 0, bSpace = 0;
        let wCenter = 0, bCenter = 0;

        // Scan the board for material, space, and simple center occupancy
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    const val = PIECE_VALUES[piece.type];
                    
                    // The standard algebraic square name
                    const file = String.fromCharCode('a'.charCodeAt(0) + c);
                    const rank = 8 - r;
                    const sq = `${file}${rank}`;

                    if (piece.color === 'w') {
                        wMaterial += val;
                        wSpace += (8 - r); // White pieces advanced further down (lower r index) give more space
                        if (CENTER_SQUARES.includes(sq)) wCenter += 3;
                        if (EXTENDED_CENTER.includes(sq)) wCenter += 1;
                    } else {
                        bMaterial += val;
                        bSpace += (r + 1); // Black pieces advanced (higher r index) give more space
                        if (CENTER_SQUARES.includes(sq)) bCenter += 3;
                        if (EXTENDED_CENTER.includes(sq)) bCenter += 1;
                    }
                }
            }
        }

        // --- 1. Material (0-100 based on diff up to +10/-10) ---
        const matDiff = wMaterial - bMaterial;
        const wMaterialScore = normalize(matDiff, -9, 9);
        const bMaterialScore = normalize(-matDiff, -9, 9);

        // --- 2. Space (Rough approximation based on piece advancement) ---
        // Typical starting space is around 40-50, pushed can go up to 100.
        const wSpaceScore = normalize(wSpace, 40, 120);
        const bSpaceScore = normalize(bSpace, 40, 120);

        // --- 3. Center Control (Occupancy + Attack approximations) ---
        // True center control needs move generation, but occupancy + a base score is lightweight.
        const wCenterScore = normalize(wCenter, 0, 12);
        const bCenterScore = normalize(bCenter, 0, 12);

        // --- 4. Activity (Number of legal moves) ---
        const currentTurn = chess.turn();
        const currentMoves = chess.moves().length;
        let opponentMoves = 20; // Default guess

        // Swap turn in FEN to count opponent pseudo moves
        try {
            const fenParts = chess.fen().split(' ');
            fenParts[1] = currentTurn === 'w' ? 'b' : 'w';
            fenParts[3] = '-'; // clear en-passant 
            const altChess = new Chess(fenParts.join(' '));
            opponentMoves = altChess.moves().length;
        } catch (e) {
            // Ignore if fen manipulation fails due to rare edge cases (like missing kings)
        }

        const wActivity = currentTurn === 'w' ? currentMoves : opponentMoves;
        const bActivity = currentTurn === 'b' ? currentMoves : opponentMoves;
        const maxActivity = Math.max(wActivity, bActivity, 30); // Dynamic bounding

        const wActivityScore = normalize(wActivity, 0, 45); 
        const bActivityScore = normalize(bActivity, 0, 45);

        // --- 5. King Safety (Simple heuristic based on castling and immediate pawn shields) ---
        // We will do a generic 50-80 base safety, degrading if king is highly exposed or center.
        let wKingSafety = 70;
        let bKingSafety = 70;
        
        // Very basic: Kings still in center (files d,e) after move 10 face a penalty
        const fullMoves = chess.moveNumber();
        if (fullMoves > 8) {
             // Find kings
             const wKingSq = findPiece(board, 'k', 'w');
             const bKingSq = findPiece(board, 'k', 'b');

             if (wKingSq && (wKingSq.includes('d') || wKingSq.includes('e'))) wKingSafety -= 30;
             if (bKingSq && (bKingSq.includes('d') || bKingSq.includes('e'))) bKingSafety -= 30;
        }

        return {
            white: {
                centerControl: wCenterScore,
                kingSafety: normalize(wKingSafety, 0, 100),
                activity: wActivityScore,
                space: wSpaceScore,
                material: wMaterialScore
            },
            black: {
                centerControl: bCenterScore,
                kingSafety: normalize(bKingSafety, 0, 100),
                activity: bActivityScore,
                space: bSpaceScore,
                material: bMaterialScore
            },
            maxActivity
        };

    } catch (err) {
        console.error("Heuristic calculation failed:", err);
        return { white: defaultHealth, black: defaultHealth, maxActivity: 40 };
    }
}

function findPiece(board: any[][], type: string, color: string): string | null {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === type && p.color === color) {
                const file = String.fromCharCode('a'.charCodeAt(0) + c);
                const rank = 8 - r;
                return `${file}${rank}`;
            }
        }
    }
    return null;
}
