'use client';

import { motion, Variants } from 'framer-motion';
import { Shield, Sparkles, LineChart, Palette, ArrowRight, Bot, Swords, Cpu, WifiOff, Globe } from 'lucide-react';
import { ELO_LEVELS, DEFAULT_TIME_CONTROL } from '@/lib/elo';
import { PlayerColor, EloLevel, TimeControl, GameMode } from '@/types/chess';

interface WelcomeScreenProps {
    onPlayNow: () => void;
    onQuickPlay: (settings: {
        gameMode: GameMode;
        playerColor: PlayerColor;
        eloLevel: EloLevel;
        timeControl: TimeControl;
    }) => void;
}

export default function WelcomeScreen({ onPlayNow, onQuickPlay }: WelcomeScreenProps) {
    const handleQuickPlay = (eloIndex: number) => {
        onQuickPlay({
            gameMode: 'vs_computer',
            playerColor: 'w',
            eloLevel: ELO_LEVELS[eloIndex],
            timeControl: DEFAULT_TIME_CONTROL,
        });
    };

    const containerVars: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
    };

    const itemVars: Variants = {
        hidden: { y: 24, opacity: 0, filter: 'blur(10px)' },
        visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 80, damping: 18 } }
    };

    return (
        <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-bg-primary px-4 py-12 sm:px-6 lg:px-8 selection:bg-accent-green/30">
            {/* Removed Ambient Background Glow to keep it purely solid and crisp */}
            
            <motion.div 
                variants={containerVars}
                initial="hidden"
                animate="visible"
                className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-12"
            >
                {/* ─── Hero Section ─── */}
                <motion.div variants={itemVars} className="flex flex-col items-center gap-6 text-center">
                    {/* Stockfish Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent-green/20 bg-accent-green/10 px-4 py-1.5 backdrop-blur-md">
                        <Sparkles className="size-4 text-accent-green" />
                        <span className="text-xs font-semibold tracking-wider text-accent-green uppercase">Powered by Stockfish 16.1 WASM</span>
                    </div>

                    {/* Hero Headline */}
                    <h1
                        className="max-w-5xl text-balance font-extrabold text-text-primary leading-[1.05]"
                        style={{ fontSize: 'clamp(2.75rem, 8vw, 7rem)', letterSpacing: '-0.04em' }}
                    >
                        Master the board.{' '}
                        <br />
                        <span className="bg-gradient-to-r from-accent-green via-[#a3d160] to-accent-green bg-clip-text text-transparent">
                            Master your mind.
                        </span>
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="max-w-xl text-balance text-center text-lg font-medium text-text-secondary sm:text-xl" style={{ lineHeight: 1.7 }}>
                        Challenge the world's most powerful engine, flawlessly integrated into a premium, fast experience. No ads. Just beautiful chess.
                    </p>
                </motion.div>

                {/* ─── Bento Grid CTAs ─── */}
                <motion.div variants={itemVars} className="grid w-full grid-cols-1 gap-4 md:grid-cols-12 lg:gap-6">
                    
                    {/* Primary — Custom Match (Span 8) */}
                    <button 
                        onClick={onPlayNow}
                        className="group relative col-span-1 block w-full outline-none focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-[2rem] md:col-span-8 active:scale-[0.98] transition-all duration-200"
                    >
                        <div className="flex h-full min-h-[220px] w-full flex-col items-start justify-center overflow-hidden rounded-[2rem] border border-glass-border bg-glass-bg backdrop-blur-md p-6 text-left transition-all duration-300 group-hover:border-accent-green/40 group-hover:bg-bg-elevated/60 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_40px_rgba(129,182,76,0.15)] sm:p-8 lg:flex-row lg:items-center lg:p-10">
                            {/* Hover glow orb */}
                            <div className="absolute -right-40 -top-40 size-80 rounded-full bg-accent-green/10 blur-[80px] transition-transform duration-700 group-hover:scale-150 group-hover:bg-accent-green/20" />
                            
                            <div className="z-10 mb-8 flex w-full flex-col lg:mb-0 lg:max-w-md">
                                <div className="mb-6 flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border-color bg-bg-surface shadow-inner transition-colors duration-300 group-hover:bg-bg-hover group-hover:border-accent-green/30">
                                    <Swords className="size-7 text-text-primary" />
                                </div>
                                <h3 className="mb-3 text-3xl font-semibold tracking-tight text-text-primary lg:text-4xl">Custom Match</h3>
                                <p className="text-base text-text-secondary leading-relaxed">
                                    Set custom time controls, choose perfectly matched AI opponents, or play a friend locally.
                                </p>
                            </div>
                            
                            {/* Arrow CTA */}
                            <div className="z-10 flex size-14 shrink-0 items-center justify-center rounded-full border border-border-color bg-bg-surface backdrop-blur-md transition-all duration-300 group-hover:bg-text-primary group-hover:text-bg-primary group-hover:scale-110 lg:ml-auto">
                                <ArrowRight className="size-6 transition-transform duration-300 group-hover:translate-x-1" />
                            </div>
                        </div>
                    </button>

                    {/* Secondary — Play Stockfish (Span 4) */}
                    <button 
                        onClick={() => handleQuickPlay(4)}
                        className="group relative col-span-1 block w-full outline-none focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-[2rem] md:col-span-4 active:scale-[0.98] transition-all duration-200"
                    >
                        <div className="flex h-full min-h-[220px] w-full flex-col justify-center overflow-hidden rounded-[2rem] border border-accent-green/30 bg-accent-green/10 p-6 text-left transition-all duration-300 group-hover:border-accent-green/50 group-hover:bg-accent-green/15 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_40px_rgba(129,182,76,0.15)] sm:p-8">
                            {/* Green glow orb */}
                            <div className="absolute -right-24 -top-24 size-48 rounded-full bg-accent-green/20 blur-[60px] transition-transform duration-700 group-hover:scale-150" />
                            
                            <Bot className="relative z-10 mb-8 size-10 text-accent-green transition-transform duration-300 group-hover:scale-110" />
                            <div className="relative z-10">
                                <h3 className="mb-2 text-2xl font-semibold tracking-tight text-text-primary">Play Stockfish</h3>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-accent-green/20 px-2.5 py-1 text-xs font-semibold tracking-wide text-accent-green">10 MIN</span>
                                    <span className="text-sm font-medium text-text-muted">ELO 1200</span>
                                </div>
                            </div>
                            
                            {/* Hover play arrow */}
                            <div className="absolute bottom-6 right-6 z-20 flex size-10 items-center justify-center rounded-full bg-accent-green text-bg-primary opacity-0 scale-50 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 sm:bottom-8 sm:right-8">
                                <ArrowRight className="size-4" />
                            </div>
                        </div>
                    </button>
                </motion.div>

                {/* ─── Quick-Play Level Cards ─── */}
                <motion.div variants={itemVars} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
                    {[
                        { title: "Beginner", desc: "ELO 400", index: 0, icon: Shield },
                        { title: "Advanced", desc: "ELO 1800", index: 7, icon: Cpu },
                        { title: "Grandmaster", desc: "ELO 2000", index: 8, icon: Globe }
                    ].map((level) => {
                        const Icon = level.icon;
                        return (
                            <button
                                key={level.title}
                                onClick={() => handleQuickPlay(level.index)}
                                className="group col-span-1 block w-full outline-none focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-3xl active:scale-[0.98] transition-all duration-200"
                            >
                                <div className="relative flex h-full w-full items-center gap-4 overflow-hidden rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-md p-5 text-left transition-all duration-300 group-hover:border-accent-green/30 group-hover:bg-bg-elevated/60 lg:p-6">
                                    {/* Hover gradient reveal */}
                                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-accent-green/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border-color bg-bg-surface transition-all duration-300 group-hover:border-accent-green/30 group-hover:bg-accent-green/10">
                                        <Icon className="size-5 text-text-muted transition-colors duration-300 group-hover:text-accent-green" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="mb-0.5 text-base font-semibold tracking-tight text-text-primary">{level.title}</span>
                                        <span className="text-sm font-medium text-accent-green">{level.desc}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </motion.div>
                
                {/* ─── Footer Feature Badges ─── */}
                <motion.div variants={itemVars} className="mt-12 flex w-full flex-wrap items-center justify-center gap-6 border-t border-border-color pt-10 text-sm font-medium text-text-muted">
                    <span className="flex items-center gap-2"><WifiOff className="size-4" /> Offline Ready</span>
                    <span className="flex items-center gap-2"><LineChart className="size-4" /> Deep Analysis</span>
                    <span className="hidden items-center gap-2 sm:flex"><Palette className="size-4" /> 16 Custom Themes</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
