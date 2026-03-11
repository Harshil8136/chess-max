import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// We map chess.js fen string to board matrix to draw squares.
// Alternatively we can use a simpler 8x8 generation.
function generateBoardFromFen(fen: string) {
    const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    const finalFen = fen || defaultFen;
    const rows = finalFen.split(' ')[0].split('/');
    
    const board = [];
    for (let r = 0; r < 8; r++) {
        const row = [];
        const chars = rows[r] ? rows[r].split('') : [];
        for (let c = 0; c < chars.length; c++) {
            const char = chars[c];
            if (isNaN(parseInt(char))) {
                row.push(char);
            } else {
                for (let i = 0; i < parseInt(char); i++) {
                    row.push(null);
                }
            }
        }
        // Ensure 8 wide
        while(row.length < 8) row.push(null);
        board.push(row);
    }
    return board;
}

const PIECE_URLS: Record<string, string> = {
    'p': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bP.svg',
    'n': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bN.svg',
    'b': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bB.svg',
    'r': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bR.svg',
    'q': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bQ.svg',
    'k': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bK.svg',
    'P': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wP.svg',
    'N': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wN.svg',
    'B': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wB.svg',
    'R': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wR.svg',
    'Q': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wQ.svg',
    'K': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wK.svg',
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        const fen = searchParams.get('fen') || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        const wAcc = searchParams.get('wAcc') || '0';
        const bAcc = searchParams.get('bAcc') || '0';
        
        const board = generateBoardFromFen(fen);

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1E1D1B',
                        padding: '40px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Left: The Board */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '540px',
                            height: '540px',
                            backgroundColor: '#302E2B',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        }}
                    >
                        {board.map((row, rIdx) => (
                            <div key={`r-${rIdx}`} style={{ display: 'flex', flex: 1 }}>
                                {row.map((piece, cIdx) => {
                                    const isLight = (rIdx + cIdx) % 2 === 0;
                                    const bgColor = isLight ? '#EBECD0' : '#739552';
                                    
                                    return (
                                        <div
                                            key={`s-${rIdx}-${cIdx}`}
                                            style={{
                                                display: 'flex',
                                                flex: 1,
                                                backgroundColor: bgColor,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {piece && PIECE_URLS[piece] && (
                                                <img 
                                                    src={PIECE_URLS[piece]} 
                                                    width={60} 
                                                    height={60} 
                                                    style={{ objectFit: 'contain' }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Right: Stats & Branding */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            marginLeft: '60px',
                            width: '450px',
                            height: '540px',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '60px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', letterSpacing: '-1px' }}>
                                    Chess Max
                                </div>
                                <div style={{ 
                                    backgroundColor: '#739552', 
                                    color: 'white', 
                                    padding: '4px 12px', 
                                    borderRadius: '6px', 
                                    fontSize: '16px', 
                                    fontWeight: 'bold',
                                    letterSpacing: '1px'
                                }}>
                                    ANALYSIS
                                </div>
                            </div>
                            <div style={{ fontSize: '24px', color: '#989795', marginTop: '12px' }}>
                                Deep Engine Review
                            </div>
                        </div>

                        {/* Accuracy Boxes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* White */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#262421',
                                border: '2px solid #3b3834',
                                borderRadius: '16px',
                                padding: '24px 32px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '4px' }}></div>
                                    <span style={{ color: '#c4c3c0', fontSize: '28px', fontWeight: '600' }}>White</span>
                                </div>
                                <div style={{ color: 'white', fontSize: '40px', fontWeight: '800' }}>
                                    {Number(wAcc).toFixed(1)}%
                                </div>
                            </div>

                            {/* Black */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#262421',
                                border: '2px solid #3b3834',
                                borderRadius: '16px',
                                padding: '24px 32px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '24px', height: '24px', backgroundColor: '#302E2B', borderRadius: '4px', border: '2px solid #555' }}></div>
                                    <span style={{ color: '#c4c3c0', fontSize: '28px', fontWeight: '600' }}>Black</span>
                                </div>
                                <div style={{ color: 'white', fontSize: '40px', fontWeight: '800' }}>
                                    {Number(bAcc).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ 
                            marginTop: 'auto', 
                            color: '#739552', 
                            fontSize: '24px', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            chessmax.com
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
    }
}
