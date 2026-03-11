'use client';

import React, { createContext, useContext } from 'react';
import { useGameController } from '@/hooks/useGameController';
import { useStealthMode } from '@/hooks/useStealthMode';
import { useSettings } from '@/hooks/useSettings';
import { useGameArchive } from '@/hooks/useGameArchive';

type ControllerType = ReturnType<typeof useGameController>;
type SettingsType = ReturnType<typeof useSettings>;
type ArchiveType = ReturnType<typeof useGameArchive>;

// We infer the return type of the controller and settings
type GameContextType = ControllerType & {
    settingsData: SettingsType;
    archiveData: ArchiveType;
};

const GameContext = createContext<GameContextType | null>(null);

/**
 * Provides the global orchestrated chess logic to all child components.
 * Eliminates massive prop-drilling down from page.tsx.
 * Stealth mode (panic button, tab masking) is instantiated here so it's
 * always active regardless of which screen (welcome/loading/playing) is shown.
 */
export function GameProvider({ children }: { children: React.ReactNode }) {
    // Instantiate exactly one global controller for the entire board session
    const gameController = useGameController();
    const settingsData = useSettings();
    const archiveData = useGameArchive();

    // Auto-save game to archive when finished
    React.useEffect(() => {
        const status = gameController.chessGame.gameStatus;
        if (['checkmate', 'stalemate', 'draw', 'resigned', 'timeout'].includes(status)) {
            const historyLength = gameController.chessGame.history.length;
            if (historyLength > 0) {
                archiveData.saveGame({
                    playerColor: gameController.chessGame.playerColor,
                    opponentElo: gameController.gameMode === 'vs_computer' ? gameController.eloLevel.elo : 0,
                    opponentName: gameController.gameMode === 'vs_computer' 
                        ? `Stockfish (${gameController.eloLevel.name})` 
                        : 'Local Player',
                    result: status as any,
                    pgn: gameController.chessGame.getPgn(),
                    movesCount: Math.ceil(historyLength / 2),
                });
            }
        }
    }, [
        gameController.chessGame.gameStatus, 
        gameController.chessGame.history.length, 
        gameController.chessGame.playerColor, 
        gameController.eloLevel, 
        gameController.chessGame, 
        archiveData.saveGame
    ]);

    // Auto-flip board in Pass & Play mode
    React.useEffect(() => {
        if (
            gameController.gameMode === 'pass_and_play' && 
            settingsData.settings.autoFlipBoard &&
            gameController.chessGame.gameStatus === 'playing'
        ) {
            gameController.setBoardFlipped(gameController.chessGame.turn === 'b');
        }
    }, [
        gameController.gameMode, 
        settingsData.settings.autoFlipBoard, 
        gameController.chessGame.turn,
        gameController.chessGame.gameStatus, 
        gameController.setBoardFlipped
    ]);

    // Stealth mode must be active on ALL screens — not just during gameplay
    // using the panic URL from settings
    useStealthMode(
        gameController.appState,
        gameController.chessGame.fen,
        gameController.stockfish,
        false, // showNewGameDialog is irrelevant for stealth behavior
        settingsData.settings.panicUrl
    );

    const contextValue: GameContextType = {
        ...gameController,
        settingsData,
        archiveData,
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
}

/**
 * Custom hook to consume the global game state from anywhere in the component tree.
 */
export function useGame(): GameContextType {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
