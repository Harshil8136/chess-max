'use client';

import React from 'react';
import styles from '@/app/page.module.css';

interface WelcomeScreenProps {
    onPlayNow: () => void;
}

export default function WelcomeScreen({ onPlayNow }: WelcomeScreenProps) {
    return (
        <div className={styles.welcome}>
            <div className={styles.welcomeCard}>
                <div className={styles.welcomeHero}>
                    <span className={styles.welcomePiece}>♜</span>
                    <span className={styles.welcomePiece}>♛</span>
                    <span className={styles.welcomePiece}>♞</span>
                </div>
                <h1 className={styles.welcomeTitle}>
                    Chess <span style={{ color: 'var(--accent-green)' }}>Max</span>
                </h1>
                <p className={styles.welcomeSubtitle}>
                    Challenge the computer at any skill level. From Beginner to Grandmaster — how far can you go?
                </p>
                <button
                    className={styles.welcomeButton}
                    onClick={onPlayNow}
                >
                    Play Now
                </button>
                <div className={styles.welcomeFeatures}>
                    <span className={styles.welcomeFeature}>♟ ELO 400–2000</span>
                    <span className={styles.welcomeFeature}>⚡ Offline</span>
                    <span className={styles.welcomeFeature}>🔊 Sound FX</span>
                    <span className={styles.welcomeFeature}>📊 Analysis</span>
                </div>
            </div>
        </div>
    );
}
