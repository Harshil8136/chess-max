'use client';

import React from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameLayout from '@/components/layout/GameLayout';

/**
 * The Root Entry Point for Chess Max.
 * The entire application logic is encapsulated inside the global GameProvider context.
 */
export default function Home() {
    return (
        <GameProvider>
            <GameLayout />
        </GameProvider>
    );
}
