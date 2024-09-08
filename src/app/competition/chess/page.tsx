"use client"

import { useSearchParams } from 'next/navigation';
import BackButton from "@/components/back_button";
import ChessBoard from "@/components/chess/board";
import defaultPage from "@/components/default";

export default function Home() {
    const searchParams = useSearchParams();
    const fenString = searchParams.get('fenString');

    // Fallback to default position
    const defaultFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const boardFEN = fenString ? fenString : defaultFEN;

    return defaultPage(
        <div>
            <ChessBoard fenString={boardFEN} />
            <BackButton />
        </div>,
    );
}
