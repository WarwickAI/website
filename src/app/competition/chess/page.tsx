import BackButton from '@/components/back_button';
import ChessUrlWrapper from '@/components/chess/chess_from_url';
import defaultPage from '@/components/default';
import { Suspense } from 'react';


export default function Home() {
    return defaultPage(
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <ChessUrlWrapper />
            </Suspense>
            <BackButton />
        </>
    );
}
