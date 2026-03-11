'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlayerColor, GameStatus } from '@/types/chess';

export interface ArchivedGame {
    id: string;
    date: number;
    playerColor: PlayerColor;
    opponentElo: number;
    opponentName: string;
    result: GameStatus; // checkmate, stalemate, draw, resigned, timeout
    pgn: string;
    movesCount: number;
}

const ARCHIVE_STORAGE_KEY = 'Y2hlc3NNYXhfYXJjaGl2ZQ=='; // base64 of 'chessMax_archive'

export function useGameArchive() {
    const [archivedGames, setArchivedGames] = useState<ArchivedGame[]>([]);

    useEffect(() => {
        try {
            const savedItem = localStorage.getItem(ARCHIVE_STORAGE_KEY);
            if (savedItem) {
                setArchivedGames(JSON.parse(savedItem));
            }
        } catch {
            // Ignore parse errors
        }
    }, []);



    const saveGame = useCallback((game: Omit<ArchivedGame, 'id' | 'date'>) => {
        // Prevent saving empty games
        if (game.movesCount === 0) return;

        setArchivedGames(prev => {
            // Basic deduplication: if exact same PGN and result as the last saved game, do not save again
            if (prev.length > 0) {
                const last = prev[0];
                if (last.pgn === game.pgn && last.result === game.result) {
                    return prev;
                }
            }

            const newGame: ArchivedGame = {
                ...game,
                id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                date: Date.now(),
            };
            const next = [newGame, ...prev].slice(0, 100); // keep last 100 games
            
            try {
                localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(next));
            } catch {
                // Ignore
            }
            return next;
        });
    }, []);

    const deleteGame = useCallback((id: string) => {
        setArchivedGames(prev => {
            const next = prev.filter(g => g.id !== id);
            try {
                localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(next));
            } catch {
                // Ignore
            }
            return next;
        });
    }, []);

    const clearArchive = useCallback(() => {
        setArchivedGames([]);
        localStorage.removeItem(ARCHIVE_STORAGE_KEY);
    }, []);

    return {
        archivedGames,
        saveGame,
        deleteGame,
        clearArchive
    };
}
