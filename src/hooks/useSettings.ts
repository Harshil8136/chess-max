'use client';

import { useState, useEffect, useCallback } from 'react';

export type BoardTheme = 'blue' | 'green' | 'brown' | 'purple' | 'slate';

export const PIECE_SETS = [
    'alpha', 'anarcandy', 'caliente', 'california', 'cardinal', 'cburnett',
    'celtic', 'chess7', 'chessnut', 'companion', 'cooke', 'fantasy', 'firi',
    'fresca', 'gioco', 'governor', 'horsey', 'icpieces', 'kiwen-suwi', 'kosal',
    'leipzig', 'letter', 'maestro', 'merida', 'monarchy', 'mpchess', 'pirouetti',
    'pixel', 'rhosgfx', 'riohacha', 'shapes', 'spatial', 'staunty', 'tatiana', 'xkcd',
] as const;

export type PieceSet = typeof PIECE_SETS[number];

export interface SettingsState {
    boardTheme: BoardTheme;
    pieceSet: PieceSet;
    showLegalMoves: boolean;
    highlightLastMove: boolean;
    panicUrl: string;
    soundEnabled: boolean;
    showEvalBar: boolean;
    autoFlipBoard: boolean;
    autoQueenPremove: boolean;
}

const SETTINGS_STORAGE_KEY = 'Y2hlc3NNYXhfc2V0dGluZ3M='; // base64 of 'chessMax_settings'

const defaultSettings: SettingsState = {
    boardTheme: 'blue',
    pieceSet: 'alpha',
    showLegalMoves: true,
    highlightLastMove: true,
    panicUrl: 'https://google.com',
    soundEnabled: true,
    showEvalBar: true,
    autoFlipBoard: false,
    autoQueenPremove: true,
};

export function useSettings() {
    const [settings, setSettingsState] = useState<SettingsState>(defaultSettings);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const savedItem = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (savedItem) {
                const parsed = JSON.parse(savedItem);
                setSettingsState(prev => ({ ...prev, ...parsed }));
            }
        } catch {
            // Ignore parse or quota errors
        }
    }, []);

    // Save exactly one setting
    const updateSetting = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        setSettingsState(prev => {
            const next = { ...prev, [key]: value };
            try {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
            } catch {
                // Ignore
            }
            return next;
        });
    }, []);

    return { settings, updateSetting };
}
