import { AccuracyStats, PositionAnalysis } from '@/hooks/useAnalysis';
import { Trophy, Clock, Swords } from 'lucide-react';

interface GameReportCardProps {
    stats: AccuracyStats | null;
    analysisCache: Record<number, PositionAnalysis>;
    historyLength: number;
}

export default function GameReportCard({ stats, analysisCache, historyLength }: GameReportCardProps) {
    if (!stats) return null;

    // A simple Circular accuracy gauge component
    const CircularGauge = ({ accuracy, color, label }: { accuracy: number, color: string, label: string }) => {
        const radius = 36;
        const strokeWidth = 8;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (accuracy / 100) * circumference;
        
        return (
            <div className="flex flex-col items-center gap-2">
                <div className="relative flex items-center justify-center" style={{ width: radius*2+strokeWidth, height: radius*2+strokeWidth }}>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        {/* Background track */}
                        <circle
                            cx={radius + strokeWidth/2}
                            cy={radius + strokeWidth/2}
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={strokeWidth}
                        />
                        {/* Value track */}
                        <circle
                            cx={radius + strokeWidth/2}
                            cy={radius + strokeWidth/2}
                            r={radius}
                            fill="none"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-lg leading-none">{accuracy.toFixed(1)}</span>
                        <span className="text-white/40 text-[10px] font-bold leading-none">%</span>
                    </div>
                </div>
                <span className="text-xs font-bold text-[#989795] uppercase tracking-wider">{label}</span>
            </div>
        );
    };

    // We can use the largestEvalSwingIndex from stats if available, or fallback.
    let maxSwing = 0;
    let criticalMoveNumber = 0;
    
    if (stats.largestEvalSwingIndex !== undefined && stats.largestEvalSwingIndex >= 0) {
        const idx = stats.largestEvalSwingIndex;
        const current = analysisCache[idx]?.evaluation;
        const prev = analysisCache[idx - 1]?.evaluation;
        if (current !== undefined && prev !== undefined && current !== null && prev !== null) {
            maxSwing = Math.abs(current - prev);
            criticalMoveNumber = Math.ceil(idx / 2);
        }
    } else {
        // Fallback calculation just in case
        for (let i = 1; i <= historyLength; i++) {
            const current = analysisCache[i]?.evaluation;
            const prev = analysisCache[i - 1]?.evaluation;
            
            if (current !== undefined && prev !== undefined && current !== null && prev !== null) {
                const swing = Math.abs(current - prev);
                if (swing > maxSwing) {
                    maxSwing = swing;
                    criticalMoveNumber = Math.ceil(i / 2);
                }
            }
        }
    }

    return (
        <div className="flex flex-col bg-gradient-to-b from-[#2a2826] to-[#22201e] border border-[#3b3834] rounded-xl overflow-hidden shadow-lg mb-4">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#3b3834] flex items-center gap-3 bg-black/20">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-green)]/20 border border-[var(--accent-green)]/30 flex items-center justify-center shadow-inner">
                    <Trophy size={20} className="text-[var(--accent-green)]" />
                </div>
                <div>
                    <h2 className="text-white font-black text-lg leading-tight tracking-tight">Performance Report</h2>
                    <p className="text-[#a5a4a1] text-xs font-medium">Post-game engine analysis</p>
                </div>
            </div>

            {/* Gauges */}
            <div className="flex justify-around items-center py-6 px-4 bg-gradient-to-b from-transparent to-black/10">
                <CircularGauge accuracy={stats.whiteAccuracy} color="#e4e4e4" label="White" />
                <div className="h-16 w-px bg-gradient-to-b from-transparent via-[#3b3834] to-transparent" />
                <CircularGauge accuracy={stats.blackAccuracy} color="#5c5956" label="Black" />
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-2 gap-px bg-[#3b3834] border-t border-[#3b3834]">
                <div className="flex flex-col bg-[#22201e] p-3 pl-5">
                    <div className="flex items-center gap-2 mb-1">
                        <Swords size={12} className="text-[#8a8987]" />
                        <span className="text-[10px] uppercase font-bold text-[#8a8987]">Total Moves</span>
                    </div>
                    <span className="text-white font-medium text-sm">{Math.ceil(historyLength / 2)} <span className="text-[#a5a4a1] text-xs">pairs</span></span>
                </div>
                <div className="flex flex-col bg-[#22201e] p-3 pl-5">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock size={12} className="text-[#8a8987]" />
                        <span className="text-[10px] uppercase font-bold text-[#8a8987]">Critical Moment</span>
                    </div>
                    <span className="text-white font-medium text-sm">
                        {maxSwing > 1.5 ? `Move ${criticalMoveNumber}` : "None"} 
                        {maxSwing > 1.5 && <span className="text-[var(--accent-red)] text-xs ml-1 font-bold">({maxSwing.toFixed(1)} eval jump)</span>}
                    </span>
                </div>
            </div>
        </div>
    );
}
