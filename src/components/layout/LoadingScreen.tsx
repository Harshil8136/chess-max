'use client';

import React from 'react';
import styles from '@/app/page.module.css';

export default function LoadingScreen() {
    return (
        <div className={styles.loading}>
            <div className={styles.loadingPiece}>♞</div>
            <div className={styles.loadingSpinner} />
            <div className={styles.loadingText}>Warming up the engine...</div>
        </div>
    );
}
