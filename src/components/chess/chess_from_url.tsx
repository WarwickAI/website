"use client";

// Shitty wrapper because useSearchParams() can only be done in components?

import { useSearchParams } from "next/navigation";
import ChessBoard from "./board";
import BackButton from "../back_button";

export default function ChessUrlWrapper() {
  const searchParams = useSearchParams();
  const fenString = searchParams.get("fenString");

  // Fallback to default position if no fenString is present
  const defaultFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const boardFEN = fenString ? fenString : defaultFEN;

  return <ChessBoard fenString={boardFEN} />;
}
