'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Target, Zap, Brain } from 'lucide-react';

interface AnalysisLoadingOverlayProps {
    isAnalyzing: boolean;
    progress: number;
}

const loadingQuotes = [
    "Consulting the oracle...",
    "Calculating 14 million futures...",
    "Finding brilliant moves...",
    "Measuring positional tension...",
    "Weighing material advantages...",
    "Evaluating king safety...",
    "Deep-diving into endgame tablebases...",
    "Searching for tactical motifs...",
];

/* ───── Constants for the SVG ring ─────────────────────────────────── */
const RING_SIZE   = 140;              // viewBox width/height
const CENTER      = RING_SIZE / 2;    // center coordinate
const RADIUS      = 60;              // circle radius
const STROKE      = 5;               // stroke width
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* ───── Floating particle config ───────────────────────────────────── */
const particles = [
    { Icon: Zap,      size: 16, x: -55, y: -45, color: 'var(--accent-purple, var(--accent-blue))', dur: 6,   delay: 0   },
    { Icon: Target,   size: 18, x:  55, y:  30, color: 'var(--accent-orange, var(--accent-red))',  dur: 7,   delay: 1.5 },
    { Icon: Activity, size: 14, x:  50, y: -40, color: 'var(--accent-green)',                      dur: 5,   delay: 0.8 },
    { Icon: Brain,    size: 14, x: -50, y:  35, color: 'var(--accent-blue)',                       dur: 5.5, delay: 2   },
];

export default function AnalysisLoadingOverlay({ isAnalyzing, progress }: AnalysisLoadingOverlayProps) {
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        if (isAnalyzing) {
            const interval = setInterval(() => {
                setQuoteIndex((prev) => (prev + 1) % loadingQuotes.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isAnalyzing]);

    const dashOffset = CIRCUMFERENCE * (1 - progress / 100);

    return (
        <AnimatePresence>
            {isAnalyzing && (
                <motion.div
                    key="analysis-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center"
                    style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', background: 'rgba(0,0,0,0.55)' }}
                >
                    {/* Centre card container – everything is relative to this */}
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex flex-col items-center"
                    >
                        {/* Soft glow behind the ring */}
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: 180,
                                height: 180,
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -60%)',
                                background: 'radial-gradient(circle, var(--accent-green) 0%, transparent 70%)',
                                opacity: 0.15,
                                filter: 'blur(30px)',
                            }}
                        />

                        {/* ─── Circular Progress Ring ─── */}
                        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
                            <svg
                                width={RING_SIZE}
                                height={RING_SIZE}
                                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                                className="block"
                                style={{ transform: 'rotate(-90deg)' }}
                            >
                                {/* Background track */}
                                <circle
                                    cx={CENTER}
                                    cy={CENTER}
                                    r={RADIUS}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeWidth={STROKE}
                                />
                                {/* Progress arc */}
                                <motion.circle
                                    cx={CENTER}
                                    cy={CENTER}
                                    r={RADIUS}
                                    fill="none"
                                    stroke="var(--accent-green)"
                                    strokeWidth={STROKE}
                                    strokeLinecap="round"
                                    strokeDasharray={CIRCUMFERENCE}
                                    initial={{ strokeDashoffset: CIRCUMFERENCE }}
                                    animate={{ strokeDashoffset: dashOffset }}
                                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
                                    style={{ filter: 'drop-shadow(0 0 6px var(--accent-green))' }}
                                />
                            </svg>

                            {/* Inner content (percentage) */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {/* Spinning accent ring (decorative) */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                                    className="absolute inset-2 rounded-full border border-dashed border-white/[0.06]"
                                />

                                <motion.span
                                    key={Math.round(progress)}
                                    initial={{ scale: 1.15, opacity: 0.5 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-3xl font-black text-white tabular-nums tracking-tight leading-none"
                                >
                                    {Math.round(progress)}
                                    <span className="text-xs font-semibold text-white/50 ml-0.5">%</span>
                                </motion.span>
                            </div>
                        </div>

                        {/* ─── Title & rotating quote ─── */}
                        <div className="mt-6 flex flex-col items-center gap-1.5">
                            <h2 className="text-white text-lg font-bold tracking-tight">
                                Engine Analysis
                            </h2>

                            <div className="h-5 relative overflow-hidden flex items-center justify-center w-56">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={quoteIndex}
                                        initial={{ y: 14, opacity: 0, filter: 'blur(4px)' }}
                                        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                        exit={{ y: -14, opacity: 0, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.35, ease: 'easeOut' }}
                                        className="text-white/40 text-xs text-center absolute whitespace-nowrap"
                                    >
                                        {loadingQuotes[quoteIndex]}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ─── Floating decorative particles ─── */}
                        {particles.map(({ Icon, size, x, y, color, dur, delay }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: [0, 0.55, 0.55, 0],
                                    y: [0, -8, 2, 0],
                                    x: [0, 3, -3, 0],
                                    scale: [0.8, 1, 1, 0.8],
                                }}
                                transition={{ repeat: Infinity, duration: dur, ease: 'easeInOut', delay }}
                                className="absolute pointer-events-none"
                                style={{
                                    left: `calc(50% + ${x}px)`,
                                    top: `calc(40% + ${y}px)`,
                                    color,
                                }}
                            >
                                <Icon size={size} />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
