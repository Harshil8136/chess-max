'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { EngineState, EngineResponse } from '@/types/chess';
import { EloLevel } from '@/types/chess';

export interface UseStockfishReturn {
    engineState: EngineState;
    evaluation: number | null;
    mate: number | null;
    bestMove: string | null;
    depth: number;
    isThinking: boolean;
    pv: string | null;
    multiPv: { multipv: number; pv: string; evaluation: number | null; mate: number | null }[];
    evalFen: string | null;

    initEngine: () => void;
    configureElo: (level: EloLevel) => void;
    requestMove: (fen: string, level: EloLevel) => void;
    requestEval: (fen: string) => void;
    requestAnalysis: (fen: string, onResult?: (data: { bestMove: string, evaluation: number | null, mate: number | null }) => void) => void;
    requestBatchAnalysis: (fens: string[], onProgress: (index: number, data: { bestMove: string, evaluation: number | null, mate: number | null }) => void, onComplete: () => void) => void;
    stopEngine: () => void;
}

export function useStockfish(): UseStockfishReturn {
    const workerRef = useRef<Worker | null>(null);
    const [engineState, setEngineState] = useState<EngineState>('idle');
    const [evaluation, setEvaluation] = useState<number | null>(null);
    const [mate, setMate] = useState<number | null>(null);
    const [bestMove, setBestMove] = useState<string | null>(null);
    const [depth, setDepth] = useState(0);
    const [pv, setPv] = useState<string | null>(null);
    const [multiPv, setMultiPv] = useState<{ multipv: number; pv: string; evaluation: number | null; mate: number | null }[]>([]);
    const [evalFen, setEvalFen] = useState<string | null>(null);

    const onBestMoveCallback = useRef<((move: string) => void) | null>(null);
    const onAnalysisCallback = useRef<((data: { bestMove: string, evaluation: number | null, mate: number | null }) => void) | null>(null);
    const latestEvalRef = useRef<{ evaluation: number | null, mate: number | null }>({ evaluation: null, mate: null });
    const searchTypeRef = useRef<'idle' | 'play' | 'eval' | 'analysis' | 'batch'>('idle');

    const batchFensRef = useRef<string[]>([]);
    const batchIndexRef = useRef<number>(0);
    const onBatchProgressRef = useRef<((index: number, data: { bestMove: string, evaluation: number | null, mate: number | null }) => void) | null>(null);
    const onBatchCompleteRef = useRef<(() => void) | null>(null);

    const handleWorkerMessage = useCallback((e: MessageEvent) => {
        const line = typeof e.data === 'string' ? e.data.trim() : '';

        if (line === 'uciok' || line === 'readyok') {
            setEngineState('ready');
        } else if (line.startsWith('bestmove')) {
            const parts = line.split(' ');
            const objBestMove = parts[1];
            
            if (searchTypeRef.current === 'play') {
                setBestMove(objBestMove);
                if (onBestMoveCallback.current) {
                    onBestMoveCallback.current(objBestMove);
                    onBestMoveCallback.current = null;
                }
            }
            
            if (searchTypeRef.current === 'analysis' && onAnalysisCallback.current) {
                onAnalysisCallback.current({
                    bestMove: objBestMove,
                    evaluation: latestEvalRef.current.evaluation,
                    mate: latestEvalRef.current.mate,
                });
                onAnalysisCallback.current = null;
            }
            
            if (searchTypeRef.current === 'batch' && onBatchProgressRef.current) {
                onBatchProgressRef.current(batchIndexRef.current, {
                    bestMove: objBestMove,
                    evaluation: latestEvalRef.current.evaluation,
                    mate: latestEvalRef.current.mate,
                });
                
                batchIndexRef.current++;
                if (batchIndexRef.current < batchFensRef.current.length) {
                    const nextFen = batchFensRef.current[batchIndexRef.current];
                    latestEvalRef.current = { evaluation: null, mate: null };
                    workerRef.current?.postMessage(`position fen ${nextFen}`);
                    workerRef.current?.postMessage('go movetime 150');
                    return; // Engine keeps thinking, skip resetting to ready
                } else {
                    if (onBatchCompleteRef.current) onBatchCompleteRef.current();
                    onBatchProgressRef.current = null;
                    onBatchCompleteRef.current = null;
                }
            }
            
            searchTypeRef.current = 'idle';
            setEngineState('ready');
        } else if (line.startsWith('info') && line.includes('score')) {
            const depthMatch = line.match(/depth (\d+)/);
            const scoreMatch = line.match(/score cp (-?\d+)/);
            const mateMatch = line.match(/score mate (-?\d+)/);
            const pvMatch = line.match(/ pv (.+)/); // Space added to avoid matching "multipv"
            const multipvMatch = line.match(/multipv (\d+)/);

            const multipvIndex = multipvMatch ? parseInt(multipvMatch[1], 10) : 1;

            let evalVal: number | null = null;
            let mateVal: number | null = null;
            let pvVal: string | null = null;

            if (depthMatch) setDepth(parseInt(depthMatch[1], 10));
            if (scoreMatch) {
                evalVal = parseInt(scoreMatch[1], 10) / 100;
                if (multipvIndex === 1) {
                    setEvaluation(evalVal);
                    latestEvalRef.current.evaluation = evalVal;
                    latestEvalRef.current.mate = null;
                }
            }
            if (mateMatch) {
                mateVal = parseInt(mateMatch[1], 10);
                if (multipvIndex === 1) {
                    setMate(mateVal);
                    latestEvalRef.current.mate = mateVal;
                    latestEvalRef.current.evaluation = null;
                }
            }
            if (pvMatch) {
                pvVal = pvMatch[1];
                if (multipvIndex === 1) setPv(pvVal);
            }

            if (pvVal) {
                setMultiPv(prev => {
                    const next = [...prev];
                    const existingIndex = next.findIndex(x => x.multipv === multipvIndex);
                    if (existingIndex >= 0) {
                        next[existingIndex] = {
                            ...next[existingIndex],
                            pv: pvVal!,
                            evaluation: evalVal !== null ? evalVal : next[existingIndex].evaluation,
                            mate: mateVal !== null ? mateVal : next[existingIndex].mate
                        };
                    } else {
                        next.push({ multipv: multipvIndex, pv: pvVal!, evaluation: evalVal, mate: mateVal });
                    }
                    return next.sort((a, b) => a.multipv - b.multipv);
                });
            }
        }
    }, [setEngineState, setBestMove, setDepth, setEvaluation, setMate, setPv]);

    const initEngine = useCallback(() => {
        if (workerRef.current) return;

        setEngineState('loading');

        // Directly load the Stockfish JS file which functions as a Web Worker
        const worker = new Worker('/stockfish/stockfish-nnue-16-single.js');

        worker.onmessage = handleWorkerMessage;
        worker.onerror = () => {
            setEngineState('idle');
        };

        workerRef.current = worker;

        // Initialize the engine by sending 'uci'
        worker.postMessage('uci');
    }, [handleWorkerMessage]);

    const configureElo = useCallback((level: EloLevel) => {
        if (!workerRef.current) return;

        if (level.skillLevel !== undefined) {
            workerRef.current.postMessage(`setoption name Skill Level value ${level.skillLevel}`);
        }
        if (level.elo !== undefined) {
            workerRef.current.postMessage(`setoption name UCI_LimitStrength value true`);
            workerRef.current.postMessage(`setoption name UCI_Elo value ${level.elo}`);
        }
        workerRef.current.postMessage('isready');
    }, []);

    const requestMove = useCallback((fen: string, level: EloLevel) => {
        if (!workerRef.current) return;

        // Stop any in-flight eval so the worker is free immediately
        workerRef.current.postMessage('stop');
        searchTypeRef.current = 'play';

        setEngineState('thinking');
        setBestMove(null);
        setEvalFen(fen);

        // Configure difficulty
        workerRef.current.postMessage('setoption name MultiPV value 1');
        if (level.skillLevel !== undefined) {
            workerRef.current.postMessage(`setoption name Skill Level value ${level.skillLevel}`);
        }
        if (level.elo !== undefined) {
            workerRef.current.postMessage(`setoption name UCI_LimitStrength value true`);
            workerRef.current.postMessage(`setoption name UCI_Elo value ${level.elo}`);
        }

        // Set position and search with movetime only (no depth constraint)
        workerRef.current.postMessage(`position fen ${fen}`);
        workerRef.current.postMessage(`go movetime ${level.moveTime || 500}`);
    }, []);

    const requestEval = useCallback((fen: string) => {
        if (!workerRef.current) return;
        
        searchTypeRef.current = 'eval';
        workerRef.current.postMessage(`position fen ${fen}`);
        workerRef.current.postMessage('go depth 8');
    }, []);

    const requestAnalysis = useCallback((fen: string, onResult?: (data: { bestMove: string, evaluation: number | null, mate: number | null }) => void) => {
        if (!workerRef.current) return;

        // Reset latest eval for new position
        latestEvalRef.current = { evaluation: null, mate: null };
        if (onResult) {
            onAnalysisCallback.current = onResult;
        }

        // Stop any current thought
        workerRef.current.postMessage('stop');
        searchTypeRef.current = 'analysis';
        setEngineState('thinking');
        setEvalFen(fen);
        setMultiPv([]);

        // Quick 750ms analysis with MultiPV=3
        workerRef.current.postMessage('setoption name MultiPV value 3');
        workerRef.current.postMessage(`position fen ${fen}`);
        workerRef.current.postMessage('go movetime 750');
    }, []);

    const requestBatchAnalysis = useCallback((fens: string[], onProgress: (index: number, data: { bestMove: string, evaluation: number | null, mate: number | null }) => void, onComplete: () => void) => {
        if (!workerRef.current || fens.length === 0) return;

        workerRef.current.postMessage('stop');
        searchTypeRef.current = 'batch';
        setEngineState('thinking');
        
        batchFensRef.current = fens;
        batchIndexRef.current = 0;
        onBatchProgressRef.current = onProgress;
        onBatchCompleteRef.current = onComplete;
        
        latestEvalRef.current = { evaluation: null, mate: null };
        workerRef.current.postMessage('setoption name MultiPV value 1');
        workerRef.current.postMessage(`position fen ${fens[0]}`);
        workerRef.current.postMessage('go movetime 150');
    }, []);

    const stopEngine = useCallback(() => {
        if (!workerRef.current) return;
        workerRef.current.postMessage('stop');
        if (searchTypeRef.current === 'batch') {
            searchTypeRef.current = 'idle';
            onBatchProgressRef.current = null;
            onBatchCompleteRef.current = null;
            setEngineState('ready');
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.postMessage('quit');
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    return {
        engineState,
        evaluation,
        mate,
        bestMove,
        depth,
        isThinking: engineState === 'thinking',
        pv,
        multiPv,
        evalFen,
        initEngine,
        configureElo,
        requestMove,
        requestEval,
        requestAnalysis,
        requestBatchAnalysis,
        stopEngine,
    };
}
