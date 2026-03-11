import { useMemo, useCallback, useState } from 'react';
import { Plus, Settings, Archive, HelpCircle, BookOpen, Share2, Info, Activity, Target } from 'lucide-react';
import MoveHistory from '@/components/MoveHistory/MoveHistory';
import InsightPanel from '@/components/InsightPanel/InsightPanel';
import EvaluationGraph from '@/components/EvaluationGraph/EvaluationGraph';
import ReviewStats from '@/components/ReviewStats/ReviewStats';
import { useGame } from '@/contexts/GameContext';
import { Chess } from 'chess.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'moves' | 'info' | 'openings';

export interface GameSidebarProps {
    onNewGame: () => void;
    onOpenSettings: () => void;
    onOpenArchive: () => void;
    onOpenHelp: () => void;
}

// ─── Static Config ────────────────────────────────────────────────────────────

const NAV_BUTTONS = [
    { id: 'help', label: 'Help', Icon: HelpCircle, action: 'onOpenHelp' },
    { id: 'new', label: 'New Game', Icon: Plus, action: 'onNewGame' },
    { id: 'archive', label: 'Games', Icon: Archive, action: 'onOpenArchive' },
    { id: 'settings', label: 'Settings', Icon: Settings, action: 'onOpenSettings' },
] as const;

const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'moves', label: 'Moves' },
    { id: 'info', label: 'Info' },
    { id: 'openings', label: 'Openings' },
];

const BAD_CLASSIFICATIONS = new Set(['blunder', 'mistake', 'inaccuracy']);

// ─── Custom Hook: Mistake Navigation ─────────────────────────────────────────

function useMistakeNavigation(chessGame: ReturnType<typeof useGame>['chessGame'], analysis: ReturnType<typeof useGame>['analysis']) {
    const navigate = useCallback(
        (direction: 'next' | 'prev') => {
            const isNext = direction === 'next';
            const start = isNext ? chessGame.historyIndex + 1 : chessGame.historyIndex - 1;
            const end = isNext ? chessGame.history.length : -1;
            const step = isNext ? 1 : -1;

            for (let i = start; i !== end; i += step) {
                const color = i % 2 === 0 ? 'w' : 'b';
                const classif = analysis.getMoveClassification(i, color)?.classification;
                if (classif && BAD_CLASSIFICATIONS.has(classif)) {
                    chessGame.goToMove(i);
                    return;
                }
            }
        },
        [chessGame, analysis]
    );

    return {
        handleNextMistake: useCallback(() => navigate('next'), [navigate]),
        handlePrevMistake: useCallback(() => navigate('prev'), [navigate]),
    };
}

// ─── Sub-component: NavButton ─────────────────────────────────────────────────

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

function NavButton({ label, Icon, onClick }: { label: string; Icon: LucideIcon; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={`
                group flex-1 min-w-0 flex flex-col items-center justify-center gap-1.5 py-2.5
                rounded-xl bg-[#2a2825] 
                border-x border-[#ffffff05] border-t border-[#ffffff15] border-b border-[#00000060]
                shadow-[0_2px_4px_rgba(0,0,0,0.4)]
                text-[10px] sm:text-[11px] font-bold text-[#989795]
                hover:bg-[#363431] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.5)]
                active:translate-y-px active:shadow-none active:bg-[#201e1c]
                active:border-t-[#00000060] active:border-b-[#ffffff15]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#739552]/70
                transition-all duration-150 ease-out
            `}
        >
            <Icon size={17} strokeWidth={2} className="shrink-0 transition-transform duration-150 group-hover:scale-110" />
            <span className="truncate w-full text-center px-0.5">{label}</span>
        </button>
    );
}

// ─── Sub-component: TabButton ─────────────────────────────────────────────────

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            role="tab"
            aria-selected={isActive}
            className={`
                flex-1 flex justify-center py-2 text-[13px] font-bold rounded-full
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#739552]/70
                ${isActive
                    ? 'bg-[#3b3834] text-white shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-[#484540] border-t-[#5c5953]'
                    : 'text-[#8a8886] hover:text-[#c4c3c0]'
                }
            `}
        >
            {label}
        </button>
    );
}

// ─── Sub-component: MatchDetailsPanel ────────────────────────────────────────

function MatchRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
    return (
        <div className="flex gap-3 items-start px-1">
            <dt className="w-[105px] shrink-0 text-[#989795]">{label}</dt>
            <dd className={`font-semibold text-white text-left break-words ${className}`}>{value}</dd>
        </div>
    );
}

function MatchDetailsPanel({ chessGame }: { chessGame: ReturnType<typeof useGame>['chessGame'] }) {
    return (
        <div className="flex flex-col gap-4 mt-2">
            <div className="p-4 bg-gradient-to-b from-[#2a2826] to-[#22201e] border border-[#3b3834] shadow-md rounded-lg">
                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#3b3834] shadow-[0_1px_0_rgba(255,255,255,0.02)]">
                    <div className="w-8 h-8 rounded-lg bg-[#312e2b] border border-[#3b3834] shadow-inner flex items-center justify-center">
                        <Info size={16} className="text-gray-300" />
                    </div>
                    <h3 className="text-white text-base font-bold shadow-black/50 drop-shadow-sm">Match Details</h3>
                </div>
                <dl className="flex flex-col gap-3 text-sm text-[#989795]">
                    <MatchRow label="White Pieces" value={chessGame.playerColor === 'w' ? 'You' : 'Stockfish Engine'} />
                    <MatchRow label="Black Pieces" value={chessGame.playerColor === 'b' ? 'You' : 'Stockfish Engine'} />
                    <MatchRow
                        label="Game Status"
                        value={chessGame.gameStatus === 'idle' ? 'Not Started' : chessGame.gameStatus}
                        className="capitalize"
                    />
                    {chessGame.gameResult && (
                        <div className="flex gap-3 items-start pt-3 border-t border-[#3b3834] mt-1 px-1">
                            <dt className="w-[105px] shrink-0 text-[#989795]">Result</dt>
                            <dd className="font-bold text-white text-left break-words">{chessGame.gameResult.reason}</dd>
                        </div>
                    )}
                </dl>
            </div>
            <div className="p-4 border border-dashed border-[#3b3834] rounded-lg text-center text-[#989795]">
                <p className="text-sm">Finish the game and run a Game Review to unlock deep engine insights.</p>
            </div>
        </div>
    );
}

// ─── Sub-component: OpeningExplorerPanel ─────────────────────────────────────

function OpeningExplorerPanel({ openingName, history }: { openingName?: string | null, history: { san: string }[] }) {
    const openingMoves = useMemo(() => {
        if (!history || history.length === 0) return '';
        return history.slice(0, 8).map(m => m.san).join(' ');
    }, [history]);

    // Mock data for the explorer
    const mockVariations = [
        { move: 'e5', games: '4.2M', white: 38, draw: 32, black: 30 },
        { move: 'c5', games: '3.1M', white: 37, draw: 33, black: 30 },
        { move: 'e6', games: '2.4M', white: 41, draw: 31, black: 28 },
        { move: 'c6', games: '1.9M', white: 39, draw: 34, black: 27 },
        { move: 'Nf6', games: '1.5M', white: 40, draw: 30, black: 30 },
    ];

    return (
        <div className="flex flex-col h-full text-[#989795] overflow-y-auto pb-safe-offset-4 bg-[#1b1a18]">
            {/* Hero Banner Area */}
            <div className="relative px-5 py-6 bg-gradient-to-b from-[#2a2826] to-[#1b1a18] border-b border-[#3b3834] shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-[#312e2b] border border-[#3b3834] shadow-inner flex items-center justify-center">
                        <BookOpen size={14} className="text-[#a5a4a1]" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#8a8987] font-bold">
                        Current Opening
                    </span>
                </div>
                
                <h3 className="text-[#e3e2e0] font-bold text-2xl leading-tight mb-3 drop-shadow-sm">
                    {openingName || 'Starting Position'}
                </h3>
                
                {openingMoves && (
                    <div className="bg-[#171614] rounded-lg px-3 py-2 border border-[#3b3834] shadow-inner">
                        <span className="font-mono text-[#a5a4a1] text-xs leading-none">
                            {openingMoves}
                        </span>
                    </div>
                )}
            </div>

            {/* Data Table Header */}
            <div className="flex px-5 py-3 bg-[#1e1d1c] border-b border-[#2e2d2b] shadow-sm sticky top-0 z-10">
                <div className="w-[48px] shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#737270]">Move</div>
                <div className="w-[64px] shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#737270] text-right pr-4">Games</div>
                <div className="flex-1 text-[10px] font-bold uppercase tracking-widest text-[#737270] pr-4">Chart</div>
                <div className="w-[100px] shrink-0 flex justify-end gap-3 text-[10px] font-bold uppercase tracking-widest text-[#737270]">
                    <span className="w-6 text-center text-[#e4e4e4]">W</span>
                    <span className="w-6 text-center text-[#989795]">D</span>
                    <span className="w-6 text-center text-[#5c5956]">B</span>
                </div>
            </div>

            {/* Data List */}
            <div className="flex flex-col pt-1 pb-4">
                {mockVariations.map((v, i) => (
                    <button 
                        key={v.move}
                        className={`
                            flex items-center px-5 py-2.5 
                            hover:bg-[#262422] active:bg-[#2a2826]
                            transition-colors duration-150 group
                            ${i !== mockVariations.length - 1 ? 'border-b border-[#ffffff04]' : ''}
                        `}
                    >
                        {/* Move Name */}
                        <div className="w-[48px] shrink-0 text-left font-bold text-[#e3e2e0] text-sm tabular-nums group-hover:text-[#81b64c] transition-colors">
                            {v.move}
                        </div>
                        
                        {/* Game Count */}
                        <div className="w-[64px] shrink-0 text-right pr-4 font-medium text-[#989795] text-xs tabular-nums">
                            {v.games}
                        </div>
                        
                        {/* Win % Bar */}
                        <div className="flex-1 flex items-center pr-4">
                            <div className="w-full flex h-1.5 rounded-full overflow-hidden border border-[#00000040] opacity-80 group-hover:opacity-100 transition-opacity">
                                <div style={{ width: `${v.white}%` }} className="bg-[#e4e4e4]" />
                                <div style={{ width: `${v.draw}%` }} className="bg-[#989795]" />
                                <div style={{ width: `${v.black}%` }} className="bg-[#5c5956]" />
                            </div>
                        </div>

                        {/* Win % Text Columns */}
                        <div className="w-[100px] shrink-0 flex justify-end gap-3 text-[11px] font-bold tracking-wide">
                            <span className="w-6 text-center text-[#c5c4c3]">{v.white}%</span>
                            <span className="w-6 text-center text-[#8a8987]">{v.draw}%</span>
                            <span className="w-6 text-center text-[#5c5956]">{v.black}%</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="px-6 py-4 mt-auto">
                <div className="p-3 rounded border border-dashed border-[#3b3834] bg-[#1e1d1c]">
                    <p className="text-[10px] text-center text-[#737270] leading-relaxed">
                        Master database preview.<br/>Play moves on the board to explore deeper lines.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * GameSidebar — unified analytical sidebar that consumes GameContext internally.
 * Handles move history, engine insights, evaluation graph, review stats, and openings.
 */
export default function GameSidebar({
    onNewGame,
    onOpenSettings,
    onOpenArchive,
    onOpenHelp,
}: GameSidebarProps) {
    const {
        chessGame,
        analysis,
        appState,
        setAppState,
        stockfish,
        isAnalysisComplete,
        analysisProgress,
    } = useGame();

    const { turn } = chessGame;
    const [activeTab, setActiveTab] = useState<ActiveTab>('moves');

    // Stable map from action-key → callback (avoids re-creating NavButton onClick refs)
    const actionMap = useMemo(
        () => ({ onOpenHelp, onNewGame, onOpenArchive, onOpenSettings }),
        [onOpenHelp, onNewGame, onOpenArchive, onOpenSettings]
    );

    // ── Convert raw UCI PV lines → SAN (capped at 8 ply for UI readability) ──
    const sanMultiPv = useMemo(() => {
        if (!stockfish.multiPv?.length || !chessGame.fen) return stockfish.multiPv;

        return stockfish.multiPv.map(mpv => {
            try {
                const tempChess = new Chess(chessGame.fen);
                const sanMoves: string[] = [];

                for (const uci of mpv.pv.split(' ').slice(0, 8)) {
                    if (uci.length < 4) break;
                    try {
                        const result = tempChess.move({
                            from: uci.slice(0, 2),
                            to: uci.slice(2, 4),
                            promotion: uci.length > 4 ? uci[4] : undefined,
                        });
                        if (!result) break;
                        sanMoves.push(result.san);
                    } catch {
                        break;
                    }
                }

                return { ...mpv, pv: sanMoves.length ? sanMoves.join(' ') : mpv.pv };
            } catch {
                return mpv;
            }
        });
    }, [stockfish.multiPv, chessGame.fen]);

    // ── Mistake navigation via extracted hook ──
    const { handleNextMistake, handlePrevMistake } = useMistakeNavigation(chessGame, analysis);

    const handleRetry = useCallback(() => {
        if (chessGame.historyIndex > 0) chessGame.goToMove(chessGame.historyIndex - 1);
        setAppState('playing');
    }, [chessGame, setAppState]);

    const handleShare = useCallback(() => {
        const stats = analysis.getAccuracyStats(chessGame.history);
        const wAcc = stats?.whiteAccuracy.toFixed(1) ?? '0';
        const bAcc = stats?.blackAccuracy.toFixed(1) ?? '0';
        const fenEnc = encodeURIComponent(chessGame.fen);
        // Security: noopener prevents the new tab from accessing window.opener
        window.open(`/api/og?fen=${fenEnc}&wAcc=${wAcc}&bAcc=${bAcc}`, '_blank', 'noopener,noreferrer');
    }, [analysis, chessGame]);

    const isReview = appState === 'review';

    return (
        <div className="flex flex-col w-full h-full min-h-0">

            {/* ── Header: Actions + Tab Control ───────────────────────────── */}
            <header className="flex flex-col shrink-0 gap-4 border-b border-[#32302c] bg-[#21201e] px-4 py-5">

                {/* Global Action Buttons */}
                <nav className="flex w-full gap-1.5 sm:gap-2" aria-label="Game actions">
                    {NAV_BUTTONS.map(({ id, label, Icon, action }) => (
                        <NavButton
                            key={id}
                            label={label}
                            Icon={Icon}
                            onClick={actionMap[action]}
                        />
                    ))}
                </nav>

                {/* Divider */}
                <hr className="border-t border-[#181715] border-b border-[#3b3834] opacity-80" />

                {/* Segmented Tab Control */}
                <div
                    role="tablist"
                    aria-label="Sidebar sections"
                    className="flex w-full bg-[#181715] p-1.5 rounded-full border border-black/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                >
                    {TABS.map(tab => (
                        <TabButton
                            key={tab.id}
                            label={tab.label}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </div>
            </header>

            {/* ── Tab Panel ───────────────────────────────────────────────── */}
            <div role="tabpanel" className="flex-1 min-h-0 relative flex flex-col overflow-y-auto">

                {/* Moves Tab */}
                {activeTab === 'moves' && (
                    <div className="flex-1 min-h-0">
                        <MoveHistory
                            moves={chessGame.history}
                            currentIndex={chessGame.historyIndex}
                            openingName={chessGame.openingName}
                            onGoToMove={chessGame.goToMove}
                            onGoToFirst={chessGame.goToFirst}
                            onGoToPrev={chessGame.goToPrev}
                            onGoToNext={chessGame.goToNext}
                            onGoToLast={chessGame.goToLast}
                            getMoveClassification={analysis.getMoveClassification}
                        />
                    </div>
                )}

                {/* Info Tab */}
                {activeTab === 'info' && (
                    <div className="flex flex-col gap-4 p-4 overflow-y-auto min-h-0 flex-1 pb-safe-offset-4">
                        <InsightPanel
                            // The last move was made by the opposite color, so flip turn to evaluate it
                            analysis={analysis.getMoveClassification(
                                chessGame.historyIndex,
                                turn === 'w' ? 'b' : 'w'
                            )}
                            isReviewMode={isReview}
                            turn={turn}
                            multiPv={sanMultiPv}
                            onRetry={handleRetry}
                            onPrevMistake={handlePrevMistake}
                            onNextMistake={handleNextMistake}
                        />

                        {isReview ? (
                            <div className="mt-2 flex flex-col gap-4 pb-4">
                                {/* Evaluation graph */}
                                <section className="p-4 bg-gradient-to-b from-[#2a2826] to-[#22201e] border border-[#3b3834] shadow-md rounded-lg active:scale-[0.99] transition-transform origin-center">
                                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#3b3834] shadow-[0_1px_0_rgba(255,255,255,0.02)]">
                                        <div className="w-8 h-8 rounded-lg bg-[#312e2b] border border-[#3b3834] shadow-inner flex items-center justify-center">
                                            <Activity size={16} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-white text-base font-bold shadow-black/50 drop-shadow-sm">Game Evaluation</h3>
                                    </div>
                                    <EvaluationGraph
                                        analysisCache={analysis.cache}
                                        historyLength={chessGame.history.length}
                                        currentIndex={chessGame.historyIndex}
                                        onGoToMove={chessGame.goToMove}
                                        isAnalysisComplete={isAnalysisComplete}
                                        analysisProgress={analysisProgress}
                                        compact
                                    />
                                </section>

                                {/* Accuracy + Share (only once analysis is done) */}
                                {isAnalysisComplete && (
                                    <section className="p-4 bg-gradient-to-b from-[#2a2826] to-[#22201e] border border-[#3b3834] shadow-md rounded-lg active:scale-[0.99] transition-transform origin-center">
                                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#3b3834] shadow-[0_1px_0_rgba(255,255,255,0.02)]">
                                            <div className="w-8 h-8 rounded-lg bg-[#312e2b] border border-[#3b3834] shadow-inner flex items-center justify-center">
                                                <Target size={16} className="text-gray-300" />
                                            </div>
                                            <h3 className="text-white text-base font-bold shadow-black/50 drop-shadow-sm">Accuracy</h3>
                                        </div>
                                        <ReviewStats stats={analysis.getAccuracyStats(chessGame.history)} />
                                        <div className="mt-4 pt-4 border-t border-[#3b3834]">
                                            <button
                                                onClick={handleShare}
                                                className={`
                                                    w-full flex items-center justify-center gap-2 py-3
                                                    bg-[#739552] text-white font-bold rounded-md
                                                    border border-t-[#8eb665] border-x-[#638047] border-b-[#4d6337]
                                                    shadow-[0_4px_0_#4d6337]
                                                    hover:bg-[#81a55c] 
                                                    active:translate-y-[4px] active:shadow-none active:bg-[#68874a]
                                                    active:border-t-[#4d6337] active:border-b-[#8eb665]
                                                    transition-all duration-100 ease-out
                                                    focus-visible:outline-none focus-visible:ring-2
                                                    focus-visible:ring-[#739552]/70 focus-visible:ring-offset-1
                                                    focus-visible:ring-offset-[#262421]
                                                `}
                                            >
                                                <Share2 size={18} />
                                                Share Analysis
                                            </button>
                                        </div>
                                    </section>
                                )}
                            </div>
                        ) : (
                            <MatchDetailsPanel chessGame={chessGame} />
                        )}
                    </div>
                )}

                {/* Openings Tab */}
                {activeTab === 'openings' && (
                    <OpeningExplorerPanel openingName={chessGame.openingName} history={chessGame.history} />
                )}
            </div>
        </div>
    );
}