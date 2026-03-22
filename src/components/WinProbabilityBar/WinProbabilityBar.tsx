import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateWDL, calculateMomentum } from '@/lib/probability';
import { Activity, Flame, MoveDown, MoveUp } from 'lucide-react';

interface WinProbabilityBarProps {
    stockfishEval: number | null;
    stockfishMate: number | null;
    evaluationHistory: { cp: number | null; mate: number | null }[];
}

export default function WinProbabilityBar({ stockfishEval, stockfishMate, evaluationHistory }: WinProbabilityBarProps) {
    const { white, draw, black } = useMemo(() => calculateWDL(stockfishEval, stockfishMate), [stockfishEval, stockfishMate]);
    
    // Merge live stockfish evaluation into the cache history to instantly grab momentum 
    const combinedHistory = useMemo(() => {
        const hist = [...evaluationHistory];
        if (stockfishEval !== null || stockfishMate !== null) {
            hist.push({ cp: stockfishEval, mate: stockfishMate });
        }
        return hist;
    }, [evaluationHistory, stockfishEval, stockfishMate]);
    
    const { shift, trend } = useMemo(() => calculateMomentum(combinedHistory), [combinedHistory]);

    return (
        <div className="flex flex-col gap-3 p-4 bg-gradient-to-b from-[#2a2826] to-[#22201e] border border-[#3b3834] shadow-md rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#3b3834] shadow-[0_1px_0_rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#312e2b] border border-[#3b3834] shadow-inner flex items-center justify-center">
                        <Activity size={16} className="text-[#38bdf8]" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-white text-base font-bold shadow-black/50 drop-shadow-sm leading-tight">Expected Score</h3>
                        <span className="text-[10px] uppercase tracking-widest text-[#38bdf8] font-bold opacity-80">Live Win Probability</span>
                    </div>
                </div>

                {trend !== 'neutral' && (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
                        trend === 'white' 
                            ? 'bg-[linear-gradient(to_bottom,rgba(247,215,80,0.15),rgba(247,215,80,0.05))] text-[#f7d750] border-[#f7d750]/30' 
                            : 'bg-[linear-gradient(to_bottom,rgba(16,185,129,0.15),rgba(16,185,129,0.05))] text-[#10b981] border-[#10b981]/30'
                    }`}>
                        <Flame size={14} className={trend === 'white' ? 'text-[#f7d750]' : 'text-[#10b981]'} />
                        {trend === 'white' ? <MoveUp size={12} strokeWidth={3} /> : <MoveDown size={12} strokeWidth={3} />}
                        <span>{Math.abs(shift).toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Probability Percentage Bar */}
            <div className="relative w-full h-7 bg-[#18181b] rounded-md overflow-hidden border border-[#3b3834] shadow-inner flex">
                {/* White */}
                <motion.div 
                    initial={{ width: '33.3%' }}
                    animate={{ width: `${white}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="h-full bg-gradient-to-r from-[#e4e4e4] to-[#f4f4f5] border-r border-[#00000040] shadow-[0_0_15px_rgba(255,255,255,0.4)] flex items-center justify-start px-2 group"
                >
                    {white > 12 && <span className="text-[10px] font-extrabold text-[#18181b] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">{white.toFixed(1)}%</span>}
                </motion.div>
                
                {/* Draw */}
                <motion.div 
                    initial={{ width: '33.4%' }}
                    animate={{ width: `${draw}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="h-full bg-gradient-to-r from-[#71717a] to-[#52525b] border-r border-[#00000080] flex items-center justify-center z-10 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                >
                    {draw > 12 && <span className="text-[10px] font-extrabold text-white/70">{draw.toFixed(1)}%</span>}
                </motion.div>

                {/* Black */}
                <motion.div 
                    initial={{ width: '33.3%' }}
                    animate={{ width: `${black}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="h-full bg-gradient-to-r from-[#27272a] to-[#18181b] shadow-[inner_5px_0_10px_rgba(0,0,0,0.5)] flex items-center justify-end px-2"
                >
                    {black > 12 && <span className="text-[10px] font-extrabold text-[#a1a1aa] drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">{black.toFixed(1)}%</span>}
                </motion.div>
            </div>
            
            <div className="flex justify-between px-1">
                <span className="text-[10px] font-bold text-[#e4e4e4] uppercase tracking-wider">White</span>
                <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Draw</span>
                <span className="text-[10px] font-bold text-[#5c5956] uppercase tracking-wider">Black</span>
            </div>
        </div>
    );
}
