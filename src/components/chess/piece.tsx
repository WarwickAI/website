// Chess Board Piece
import { Piece as PieceClass } from '@/classes/chess/piece';
import styles from './board.module.css';

export default function Piece(props: { piece: PieceClass, extraClasses?: string }) {
    const className = `${styles.chessPiece} ${styles[props.piece.colour]} ${styles[props.piece.name]}`;

    return (
        <div className={className}></div>
    );
} 
