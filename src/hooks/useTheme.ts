import { useState, useEffect, useCallback } from 'react';

export type ThemeName = 'default' | 'midnight' | 'stealth';

// Obfuscated storage key — base64 of 'chessMax_theme'
const THEME_STORAGE_KEY = 'Y2hlc3NNYXhfdGhlbWU=';

export function useTheme() {
    const [theme, setThemeState] = useState<ThemeName>('default');

    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName;
            if (savedTheme && ['default', 'midnight', 'stealth'].includes(savedTheme)) {
                setThemeState(savedTheme);
                document.documentElement.setAttribute('data-theme', savedTheme);
            } else {
                document.documentElement.setAttribute('data-theme', 'default');
            }
        } catch {
            // Ignore quota/storage errors
        }
    }, []);

    const setTheme = useCallback((newTheme: ThemeName) => {
        setThemeState(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch {
            // Ignore
        }
    }, []);

    const cycleTheme = useCallback(() => {
        setThemeState((currentTheme) => {
            const nextTheme: Record<ThemeName, ThemeName> = {
                'default': 'midnight',
                'midnight': 'stealth',
                'stealth': 'default',
            };
            const toSet = nextTheme[currentTheme];
            
            document.documentElement.setAttribute('data-theme', toSet);
            try {
                localStorage.setItem(THEME_STORAGE_KEY, toSet);
            } catch {
                // Ignore
            }
            return toSet;
        });
    }, []);

    return { theme, setTheme, cycleTheme };
}
