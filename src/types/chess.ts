import { Chess, Square, Move, Color, PieceSymbol } from 'chess.js';

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

export type GameSettings = {
    playerColor: PlayerColor | 'random';
    eloLevel: EloLevel;
    timeControl: TimeControl;
};

export type MoveWithEval = Move & {
    evaluation?: number;
    classification?: MoveClassification;
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

export type EngineMessage = {
    type: 'init' | 'position' | 'go' | 'stop' | 'eval' | 'setOption' | 'quit';
    fen?: string;
    depth?: number;
    moveTime?: number;
    skillLevel?: number;
    elo?: number;
};

export type EngineResponse = {
    type: 'ready' | 'bestmove' | 'info' | 'error';
    bestMove?: string;
    evaluation?: number;
    depth?: number;
    mate?: number;
    pv?: string;
};

export type { Chess, Square, Move, Color, PieceSymbol };
