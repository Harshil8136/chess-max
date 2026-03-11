// Common chess opening names by ECO code prefix
// Subset of the most well-known openings for display purposes
const OPENINGS: Record<string, string> = {
    // King Pawn
    'e4 e5 Nf3 Nc6 Bb5': 'Ruy López',
    'e4 e5 Nf3 Nc6 Bc4': 'Italian Game',
    'e4 e5 Nf3 Nc6 d4': 'Scotch Game',
    'e4 e5 Nf3 Nf6': 'Petrov Defense',
    'e4 e5 f4': 'King\'s Gambit',
    'e4 e5 d4': 'Center Game',
    'e4 e5 Nc3': 'Vienna Game',
    'e4 e5 Bc4': 'Bishop\'s Opening',

    // Sicilian
    'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6': 'Sicilian Najdorf',
    'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6': 'Sicilian Dragon',
    'e4 c5 Nf3 Nc6 d4': 'Sicilian Open',
    'e4 c5 Nf3 e6': 'Sicilian Paulsen',
    'e4 c5 Nf3 d6': 'Sicilian Defense',
    'e4 c5 Nc3': 'Sicilian Closed',
    'e4 c5 c3': 'Sicilian Alapin',
    'e4 c5': 'Sicilian Defense',

    // French
    'e4 e6 d4 d5 Nc3': 'French Winawer',
    'e4 e6 d4 d5 Nd2': 'French Tarrasch',
    'e4 e6 d4 d5 e5': 'French Advance',
    'e4 e6 d4 d5 exd5': 'French Exchange',
    'e4 e6': 'French Defense',

    // Caro-Kann
    'e4 c6 d4 d5 Nc3': 'Caro-Kann Classical',
    'e4 c6 d4 d5 e5': 'Caro-Kann Advance',
    'e4 c6': 'Caro-Kann Defense',

    // Queen Pawn
    'd4 d5 c4 e6 Nc3 Nf6': 'Queen\'s Gambit Declined',
    'd4 d5 c4 dxc4': 'Queen\'s Gambit Accepted',
    'd4 d5 c4 c6': 'Slav Defense',
    'd4 d5 c4': 'Queen\'s Gambit',
    'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6': 'King\'s Indian Defense',
    'd4 Nf6 c4 g6 Nc3 d5': 'Grünfeld Defense',
    'd4 Nf6 c4 e6 Nc3 Bb4': 'Nimzo-Indian Defense',
    'd4 Nf6 c4 e6 g3': 'Catalan Opening',
    'd4 Nf6 c4 e6 Nf3 b6': 'Queen\'s Indian Defense',
    'd4 Nf6 c4 c5': 'Benoni Defense',
    'd4 Nf6 c4': 'Indian Defense',
    'd4 d5': 'Queen\'s Pawn Game',
    'd4 f5': 'Dutch Defense',

    // English
    'c4 e5': 'English Opening',
    'c4 Nf6': 'English Opening',
    'c4': 'English Opening',

    // Others
    'Nf3 d5 g3': 'Réti Opening',
    'Nf3 d5': 'Réti Opening',
    'g3': 'King\'s Fianchetto',
    'b3': 'Larsen\'s Opening',
    'e4 d5': 'Scandinavian Defense',
    'e4 Nf6': 'Alekhine\'s Defense',
    'e4 d6': 'Pirc Defense',
    'e4 g6': 'Modern Defense',
    'e4 b6': 'Owen\'s Defense',
};

export function identifyOpening(moves: string[]): string | null {
    // Build progressively shorter move strings to find the most specific match
    const moveString = moves.join(' ');

    // Try matching from longest (most specific) to shortest
    const sortedKeys = Object.keys(OPENINGS).sort(
        (a, b) => b.length - a.length
    );

    for (const key of sortedKeys) {
        if (moveString.startsWith(key)) {
            return OPENINGS[key];
        }
    }

    return null;
}
