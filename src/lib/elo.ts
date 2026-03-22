import { EloLevel, TimeControl } from '@/types/chess';

export const ELO_LEVELS: EloLevel[] = [
    {
        elo: 400,
        name: 'Rookie',
        description: 'New to chess, makes unpredictable moves',
        avatar: '🐣',
        skillLevel: 0,
        moveTime: 100,
    },
    {
        elo: 600,
        name: 'Brawler',
        description: 'Aggressive but makes frequent mistakes',
        avatar: '🥊',
        skillLevel: 3,
        moveTime: 150,
    },
    {
        elo: 800,
        name: 'Scholar',
        description: 'Understands basic tactics, occasional blunders',
        avatar: '📚',
        skillLevel: 5,
        moveTime: 250,
    },
    {
        elo: 1000,
        name: 'Tactician',
        description: 'Solid fundamentals, looking for traps',
        avatar: '🎯',
        skillLevel: 8,
        moveTime: 400,
    },
    {
        elo: 1200,
        name: 'Grinder',
        description: 'Good tactical awareness, plays solid chess',
        avatar: '⚙️',
        skillLevel: 10,
        moveTime: 500,
    },
    {
        elo: 1400,
        name: 'Assassin',
        description: 'Strong positional understanding, deadly precise',
        avatar: '🥷',
        skillLevel: 13,
        moveTime: 700,
    },
    {
        elo: 1600,
        name: 'Strategist',
        description: 'Deep calculation ability, subtle plans',
        avatar: '🧠',
        skillLevel: 15,
        moveTime: 800,
    },
    {
        elo: 1800,
        name: 'Master',
        description: 'Near-master level play, very hard to beat',
        avatar: '👑',
        skillLevel: 18,
        moveTime: 1000,
    },
    {
        elo: 2000,
        name: 'Deep Max',
        description: 'Elite level, cold calculating machine',
        avatar: '🖥️',
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

