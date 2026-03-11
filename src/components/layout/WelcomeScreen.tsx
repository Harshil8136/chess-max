'use client';

import { motion, Variants } from 'framer-motion';
import { Zap, WifiOff, LineChart, Palette, ChevronRight } from 'lucide-react';
import { ELO_LEVELS, DEFAULT_TIME_CONTROL } from '@/lib/elo';
import { PlayerColor, EloLevel, TimeControl, GameMode } from '@/types/chess';
import styles from './WelcomeScreen.module.css';

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
    // Quick play presets
    const handleQuickPlay = (eloIndex: number) => {
        onQuickPlay({
            gameMode: 'vs_computer',
            playerColor: 'w', // Default to white for quick play
            eloLevel: ELO_LEVELS[eloIndex],
            timeControl: DEFAULT_TIME_CONTROL,
        });
    };

    const features = [
        {
            icon: <Zap size={20} className="text-[#81b64c]" />,
            title: "ELO 400–2000",
            desc: "Beginner to Grandmaster"
        },
        {
            icon: <WifiOff size={20} className="text-[#81b64c]" />,
            title: "Offline Play",
            desc: "No internet needed"
        },
        {
            icon: <LineChart size={20} className="text-[#81b64c]" />,
            title: "Deep Analysis",
            desc: "Stockfish-powered insights"
        },
        {
            icon: <Palette size={20} className="text-[#81b64c]" />,
            title: "35 Piece Sets",
            desc: "Customize your board"
        }
    ];

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className={styles.welcomeContainer}>
            {/* Animated Chessboard Background */}
            <div className={styles.boardBackground} />
            <div className={styles.bgGradient} />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] w-full px-6 py-12">
                
                {/* Hero Content */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex flex-col items-center text-center mb-12"
                >
                    {/* Floating King Piece */}
                    <motion.div 
                        animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                    >
                        <img 
                            src="/pieces/staunty/wK.png" 
                            alt="White King" 
                            className="w-28 h-28 md:w-36 md:h-36 object-contain filter drop-shadow-2xl"
                        />
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white">
                        Chess <span className="text-[#81b64c] drop-shadow-[0_0_15px_rgba(129,182,76,0.3)]">Max</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-400 max-w-lg mx-auto font-medium">
                        Challenge the Stockfish engine at any skill level. 
                        Free, fast, and beautiful.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onPlayNow}
                        className={styles.primaryButton}
                    >
                        Play Now 
                        <span className={styles.shimmer} />
                    </motion.button>
                </motion.div>

                {/* Feature Cards Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mb-16"
                >
                    {features.map((feature, idx) => (
                        <motion.div 
                            key={idx} 
                            variants={itemVariants}
                            className="flex flex-col items-start p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md hover:bg-white/[0.05] transition-colors"
                        >
                            <div className="p-2.5 rounded-xl bg-[#81b64c]/10 mb-3 border border-[#81b64c]/20">
                                {feature.icon}
                            </div>
                            <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-400">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Play Presets */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="flex flex-col items-center w-full max-w-3xl"
                >
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Quick Play (White)</p>
                    
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {/* 0 = Beginner (400) */}
                        <button onClick={() => handleQuickPlay(0)} className={styles.quickPlayBtn}>
                            <div className="flex flex-col text-left">
                                <span className="text-white font-semibold">Beginner</span>
                                <span className="text-xs text-[#81b64c]">ELO 400</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-500" />
                        </button>

                        {/* 4 = Competitive (1200) */}
                        <button onClick={() => handleQuickPlay(4)} className={styles.quickPlayBtn}>
                            <div className="flex flex-col text-left">
                                <span className="text-white font-semibold">Intermediate</span>
                                <span className="text-xs text-[#81b64c]">ELO 1200</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-500" />
                        </button>

                        {/* 7 = Master (1800) */}
                        <button onClick={() => handleQuickPlay(7)} className={styles.quickPlayBtn}>
                            <div className="flex flex-col text-left">
                                <span className="text-white font-semibold">Advanced</span>
                                <span className="text-xs text-[#81b64c]">ELO 1800</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-500" />
                        </button>
                    </div>

                    <button 
                        onClick={onPlayNow}
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        Custom Setup <ChevronRight size={14} />
                    </button>
                </motion.div>

            </div>
            
            {/* Minimal Footer built into Welcome */}
            <div className="absolute bottom-4 w-full text-center z-10">
                <p className="text-xs text-gray-600 font-medium tracking-wide">
                    POWERED BY STOCKFISH 16.1 WASM
                </p>
            </div>
        </div>
    );
}
