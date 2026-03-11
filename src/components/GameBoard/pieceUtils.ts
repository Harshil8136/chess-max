// Pure utility — no React imports, no side effects.
// Returns the public URL for a chess piece PNG image.
// Filename convention: {color}{TYPE}.png  e.g. wK.png, bP.png
export function getPieceUrl(color: 'w' | 'b', type: string, pieceSet: string): string {
    return `/pieces/${pieceSet}/${color}${type.toUpperCase()}.png`;
}
