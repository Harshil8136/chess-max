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
        <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-x-hidden bg-[#0a0a0c] px-4 py-12 selection:bg-[#81b64c]/30 sm:px-6 lg:px-8">
            {/* Ambient Background Glow — wider, softer ellipse */}
            <div className="absolute inset-x-0 top-0 h-[70vh] pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(129,182,76,0.08), transparent 60%)' }} />
            
            <motion.div 
                variants={containerVars}
                initial="hidden"
                animate="visible"
                className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-12"
            >
                {/* ─── Hero Section ─── */}
                <motion.div variants={itemVars} className="flex flex-col items-center gap-6 text-center">
                    {/* Stockfish Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#81b64c]/20 bg-[#81b64c]/10 px-4 py-1.5 backdrop-blur-md">
                        <Sparkles className="size-4 text-[#81b64c]" />
                        <span className="text-xs font-semibold tracking-wider text-[#81b64c] uppercase">Powered by Stockfish 16.1 WASM</span>
                    </div>

                    {/* Hero Headline — fluid clamp, no text-balance */}
                    <h1
                        className="max-w-5xl font-extrabold text-white leading-[1.05]"
                        style={{ fontSize: 'clamp(2.75rem, 8vw, 7rem)', letterSpacing: '-0.04em' }}
                    >
                        Master the board.{' '}
                        <br />
                        <span className="bg-gradient-to-r from-[#81b64c] via-[#a3d160] to-[#81b64c] bg-clip-text text-transparent">
                            Master your mind.
                        </span>
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="max-w-xl text-center text-lg font-medium text-white/40 sm:text-xl" style={{ lineHeight: 1.7 }}>
                        Challenge the world's most powerful engine, flawlessly integrated into a premium, blazing-fast experience. No ads. Just beautiful chess.
                    </p>
                </motion.div>

                {/* ─── Bento Grid CTAs ─── */}
                <motion.div variants={itemVars} className="grid w-full grid-cols-1 gap-4 md:grid-cols-12 lg:gap-6">
                    
                    {/* Primary — Custom Match (Span 8) */}
                    <button 
                        onClick={onPlayNow}
                        className="group relative col-span-1 block w-full outline-none md:col-span-8"
                    >
                        <div className="flex h-full w-full min-h-[200px] flex-col items-start justify-center overflow-hidden rounded-[2rem] border border-white/[0.07] bg-white/[0.02] p-6 text-left transition-all duration-300 group-hover:border-[#81b64c]/40 group-hover:bg-white/[0.04] group-hover:shadow-2xl group-hover:shadow-[#81b64c]/10 sm:p-8 lg:flex-row lg:items-center lg:p-10">
                            {/* Hover glow orb */}
                            <div className="absolute -right-40 -top-40 size-80 rounded-full bg-[#81b64c]/10 blur-[80px] transition-transform duration-700 group-hover:scale-150 group-hover:bg-[#81b64c]/20" />
                            
                            <div className="z-10 mb-8 flex w-full flex-col lg:mb-0 lg:max-w-md">
                                <div className="mb-6 flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner">
                                    <Swords className="size-7 text-white" />
                                </div>
                                <h3 className="mb-3 text-3xl font-semibold tracking-tight text-white lg:text-4xl">Custom Match</h3>
                                <p className="text-base text-white/45 leading-relaxed">
                                    Set custom time controls, choose perfectly matched AI opponents, or play a friend locally.
                                </p>
                            </div>
                            
                            {/* Arrow CTA */}
                            <div className="z-10 flex size-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:scale-110 lg:self-center">
                                <ArrowRight className="size-6 transition-transform duration-300 group-hover:translate-x-1" />
                            </div>
                        </div>
                    </button>

                    {/* Secondary — Play Stockfish (Span 4) */}
                    <button 
                        onClick={() => handleQuickPlay(4)}
                        className="group relative col-span-1 block w-full outline-none md:col-span-4"
                    >
                        <div className="flex h-full w-full flex-col justify-center overflow-hidden rounded-[2rem] border border-[#81b64c]/25 bg-[#81b64c]/[0.07] p-6 text-left transition-all duration-300 group-hover:border-[#81b64c]/40 group-hover:bg-[#81b64c]/10 group-hover:shadow-2xl group-hover:shadow-[#81b64c]/10 sm:p-8">
                            {/* Green glow orb */}
                            <div className="absolute -right-24 -top-24 size-48 rounded-full bg-[#81b64c]/20 blur-[60px] transition-transform duration-700 group-hover:scale-150" />
                            
                            <Bot className="relative z-10 mb-8 size-10 text-[#81b64c]" />
                            <div className="relative z-10">
                                <h3 className="mb-2 text-2xl font-semibold tracking-tight text-white">Play Stockfish</h3>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-[#81b64c]/20 px-2.5 py-1 text-xs font-semibold tracking-wide text-[#81b64c]">10 MIN</span>
                                    <span className="text-sm font-medium text-white/40">ELO 1200</span>
                                </div>
                            </div>
                            
                            {/* Hover play arrow */}
                            <div className="absolute bottom-6 right-6 z-20 flex size-10 scale-50 items-center justify-center rounded-full bg-[#81b64c] opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 sm:bottom-8 sm:right-8">
                                <ArrowRight className="size-4 text-white" />
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
                                className="group col-span-1 block w-full outline-none"
                            >
                                <div className="relative flex h-full w-full items-center gap-4 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 text-left transition-all duration-300 group-hover:border-[#81b64c]/30 group-hover:bg-white/[0.04] lg:p-6">
                                    {/* Hover gradient reveal */}
                                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#81b64c]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/5 transition-all duration-300 group-hover:border-[#81b64c]/20 group-hover:bg-[#81b64c]/5">
                                        <Icon className="size-5 text-white/50 transition-colors duration-300 group-hover:text-[#81b64c]" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="mb-0.5 text-base font-semibold tracking-tight text-white">{level.title}</span>
                                        <span className="text-sm font-medium text-[#81b64c]">{level.desc}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </motion.div>
                
                {/* ─── Footer Feature Badges ─── */}
                <motion.div variants={itemVars} className="mt-12 flex w-full flex-wrap items-center justify-center gap-6 border-t border-white/5 pt-10 text-sm font-medium text-white/35">
                    <span className="flex items-center gap-2"><WifiOff className="size-4" /> Offline Ready</span>
                    <span className="flex items-center gap-2"><LineChart className="size-4" /> Deep Analysis</span>
                    <span className="hidden items-center gap-2 sm:flex"><Palette className="size-4" /> 35 Piece Sets</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
