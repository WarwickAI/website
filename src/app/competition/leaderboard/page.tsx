// Competition leaderboard page
//
// We read the leaderboard from the Cloudflare R2 storage and display it in a
// table.

import Button from "@/components/button";
import defaultPage, { defaultPageNoSplash } from "@/components/default";
import { Pacman } from "@/components/pacman";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic"; // defaults to auto

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "FAKE_ACCOUNT_ID";
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "FAKE_BUCKET_NAME";
const ACCESS_KEY_ID =
  process.env.CLOUDFLARE_R2_S3_ACCESS_KEY_ID || "FAKE_ACCESS_KEY_ID";
const SECRET_ACCESS_KEY =
  process.env.CLOUDFLARE_R2_S3_SECRET_ACCESS_KEY || "FAKE_SECRET_ACCESS_KEY";

// Out bucket is in the EU jurisdiction, so we must use the eu endpoint, rather
// than ${accountId}.r2...
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

var cachedResults: string = "";
var lastUpdated = new Date();
const rateLimit = 60 * 5 * 1000; // 5 minutes
setInterval(forceLoadLeaderboard, rateLimit - 10000);

async function loadLeaderboard(): Promise<string> {
  // Load the leaderboard from the Cloudflare R2 storage.
  const currentTime = Date.now();
  if (cachedResults === "" || currentTime - lastUpdated.getTime() > rateLimit) {
    return forceLoadLeaderboard();
  }
  return cachedResults;
}

async function forceLoadLeaderboard(): Promise<string> {
  // Load the leaderboard from the Cloudflare R2 storage.
  console.log("Loading leaderboard from Cloudflare R2 storage.");
  try {
    const response = await S3.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: "player_stats.csv",
      }),
    );

    const text = await response.Body?.transformToString();
    if (text === undefined) {
      console.log("Failed to load leaderboard: response body is undefined.");
      return cachedResults;
    }
    cachedResults = text;
    lastUpdated = new Date();
    return cachedResults;
  } catch (e) {
    console.log("Failed to load leaderboard: " + e);
    return cachedResults;
  }
}

export default async function Home() {
  // Read the leaderboard from the Cloudflare R2 storage
  const leaderboardValues = await loadLeaderboard();
  const leaderboard = parseLeaderboard(leaderboardValues);

  if (leaderboard.length === 0) {
    return defaultPage(
      <div>
        <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">
          Pac-Man AI Competition Leaderboard
        </h1>

        <div className="justify-self-center">
          <p className="max-w-3xl pb-4 text-center font-mono text-lg text-wai-gray md:text-xl">
            No game have been played yet. The leaderboard will be updated some
            time after two people have submitted their agents.
          </p>
          <p className="max-w-3xl pb-4 text-center font-mono text-lg text-wai-gray md:text-xl">
            Please check back later!
          </p>
        </div>
        <Button
          enabled={true}
          href="/competition"
          text="Submit your agent"
          ariaLabel="Submit your agent."
          extraClasses="w-fit"
        />
      </div>,
    );
  }

  const firstStyle =
    "pt-6 pb-6 text-4xl font-bold animate-text bg-gradient-to-r from-blue-green via-purple to-blue-green bg-clip-text text-transparent";
  const secondStyle = "text-3xl font-bold text-purple";
  const thirdStyle = "text-2xl font-bold text-lavender";
  return defaultPageNoSplash(
    <>
      <h1 className="h-fit pt-[10vh] text-center font-mono text-5xl font-bold text-wai-gray">
        Pac-Man AI Competition Leaderboard
      </h1>

      <div className="pb-[10vh] pt-[10vh]">
        <Pacman />
      </div>

      <div className="grid justify-items-center overflow-x-auto  pt-12">
        <div className="rounded-lg border-4 border-wai-gray bg-pure-white shadow-sm shadow-wai-gray">
          <table className="h-fit w-fit max-w-3xl p-4 text-center font-mono font-bold text-wai-gray md:text-xl">
            <thead>
              <tr className="border-b-2">
                <th className="w-fit text-nowrap pl-2 pr-2">Player ID</th>
                <th className="w-fit text-nowrap pl-2 pr-2">Player</th>
                <th className="w-fit text-nowrap pl-2 pr-2">Wins</th>
                <th className="w-fit text-nowrap pl-2 pr-2">Draws</th>
                <th className="w-fit text-nowrap pl-2 pr-2">Losses</th>
                <th className="w-fit text-nowrap pl-2 pr-2">
                  Score Accumulated
                </th>
                <th className="w-fit text-nowrap pl-2 pr-2">Overall Score</th>
              </tr>
            </thead>
            <tbody className="w-fit text-center">
              {leaderboard.map((row, index) => {
                const first = index === 0;
                const second = index === 1;
                const third = index === 2;
                const style = first
                  ? firstStyle
                  : second
                    ? secondStyle
                    : third
                      ? thirdStyle
                      : "";
                return (
                  <tr key={index} className={style}>
                    <td className="pl-2 pr-2">{row.playerId}</td>
                    <td className="pl-2 pr-2">{row.playerName}</td>
                    <td className="pl-2 pr-2">{row.wins}</td>
                    <td className="pl-2 pr-2">{row.draws}</td>
                    <td className="pl-2 pr-2">{row.losses}</td>
                    <td className="pl-2 pr-2">{row.scoreAccumulated}</td>
                    <td className="pl-2 pr-2">{row.overallScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Button
        enabled={true}
        href="/competition"
        text="Submit your agent"
        ariaLabel="Submit your agent."
        extraClasses="w-fit"
      />
    </>,
  );
}

type LeaderboardRow = {
  // Player ID,Player Name,Total Wins,Total Draws,Total Losses,Total Score Accumulated,Overall Score
  playerId: string;
  playerName: string;
  wins: number;
  draws: number;
  losses: number;
  scoreAccumulated: number;
  overallScore: number;
};

function parseLeaderboard(leaderboard: string): LeaderboardRow[] {
  // Parse the leaderboard CSV and return an array of leaderboard rows.
  const rows = leaderboard.split("\n");
  rows.shift();

  // Check if the last row is empty, and remove it if it is.
  if (rows[rows.length - 1] === "") {
    rows.pop();
  }

  const leaderboardRows = rows.map(parseSingleLeaderboardRow);

  // Sort by overall score, then by wins, then by draws.
  const sortedLeaderboard = leaderboardRows.sort((a, b) => {
    if (a.overallScore === b.overallScore) {
      if (a.wins === b.wins) {
        return b.draws - a.draws;
      }
      return b.wins - a.wins;
    }
    return b.overallScore - a.overallScore;
  });
  return sortedLeaderboard;
}

function parseSingleLeaderboardRow(row: string): LeaderboardRow {
  // Parse a single leaderboard row.
  const separated = row.split(",");
  return {
    playerId: separated[0],
    playerName: separated[1],
    wins: parseInt(separated[2]),
    draws: parseInt(separated[3]),
    losses: parseInt(separated[4]),
    scoreAccumulated: parseInt(separated[5]),
    overallScore: parseInt(separated[6]),
  };
}
