import { useEffect } from 'react';

export function useStealthMode(
    appState: string,
    fen: string,
    stockfish: { stopEngine: () => void; requestAnalysis: (fen: string) => void },
    showNewGameDialog: boolean,
    panicUrl: string
) {
    // Panic Button: Double Escape
    useEffect(() => {
        let lastEscapeTime = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                const now = Date.now();
                if (now - lastEscapeTime < 500) {
                    // Trigger panic
                    window.location.replace(panicUrl);
                    return;
                }
                lastEscapeTime = now;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [panicUrl]);

    // Boss Key: Tab Masking
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                document.title = 'Home';
                const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                link.setAttribute('type', 'image/x-icon');
                link.setAttribute('rel', 'shortcut icon');
                // Transparent/empty favicon trick
                link.setAttribute('href', 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>');
                document.head.appendChild(link);

                // Put Stockfish to sleep
                stockfish.stopEngine();
            } else {
                document.title = 'Chess Max — Play Chess vs Computer';
                const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                link.setAttribute('type', 'image/x-icon');
                link.setAttribute('rel', 'shortcut icon');
                link.setAttribute('href', '/icon.svg');
                document.head.appendChild(link);

                // Wake Stockfish if we are in review mode
                if (appState === 'review') {
                    stockfish.requestAnalysis(fen);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [stockfish, appState, fen]);
}
