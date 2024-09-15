import BackButton from '@/components/back_button';
import ChessUrlWrapper from '@/components/chess/chess_from_url';
import ChessBoardPlayable from '@/components/chess/chess_user_playable';
import defaultPage from '@/components/default';
import { Suspense } from 'react';


export default function Home() {
    return defaultPage(
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <ChessBoardPlayable />
            </Suspense>
            <BackButton />
        </>
    );
}
