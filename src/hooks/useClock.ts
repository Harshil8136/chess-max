'use client';

import { useCallback, useRef, useEffect } from 'react';
import { TimeControl } from '@/types/chess';

export interface UseClockReturn {
    timeRef: React.MutableRefObject<{ w: number; b: number }>;
    isRunningRef: React.MutableRefObject<boolean>;
    activeColorRef: React.MutableRefObject<'w' | 'b' | null>;

    startClock: (color: 'w' | 'b') => void;
    switchClock: () => void;
    pauseClock: () => void;
    resetClock: (timeControl: TimeControl) => void;
    formatTime: (seconds: number) => string;
}

export function useClock(
    timeControl: TimeControl,
    onTimeout?: (color: 'w' | 'b') => void
): UseClockReturn {
    const timeRef = useRef<{ w: number; b: number }>({ w: timeControl.initial, b: timeControl.initial });
    const isRunningRef = useRef(false);
    const activeColorRef = useRef<'w' | 'b' | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastTickRef = useRef<number>(0);

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startClock = useCallback(
        (color: 'w' | 'b') => {
            // Unlimited time control
            if (timeControl.initial === 0) return;

            clearTimer();
            activeColorRef.current = color;
            isRunningRef.current = true;
            lastTickRef.current = performance.now();

            intervalRef.current = setInterval(() => {
                const now = performance.now();
                const elapsed = (now - lastTickRef.current) / 1000;
                lastTickRef.current = now;

                if (color === 'w') {
                    timeRef.current.w = Math.max(0, timeRef.current.w - elapsed);
                    if (timeRef.current.w <= 0) {
                        clearTimer();
                        isRunningRef.current = false;
                        onTimeout?.('w');
                    }
                } else {
                    timeRef.current.b = Math.max(0, timeRef.current.b - elapsed);
                    if (timeRef.current.b <= 0) {
                        clearTimer();
                        isRunningRef.current = false;
                        onTimeout?.('b');
                    }
                }
            }, 100);
        },
        [timeControl.initial, clearTimer, onTimeout]
    );

    const switchClock = useCallback(() => {
        const isRunning = isRunningRef.current;
        const activeColor = activeColorRef.current;

        if (!isRunning || !activeColor || timeControl.initial === 0) return;

        // Add increment to the player who just moved
        if (activeColor === 'w') {
            timeRef.current.w += timeControl.increment;
        } else {
            timeRef.current.b += timeControl.increment;
        }

        const newColor = activeColor === 'w' ? 'b' : 'w';
        clearTimer();
        startClock(newColor);
    }, [timeControl, clearTimer, startClock]);

    const pauseClock = useCallback(() => {
        clearTimer();
        isRunningRef.current = false;
    }, [clearTimer]);

    const resetClock = useCallback(
        (tc: TimeControl) => {
            clearTimer();
            timeRef.current = { w: tc.initial, b: tc.initial };
            isRunningRef.current = false;
            activeColorRef.current = null;
        },
        [clearTimer]
    );

    const formatTime = useCallback((seconds: number): string => {
        if (seconds <= 0) return '0:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const tenths = Math.floor((seconds * 10) % 10);

        if (seconds < 10) {
            return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return clearTimer;
    }, [clearTimer]);

    return {
        timeRef,
        isRunningRef,
        activeColorRef,
        startClock,
        switchClock,
        pauseClock,
        resetClock,
        formatTime,
    };
}
