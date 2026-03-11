import { useEffect } from 'react';

interface UseGameKeyboardProps {
    showNewGameDialog: boolean;
    goToFirst: () => void;
    goToLast: () => void;
    goToNext: () => void;
    goToPrev: () => void;
    setBoardFlipped: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenHelp?: () => void;
}

export function useGameKeyboard({
    showNewGameDialog,
    goToFirst,
    goToLast,
    goToNext,
    goToPrev,
    setBoardFlipped,
    onOpenHelp,
}: UseGameKeyboardProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showNewGameDialog) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    goToPrev();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    goToNext();
                    break;
                case 'Home':
                    e.preventDefault();
                    goToFirst();
                    break;
                case 'End':
                    e.preventDefault();
                    goToLast();
                    break;
                case 'f':
                    e.preventDefault();
                    setBoardFlipped((prev) => !prev);
                    break;
                case '?':
                    if (onOpenHelp) {
                        e.preventDefault();
                        onOpenHelp();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showNewGameDialog, goToFirst, goToLast, goToNext, goToPrev, setBoardFlipped, onOpenHelp]);
}
