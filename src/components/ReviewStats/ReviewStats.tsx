import React from 'react';
import { AccuracyStats } from '@/hooks/useAnalysis';
import styles from './ReviewStats.module.css';
import { Sparkles, Star, ThumbsUp, Check, HelpCircle, AlertTriangle, XOctagon } from 'lucide-react';

interface ReviewStatsProps {
    stats: AccuracyStats | null;
}

export default React.memo(function ReviewStats({ stats }: ReviewStatsProps) {
    if (!stats) return null;

    const StatRow = ({ icon: Icon, label, colorClass, wCount, bCount }: any) => (
        <div className={styles.statRow}>
            <div className={`${styles.iconLabel} ${colorClass}`}>
                <Icon size={16} strokeWidth={2.5}/>
                <span>{label}</span>
            </div>
            <div className={styles.counts}>
                <span className={styles.wCount}>{wCount}</span>
                <span className={styles.bCount}>{bCount}</span>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.mainHeader}>
                <span className={styles.mainTitle}>Accuracy</span>
            </div>
            
            <div className={styles.accuracyHeader}>
                <div className={styles.accuracyBox}>
                    <span className={styles.playerLabel}>WHITE</span>
                    <span className={styles.accuracyValue}>{stats.whiteAccuracy.toFixed(1)}%</span>
                </div>
                <div className={styles.vsWrapper}>
                    <div className={styles.vs}>VS</div>
                </div>
                <div className={styles.accuracyBox}>
                    <span className={styles.playerLabel}>BLACK</span>
                    <span className={styles.accuracyValue}>{stats.blackAccuracy.toFixed(1)}%</span>
                </div>
            </div>

            <div className={styles.statsGrid}>
                {/* Headers */}
                <div className={styles.statRowHeader}>
                    <div className={styles.columnLabel}>MOVE TYPE</div>
                    <div className={styles.countsHeader}>
                        <span className={styles.wCount}>W</span>
                        <span className={styles.bCount}>B</span>
                    </div>
                </div>
                
                <StatRow icon={Sparkles} label="Brilliant" colorClass={styles.colorBrilliant} wCount={stats.whiteCounts.brilliant || 0} bCount={stats.blackCounts.brilliant || 0} />
                <StatRow icon={Star} label="Best" colorClass={styles.colorBest} wCount={stats.whiteCounts.best || 0} bCount={stats.blackCounts.best || 0} />
                <StatRow icon={ThumbsUp} label="Excellent" colorClass={styles.colorExcellent} wCount={stats.whiteCounts.excellent || 0} bCount={stats.blackCounts.excellent || 0} />
                <StatRow icon={Check} label="Good" colorClass={styles.colorGood} wCount={stats.whiteCounts.good || 0} bCount={stats.blackCounts.good || 0} />
                <StatRow icon={HelpCircle} label="Inaccuracy" colorClass={styles.colorInaccuracy} wCount={stats.whiteCounts.inaccuracy || 0} bCount={stats.blackCounts.inaccuracy || 0} />
                <StatRow icon={AlertTriangle} label="Mistake" colorClass={styles.colorMistake} wCount={stats.whiteCounts.mistake || 0} bCount={stats.blackCounts.mistake || 0} />
                <StatRow icon={XOctagon} label="Blunder" colorClass={styles.colorBlunder} wCount={stats.whiteCounts.blunder || 0} bCount={stats.blackCounts.blunder || 0} />
            </div>
        </div>
    );
});
