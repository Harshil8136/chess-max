import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PositionAnalysis } from '@/hooks/useAnalysis';
import styles from './EvaluationGraph.module.css';

interface EvaluationGraphProps {
    analysisCache: Record<number, PositionAnalysis>;
    historyLength: number; // number of half moves played
    currentIndex: number;
    onGoToMove: (index: number) => void;
    isAnalysisComplete: boolean;
    analysisProgress: number;
    compact?: boolean;
}

export default React.memo(function EvaluationGraph({
    analysisCache,
    historyLength,
    currentIndex,
    onGoToMove,
    isAnalysisComplete,
    analysisProgress,
    compact = false
}: EvaluationGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    // Prepare data points
    // Y-axis uses a non-linear scale where large evals are compressed but not capped
    // Or we just cap it at +/- 10 and map mates to +/- 10.5
    const dataPoints = useMemo(() => {
        const points: { x: number; y: number; originalEval: number | null; originalMate: number | null }[] = [];
        // We include index 0 (initial position) up to historyLength
        for (let i = 0; i <= historyLength; i++) {
            const data = analysisCache[i];
            let y = 0;
            let originalEval = null;
            let originalMate = null;
            
            if (data) {
                originalEval = data.evaluation;
                originalMate = data.mate;

                if (data.mate !== null) {
                    y = data.mate > 0 ? 10.5 : -10.5;
                } else if (data.evaluation !== null) {
                    // Compress eval over 10
                    y = Math.max(-10, Math.min(10, data.evaluation));
                }
            }
            points.push({ x: i, y, originalEval, originalMate });
        }
        return points;
    }, [analysisCache, historyLength]);

    const numPoints = dataPoints.length;

    // SVG scaling helpers
    const width = 1000;
    const height = 150;
    const midY = height / 2;

    const getX = (i: number) => {
        if (numPoints <= 1) return 0;
        return (i / (numPoints - 1)) * width;
    };

    const getY = (yVal: number) => {
        // yVal is between -10.5 and 10.5
        // inverted because SVG y goes down
        const normalized = (yVal + 11) / 22; // 0 to 1
        return height - normalized * height;
    };

    // Construct SVG path for area (the area between the line and the middle axis)
    const { pathData, areaDataWhite, areaDataBlack } = useMemo(() => {
        if (numPoints === 0) return { pathData: '', areaDataWhite: '', areaDataBlack: '' };
        
        let pathStr = `M ${getX(0)} ${getY(dataPoints[0].y)}`;
        let areaW = `M ${getX(0)} ${midY} L ${getX(0)} ${getY(Math.max(0, dataPoints[0].y))}`;
        let areaB = `M ${getX(0)} ${midY} L ${getX(0)} ${getY(Math.min(0, dataPoints[0].y))}`;

        for (let i = 1; i < numPoints; i++) {
            const x = getX(i);
            const y = dataPoints[i].y;
            pathStr += ` L ${x} ${getY(y)}`;
            
            areaW += ` L ${x} ${getY(Math.max(0, y))}`;
            areaB += ` L ${x} ${getY(Math.min(0, y))}`;
        }
        
        areaW += ` L ${getX(numPoints - 1)} ${midY} Z`;
        areaB += ` L ${getX(numPoints - 1)} ${midY} Z`;

        return { pathData: pathStr, areaDataWhite: areaW, areaDataBlack: areaB };
    }, [dataPoints, numPoints]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || numPoints <= 1) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const pct = mouseX / rect.width;
        let index = Math.round(pct * (numPoints - 1));
        index = Math.max(0, Math.min(index, numPoints - 1));
        setHoverIndex(index);
    };

    const handleClick = () => {
        if (hoverIndex !== null) {
            onGoToMove(hoverIndex - 1);
        }
    };

    // We add +1 to currentIndex to map from historyIndex (-1 to N-1) to our 0 to N array
    const displayIndex = hoverIndex !== null ? hoverIndex : Math.max(0, Math.min(numPoints - 1, currentIndex + 1));
    const displayData = dataPoints[displayIndex] || { x: 0, y: 0, originalEval: null, originalMate: null };

    return (
        <div className={`${styles.container} ${compact ? styles.compactContainer : ''}`}>
            {!compact && (
                <div className={styles.header}>
                    <span className={styles.title}>Evaluation Graph</span>
                    <span className={styles.badge}>
                        {displayData.originalMate !== null 
                            ? `M${Math.abs(displayData.originalMate)}` 
                            : displayData.originalEval !== null
                                ? `${displayData.originalEval > 0 ? '+' : ''}${displayData.originalEval.toFixed(1)}`
                                : '0.0'}
                    </span>
                </div>
            )}

            <div 
                className={`${styles.graphWrapper} ${compact ? styles.compactGraph : ''}`} 
                ref={containerRef}
                onMouseMove={!compact ? handleMouseMove : undefined}
                onMouseLeave={!compact ? () => setHoverIndex(null) : undefined}
                onClick={!compact ? handleClick : undefined}
            >
                {!isAnalysisComplete && !compact && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.progressBarWrapper}>
                            <motion.div 
                                className={styles.progressBar}
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisProgress}%` }}
                                transition={{ ease: 'linear', duration: 0.1 }}
                            />
                        </div>
                        <span className={styles.progressText}>Analyzing... {analysisProgress}%</span>
                    </div>
                )}
                
                <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg} preserveAspectRatio="none">
                    {/* Zero line */}
                    <line x1="0" y1={midY} x2={width} y2={midY} className={styles.zeroLine} />
                    
                    {/* Areas */}
                    <path d={areaDataWhite} className={styles.areaWhite} />
                    <path d={areaDataBlack} className={styles.areaBlack} />
                    
                    {/* Main path */}
                    <motion.path 
                        d={pathData} 
                        className={styles.line} 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                    
                    {/* Current position marker */}
                    {!compact && (
                        <circle 
                            cx={getX(displayIndex)} 
                            cy={getY(displayData.y)} 
                            r="5" 
                            className={styles.marker} 
                        />
                    )}
                </svg>
            </div>
            {isAnalysisComplete && !compact && (
                <div className={styles.tickLabels}>
                    <span>Start</span>
                    <span>End</span>
                </div>
            )}
        </div>
    );
});
