export const PIECE_VALUES: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
};

export function getMaterialAdvantage(
    captured: { w: string[]; b: string[] }
): number {
    const whiteCaptures = captured.w.reduce(
        (sum, p) => sum + (PIECE_VALUES[p] || 0),
        0
    );
    const blackCaptures = captured.b.reduce(
        (sum, p) => sum + (PIECE_VALUES[p] || 0),
        0
    );
    return whiteCaptures - blackCaptures;
}
