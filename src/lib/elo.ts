import { EloLevel, TimeControl } from '@/types/chess';

export const ELO_LEVELS: EloLevel[] = [
    {
        elo: 400,
        name: 'Beginner',
        description: 'New to chess, makes random moves',
        skillLevel: 0,
        moveTime: 100,
    },
    {
        elo: 600,
        name: 'Casual',
        description: 'Knows the basics, frequent mistakes',
        skillLevel: 3,
        moveTime: 150,
    },
    {
        elo: 800,
        name: 'Intermediate',
        description: 'Understands tactics, occasional blunders',
        skillLevel: 5,
        moveTime: 250,
    },
    {
        elo: 1000,
        name: 'Club Player',
        description: 'Solid fundamentals, improving strategy',
        skillLevel: 8,
        moveTime: 400,
    },
    {
        elo: 1200,
        name: 'Competitive',
        description: 'Good tactical awareness',
        skillLevel: 10,
        moveTime: 500,
    },
    {
        elo: 1400,
        name: 'Advanced',
        description: 'Strong positional understanding',
        skillLevel: 13,
        moveTime: 700,
    },
    {
        elo: 1600,
        name: 'Expert',
        description: 'Deep calculation ability',
        skillLevel: 15,
        moveTime: 800,
    },
    {
        elo: 1800,
        name: 'Master',
        description: 'Near-master level play',
        skillLevel: 18,
        moveTime: 1000,
    },
    {
        elo: 2000,
        name: 'Grandmaster',
        description: 'Elite level, extremely strong',
        skillLevel: 20,
        moveTime: 1200,
    },
];

export const TIME_CONTROLS: TimeControl[] = [
    { name: 'bullet1', label: '1 min', initial: 60, increment: 0 },
    { name: 'bullet2', label: '1 | 1', initial: 60, increment: 1 },
    { name: 'blitz3', label: '3 min', initial: 180, increment: 0 },
    { name: 'blitz3_2', label: '3 | 2', initial: 180, increment: 2 },
    { name: 'blitz5', label: '5 min', initial: 300, increment: 0 },
    { name: 'rapid10', label: '10 min', initial: 600, increment: 0 },
    { name: 'rapid15', label: '15 | 10', initial: 900, increment: 10 },
    { name: 'classical30', label: '30 min', initial: 1800, increment: 0 },
    { name: 'unlimited', label: '∞', initial: 0, increment: 0 },
];

export const DEFAULT_ELO = ELO_LEVELS[4]; // 1200
export const DEFAULT_TIME_CONTROL = TIME_CONTROLS[8]; // unlimited

export function getEloLevel(elo: number): EloLevel {
    const closest = ELO_LEVELS.reduce((prev, curr) =>
        Math.abs(curr.elo - elo) < Math.abs(prev.elo - elo) ? curr : prev
    );
    return closest;
}

export function getEloColor(elo: number): string {
    if (elo <= 600) return '#7fa650';
    if (elo <= 1000) return '#e5a42b';
    if (elo <= 1400) return '#e58f2a';
    if (elo <= 1800) return '#d4542a';
    return '#b33a3a';
}
