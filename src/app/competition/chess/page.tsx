import BackButton from "@/components/back_button";
import ChessBoard from "@/components/chess/board";
import defaultPage from "@/components/default";
import Notice from "@/components/notice";

export default function Home() {
    return defaultPage(
        <div>
            <ChessBoard fenString={"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"} />
            <BackButton />
        </div>,
    );
}
