import React from 'react';
import { Sparkles, Star, ThumbsUp, Check, HelpCircle, AlertTriangle, XOctagon, BookOpen, ArrowRightCircle, Target } from 'lucide-react';
import { MoveAnalysis } from '@/hooks/useAnalysis';
import styles from './InsightPanel.module.css';

interface InsightPanelProps {
    analysis: MoveAnalysis | null;
    isReviewMode: boolean;
    turn: 'w' | 'b';
    multiPv?: { multipv: number; pv: string; evaluation: number | null; mate: number | null }[];
    onRetry?: () => void;
    onPrevMistake?: () => void;
    onNextMistake?: () => void;
}

export default React.memo(function InsightPanel({ analysis, isReviewMode, turn, multiPv, onRetry, onPrevMistake, onNextMistake }: InsightPanelProps) {
    if (!isReviewMode) return null;

    if (!analysis) {
        return (
            <div className={styles.panel}>
                <p className={styles.loading}>Analyzing position...</p>
            </div>
        );
    }

    const { classification, bestMove, evaluation, mate } = analysis;

    let title = 'Insight';
    let description = '';
    let themeClass = styles.themeDefault;
    let Icon = Target;
    
    const evalText = mate !== null
        ? `M${Math.abs(mate)}`
        : `${evaluation! > 0 ? '+' : ''}${evaluation?.toFixed(1)}`;

    switch (classification) {
        case 'brilliant':
            title = 'Brilliant';
            description = `A masterpiece! You found a spectacular move.`;
            themeClass = styles.themeBrilliant;
            Icon = Sparkles;
            break;
        case 'book':
            title = 'Book Move';
            description = `Standard opening theory.`;
            themeClass = styles.themeBook;
            Icon = BookOpen;
            break;
        case 'forced':
            title = 'Forced Move';
            description = `The only legal or logical move in this position.`;
            themeClass = styles.themeForced;
            Icon = ArrowRightCircle;
            break;
        case 'blunder':
            title = 'Blunder';
            description = `A critical mistake. You lost your advantage. The engine prefers ${bestMove}.`;
            themeClass = styles.themeBlunder;
            Icon = XOctagon;
            break;
        case 'mistake':
            title = 'Mistake';
            description = `This move worsened your position. A better continuation was ${bestMove}.`;
            themeClass = styles.themeMistake;
            Icon = AlertTriangle;
            break;
        case 'inaccuracy':
            title = 'Inaccuracy';
            description = `Slightly inferior. Stockfish suggests ${bestMove} here.`;
            themeClass = styles.themeInaccuracy;
            Icon = HelpCircle;
            break;
        case 'best':
            title = 'Best Move';
            description = `You found the top engine move!`;
            themeClass = styles.themeBest;
            Icon = Star;
            break;
        case 'excellent':
            title = 'Excellent';
            description = `A very strong continuation.`;
            themeClass = styles.themeExcellent;
            Icon = ThumbsUp;
            break;
        case 'good':
            title = 'Good Move';
            description = `A solid move that maintains the position.`;
            themeClass = styles.themeGood;
            Icon = Check;
            break;
        default:
            title = 'Position Evaluated';
            description = `The best engine continuation is ${bestMove}.`;
            break;
    }

    return (
        <div className={`${styles.panel} ${themeClass}`}>
            <div className={styles.innerContent}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconWrapper}><Icon size={16} className={styles.icon} strokeWidth={2.5}/></div>
                        <span className={styles.title}>{title}</span>
                    </div>
                    <span className={styles.evalBadge}>{evalText}</span>
                </div>
                
                <p className={styles.description}>
                    {description}
                </p>

                {multiPv && multiPv.length > 0 && (
                    <div className={styles.pvBox}>
                        <span className={styles.pvLabel}>TOP ENGINE LINES:</span>
                        <div className={styles.pvList}>
                            {multiPv.map((line, i) => {
                                let lineEvalText = '';
                                if (line.mate !== null) {
                                    const multiplier = turn === 'w' ? 1 : -1;
                                    const absMate = line.mate * multiplier;
                                    lineEvalText = `M${Math.abs(absMate)}`;
                                } else if (line.evaluation !== null) {
                                    const multiplier = turn === 'w' ? 1 : -1;
                                    const absEval = line.evaluation * multiplier;
                                    lineEvalText = `${absEval > 0 ? '+' : ''}${absEval.toFixed(1)}`;
                                }
                                
                                return (
                                    <div key={i} className={styles.pvRow}>
                                        {lineEvalText && <span className={styles.pvEvalBadge}>{lineEvalText}</span>}
                                        <span className={styles.pvText}>{line.pv}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {onRetry && (classification === 'blunder' || classification === 'mistake' || classification === 'inaccuracy') && (
                    <button onClick={onRetry} className={`${styles.retryBtn} active:scale-[0.97] transition-transform origin-center`}>
                        Retry Mistake
                    </button>
                )}
            </div>
            
            {(onPrevMistake || onNextMistake) && (
                <div className={styles.mistakeNav}>
                    <button onClick={onPrevMistake} className={`${styles.navBtn} active:scale-[0.97] transition-transform origin-center`}>
                        <ArrowRightCircle size={14} className={styles.chevronLeft} /> Prev Mistake
                    </button>
                    <button onClick={onNextMistake} className={`${styles.navBtn} active:scale-[0.97] transition-transform origin-center`}>
                        Next Mistake <ArrowRightCircle size={14} className={styles.chevronRight} />
                    </button>
                </div>
            )}
        </div>
    );
});
