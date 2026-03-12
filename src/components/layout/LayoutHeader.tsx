'use client';

import React from 'react';
import { Home } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

export default React.memo(function LayoutHeader() {
    const { appState, setAppState } = useGame();
    const showHomeButton = appState === 'playing' || appState === 'review';

    return (
        <header className="flex flex-wrap items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-[#262522] border-b border-white/5 shrink-0 z-10 w-full">
            <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl">♟️</span>
                <span className="text-lg md:text-xl font-extrabold text-[#e8e6e3] tracking-tight max-sm:hidden">
                    Chess <span className="text-[#81b64c]">Max</span>
                </span>
            </div>

            {showHomeButton && (
                <button
                    onClick={() => setAppState('welcome')}
                    aria-label="Back to Home"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#989795] bg-[#2a2825] border border-white/5 hover:bg-[#363431] hover:text-white transition-all duration-150"
                >
                    <Home size={16} />
                    <span className="max-sm:hidden">Home</span>
                </button>
            )}
        </header>
    );
});
