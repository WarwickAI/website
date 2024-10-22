// Chess Board Piece
import { Piece as PieceClass } from "chess.js";
import styles from "./board.module.css";

export default function Piece(props: {
  piece: PieceClass;
  extraClasses?: string;
}) {
  const className = `${styles.chessPiece} ${styles[props.piece.color === "w" ? "white" : "black"]} ${styles[props.piece.type]}`;

  return <div className={className}></div>;
}
