// Chess Board Piece
import styles from './board.module.css';

export default function Piece(props: { pieceColour: string, pieceType: string, extraClasses?: string }) {
    const className = `${styles.chessPiece} ${styles[props.pieceColour.toLowerCase()]} ${styles[props.pieceType.toLowerCase()]}`;

    return (
        <div className={className}></div>
    );
} 
