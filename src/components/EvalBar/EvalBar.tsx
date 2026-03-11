'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './EvalBar.module.css';

interface EvalBarProps {
    evaluation: number | null;
    mate: number | null;
    flipped?: boolean;
}

export default React.memo(function EvalBar({ evaluation, mate, flipped = false }: EvalBarProps) {
    let whitePercentage = 50;
    let displayText = '0.0';

    if (mate !== null) {
        if (mate > 0) {
            whitePercentage = 100;
            displayText = `M${mate}`;
        } else {
            whitePercentage = 0;
            displayText = `M${Math.abs(mate)}`;
        }
    } else if (evaluation !== null) {
        // Clamp eval to [-10, 10] range for display
        const clampedEval = Math.max(-10, Math.min(10, evaluation));
        // Convert to percentage (sigmoid-like mapping)
        whitePercentage = 50 + (clampedEval / 10) * 45;
        displayText = evaluation >= 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
    }

    if (flipped) {
        whitePercentage = 100 - whitePercentage;
    }

    const isWhiteAdvantage = (mate !== null ? mate > 0 : (evaluation ?? 0) >= 0);

    return (
        <div className={styles.evalBar}>
            <motion.div
                className={styles.fill}
                animate={{ height: `${whitePercentage}%` }}
                initial={{ height: '50%' }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
            <span
                className={`${styles.evalLabel} ${isWhiteAdvantage ? styles.evalLabelTop : styles.evalLabelBottom} ${mate !== null ? styles.mate : ''}`}
            >
                {displayText}
            </span>
        </div>
    );
});
