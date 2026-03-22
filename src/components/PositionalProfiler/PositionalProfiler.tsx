import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculatePositionalHealth, PositionalHealth } from '@/lib/heuristics';
import { Target } from 'lucide-react';

interface PositionalProfilerProps {
    fen: string;
    prevFen?: string | null;
    isReviewMode?: boolean;
}

const AXES = [
    { key: 'centerControl', label: 'Center' },
    { key: 'kingSafety', label: 'Safety' },
    { key: 'activity', label: 'Activity' },
    { key: 'space', label: 'Space' },
    { key: 'material', label: 'Material' },
] as const;

export default function PositionalProfiler({ fen, prevFen, isReviewMode = false }: PositionalProfilerProps) {
    const { white, black } = useMemo(() => calculatePositionalHealth(fen), [fen]);
    const prevHealth = useMemo(() => prevFen ? calculatePositionalHealth(prevFen) : null, [prevFen]);

    const size = 200;
    const center = size / 2;
    const radius = (size / 2) - 30; // 30px padding for labels

    // Generate points for the pentagon
    const calculatePoints = (health: PositionalHealth) => {
        return AXES.map((axis, i) => {
            const angle = (Math.PI / 2) - (2 * Math.PI * i / AXES.length); // Start top, go clockwise
            const value = health[axis.key];
            const scale = Math.max(0, Math.min(100, value)) / 100;
            const r = radius * scale;
            const x = center + r * Math.cos(angle);
            const y = center - r * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    };

    const whitePoints = calculatePoints(white);
    const blackPoints = calculatePoints(black);
    
    let prevWhitePoints = '';
    let prevBlackPoints = '';
    if (prevHealth) {
        prevWhitePoints = calculatePoints(prevHealth.white);
        prevBlackPoints = calculatePoints(prevHealth.black);
    }

    // Background Web Grid points
    const bgScaleLevels = [0.25, 0.5, 0.75, 1.0];
    const bgGridPolygons = bgScaleLevels.map(scale => {
        return AXES.map((_, i) => {
            const angle = (Math.PI / 2) - (2 * Math.PI * i / AXES.length);
            const r = radius * scale;
            const x = center + r * Math.cos(angle);
            const y = center - r * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    });

    // Axis Lines
    const axisLines = AXES.map((_, i) => {
        const angle = (Math.PI / 2) - (2 * Math.PI * i / AXES.length);
        const x = center + radius * Math.cos(angle);
        const y = center - radius * Math.sin(angle);
        return { x, y };
    });

    return (
        <div className="flex flex-col gap-4 mt-2">
            <div className="p-4 bg-gradient-to-b from-[#2a2826] to-[#22201e] border border-[#3b3834] shadow-md rounded-lg">
                <div className="flex items-center gap-2.5 mb-2 pb-3 border-b border-[#3b3834] shadow-[0_1px_0_rgba(255,255,255,0.02)]">
                    <div className="w-8 h-8 rounded-lg bg-[#312e2b] border border-[#3b3834] shadow-inner flex items-center justify-center">
                        <Target size={16} className="text-[#10b981]" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-white text-base font-bold shadow-black/50 drop-shadow-sm leading-tight">Positional Health</h3>
                        <span className="text-[10px] uppercase tracking-widest text-[#10b981] font-bold opacity-80">{isReviewMode ? "Comparative Analysis" : "Live Profiler"}</span>
                    </div>
                </div>

                <div className="relative w-full flex justify-center py-2 h-[220px]">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                        {/* Draw Background Grid */}
                        {bgGridPolygons.map((points, i) => (
                            <polygon
                                key={`bg-${i}`}
                                points={points}
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="0.5"
                            />
                        ))}
                        
                        {/* Draw Axis Lines */}
                        {axisLines.map((line, i) => (
                            <line
                                key={`axis-${i}`}
                                x1={center}
                                y1={center}
                                x2={line.x}
                                y2={line.y}
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Draw Axis Labels */}
                        {AXES.map((axis, i) => {
                            const angle = (Math.PI / 2) - (2 * Math.PI * i / AXES.length);
                            // Push label slightly outside the max radius
                            const labelRadius = radius + 20; 
                            const x = center + labelRadius * Math.cos(angle);
                            const y = center - labelRadius * Math.sin(angle);
                            return (
                                <text
                                    key={`label-${i}`}
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    className="text-[9px] font-bold uppercase tracking-wider fill-[#989795]"
                                >
                                    {axis.label}
                                </text>
                            );
                        })}

                        {/* Previous White Health Polygon (Dashed) */}
                        {prevHealth && (
                            <motion.polygon
                                initial={{ points: prevWhitePoints }}
                                animate={{ points: prevWhitePoints }}
                                fill="none"
                                stroke="rgba(247, 215, 80, 0.4)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                style={{ zIndex: 5 }}
                            />
                        )}

                        {/* White Health Polygon */}
                        <motion.polygon
                            initial={{ points: center + "," + center }}
                            animate={{ points: whitePoints }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            fill={isReviewMode ? "rgba(247, 215, 80, 0.15)" : "rgba(247, 215, 80, 0.25)"}
                            stroke="rgba(247, 215, 80, 0.9)"
                            strokeWidth="2"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(247, 215, 80, 0.3))', zIndex: 10 }}
                        />

                        {/* Previous Black Health Polygon (Dashed) */}
                        {prevHealth && (
                            <motion.polygon
                                initial={{ points: prevBlackPoints }}
                                animate={{ points: prevBlackPoints }}
                                fill="none"
                                stroke="rgba(16, 185, 129, 0.4)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                style={{ zIndex: 5 }}
                            />
                        )}

                        {/* Black Health Polygon */}
                        <motion.polygon
                            initial={{ points: center + "," + center }}
                            animate={{ points: blackPoints }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            fill={isReviewMode ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.25)"}
                            stroke="rgba(16, 185, 129, 0.9)"
                            strokeWidth="2"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.3))', zIndex: 10 }}
                        />
                        
                        {/* Center Dot */}
                        <circle cx={center} cy={center} r={3} fill="#5c5956" />
                    </svg>
                </div>
                
                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-1 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-[rgba(247,215,80,0.8)] shadow-[0_0_8px_rgba(247,215,80,0.4)]" />
                        <span className="text-xs font-bold text-white">White</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-[rgba(16,185,129,0.8)] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span className="text-xs font-bold text-white">Black</span>
                    </div>
                    {isReviewMode && (
                        <div className="flex items-center gap-2 w-full justify-center">
                            <div className="w-4 h-0 border-t border-dashed border-[#989795]" />
                            <span className="text-[10px] font-bold text-[#989795] uppercase">Previous Move (Dashed)</span>
                        </div>
                    )}
                </div>
            </div>
            
            {!isReviewMode && (
                <div className="p-4 border border-dashed border-[#3b3834] rounded-lg text-center text-[#989795]">
                    <p className="text-sm">Finish the game and run a Game Review to unlock deep engine insights.</p>
                </div>
            )}
        </div>
    );
}
