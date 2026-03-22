import { motion } from 'framer-motion';
import { getPieceUrl } from './pieceUtils';
import styles from './InlinePromotionDialog.module.css';

interface InlinePromotionDialogProps {
    color: 'w' | 'b';
    pieceSet: string;
    onSelect: (piece: string) => void;
    onCancel: () => void;
    // The square from which the promotion is happening
    // Format: 'a8' etc. But we need its rank and file index to position correctly
    squareR: number;
    squareC: number;
}

const PROMOTION_PIECES = ['q', 'r', 'b', 'n'] as const;

export function InlinePromotionDialog({
    color,
    pieceSet,
    onSelect,
    onCancel,
    squareR,
    squareC,
}: InlinePromotionDialogProps) {
    // If white is promoting on rank 0 (visual top square), the dialog goes downwards.
    // However, we want it to sit EXACTLY ON the square and overflow down/up.
    // Lichess approach: stacked column of 4 pieces exactly on the file of promotion.
    // The top piece is on the promotion square, the other 3 extend towards the center.

    const direction = squareR === 0 ? 1 : -1;

    return (
        <div 
            className={styles.overlay} 
            onPointerDown={(e) => {
                e.stopPropagation();
                onCancel();
            }}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div
                className={styles.dialogColumn}
                style={{
                    left: `${squareC * 12.5}%`,
                    top: `${squareR * 12.5}%`,
                    flexDirection: direction === 1 ? 'column' : 'column-reverse',
                    transform: direction === 1 ? 'none' : 'translateY(-75%)', // translate up by 3 squares if pushing upwards
                }}
            >
                {PROMOTION_PIECES.map((piece, i) => (
                    <motion.div
                        key={piece}
                        className={styles.pieceSlot}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15, delay: i * 0.04 }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onSelect(piece);
                        }}
                    >
                        <img
                            src={getPieceUrl(color, piece, pieceSet)}
                            alt={`Promote to ${piece}`}
                            draggable={false}
                            className={styles.pieceImg}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
