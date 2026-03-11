import { PieceSymbol } from 'chess.js';

export type PlayerColor = 'w' | 'b';

export type GameMode = 'vs_computer' | 'pass_and_play';

export type GameStatus =
    | 'idle'
    | 'playing'
    | 'checkmate'
    | 'stalemate'
    | 'draw'
    | 'resigned'
    | 'timeout';

export type GameResult = {
    status: GameStatus;
    winner?: PlayerColor;
    reason?: string;
};

export type EloLevel = {
    elo: number;
    name: string;
    description: string;
    skillLevel: number;
    depth?: number;
    moveTime: number;
};

export type TimeControl = {
    name: string;
    label: string;
    initial: number; // seconds
    increment: number; // seconds
};




export type MoveClassification =
    | 'brilliant'
    | 'best'
    | 'excellent'
    | 'good'
    | 'inaccuracy'
    | 'mistake'
    | 'blunder'
    | 'book'
    | 'forced';

export type CapturedPieces = {
    w: PieceSymbol[];
    b: PieceSymbol[];
};

export type EngineState = 'idle' | 'loading' | 'ready' | 'thinking';

