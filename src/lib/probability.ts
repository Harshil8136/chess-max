/**
 * Expected Score & Momentum Utilities
 */

// Calculates White's Expected Score, Draw Probability, and Black's Expected Score
export function calculateWDL(cp: number | null, mate: number | null) {
    if (mate !== null) {
        if (mate > 0) return { white: 100, draw: 0, black: 0 };
        if (mate < 0) return { white: 0, draw: 0, black: 100 };
        return { white: 50, draw: 0, black: 50 }; // Shouldn't happen
    }

    if (cp === null) return { white: 33.3, draw: 33.4, black: 33.3 };

    // Standardized Expected Score (0 to 1) using logistic growth approximation
    const winRate = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
    
    // Draw probability heavily peaks at perfectly equal 0.0 eval.
    // Base draw chance at elite/engine equality is ~35%.
    const drawProb = 35 * Math.exp(-Math.pow(cp / 150, 2)); 

    let white = 0;
    let black = 0;

    if (cp >= 0) {
        white = winRate;
        black = Math.max(0, 100 - white - drawProb);
    } else {
        black = 100 - winRate;
        white = Math.max(0, 100 - black - drawProb);
    }

    return {
        white: Math.max(0, Math.min(100, white)),
        draw: Math.max(0, Math.min(100, drawProb)),
        black: Math.max(0, Math.min(100, black))
    };
}

export function calculateMomentum(evals: { cp: number | null, mate: number | null }[]) {
    // Requires at least 3 plies to measure momentum shift vs player's last turn
    if (evals.length < 3) return { shift: 0, trend: 'neutral' as 'white' | 'black' | 'neutral' };

    const current = evals[evals.length - 1];
    const previous = evals[evals.length - 3];

    const getCp = (ev: { cp: number | null, mate: number | null } | undefined) => {
        if (!ev) return 0;
        if (ev.mate !== null) return Math.sign(ev.mate) * 10000;
        return ev.cp !== null ? ev.cp : 0;
    };

    const currentCp = getCp(current);
    const prevCp = getCp(previous);

    const delta = (currentCp - prevCp) / 100; // converted to pawn metric

    let trend: 'white' | 'black' | 'neutral' = 'neutral';
    // A momentum shift of 1.5 pawns advantage unexpectedly
    if (delta >= 1.5) trend = 'white'; 
    else if (delta <= -1.5) trend = 'black'; 

    return { shift: delta, trend };
}
