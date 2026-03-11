'use client';

import styles from './PromotionDialog.module.css';

// Standard chess piece Unicode characters for promotion choices
const PROMOTION_PIECES = [
    { piece: 'q', label: 'Queen',  whiteIcon: '♛', blackIcon: '♕' },
    { piece: 'r', label: 'Rook',   whiteIcon: '♜', blackIcon: '♖' },
    { piece: 'b', label: 'Bishop', whiteIcon: '♝', blackIcon: '♗' },
    { piece: 'n', label: 'Knight', whiteIcon: '♞', blackIcon: '♘' },
] as const;

interface PromotionDialogProps {
    color: 'w' | 'b';
    onSelect: (piece: string) => void;
    onCancel: () => void;
}

export default function PromotionDialog({ color, onSelect, onCancel }: PromotionDialogProps) {
    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.title}>Promote to</div>
                <div className={styles.pieces}>
                    {PROMOTION_PIECES.map(({ piece, label, whiteIcon, blackIcon }) => (
                        <button
                            key={piece}
                            className={styles.pieceButton}
                            onClick={() => onSelect(piece)}
                            title={label}
                            aria-label={`Promote to ${label}`}
                        >
                            <span className={styles.pieceIcon}>
                                {color === 'w' ? whiteIcon : blackIcon}
                            </span>
                            <span className={styles.pieceLabel}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
