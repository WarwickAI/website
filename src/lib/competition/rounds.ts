import type { CompetitionData } from './model'
import type { TeamState, TeamStatus } from './team-status'

// From poker's `poker run --snapshots ... --results round-8.json`
export interface RoundResultsFile {
  playedAt: string
  complete: boolean // false if the round was stopped before it finished
  seed?: number | null
  hands?: number
  players: RoundPlayer[]
}

export interface RoundPlayer {
  name: string
  repo: string | null // null for players who aren't a team, such as example bots added to make up the numbers
  commit: string | null
  place: number
  score: number
  [detail: string]: unknown // anything else the project records, e.g. poker's peakChips
}

export interface MatchCandidate {
  submissionId: string
  projectId: string
  teamId: string
  repoFullName: string
  commitHash: string
}

export interface ResultRow {
  submissionId: string
  teamId: string
  repo: string
  place: number
  points: number
  details: Record<string, unknown>
}

export function parseResults(json: unknown): RoundResultsFile {
  const results = json as Partial<RoundResultsFile> | null
  if (
    !results ||
    typeof results !== 'object' ||
    !Array.isArray(results.players)
  ) {
    throw new Error('Expected a results file with a list of players')
  }
  if (
    typeof results.playedAt !== 'string' ||
    isNaN(Date.parse(results.playedAt))
  ) {
    throw new Error(
      'Expected the results file to say when it was played (playedAt)',
    )
  }
  for (const player of results.players) {
    if (
      typeof player?.name !== 'string' ||
      !Number.isInteger(player.place) ||
      typeof player.score !== 'number' ||
      (player.repo !== null && typeof player.repo !== 'string') ||
      (player.commit !== null && typeof player.commit !== 'string')
    ) {
      throw new Error(
        `Expected every player to have a name, repo, commit, place and score, but got ${JSON.stringify(player)}`,
      )
    }
  }
  return results as RoundResultsFile
}

// Matches each player to the submission which played, by commit, so renamed
// repos still match. Anything that doesn't match cleanly is a problem
export function matchResults(
  results: RoundResultsFile,
  candidates: MatchCandidate[],
  projectId: string,
): { rows: ResultRow[]; skipped: string[]; problems: string[] } {
  const rows: ResultRow[] = []
  const skipped: string[] = []
  const problems: string[] = []
  const playerOfTeam = new Map<string, string>()

  for (const player of results.players) {
    if (player.repo === null || player.commit === null) {
      skipped.push(player.name)
      continue
    }

    const withCommit = candidates.filter((c) => c.commitHash === player.commit)
    const sameName = withCommit.filter(
      (c) => c.repoFullName.toLowerCase() === player.repo!.toLowerCase(),
    )
    const submission = withCommit.length === 1 ? withCommit[0] : sameName[0]
    if (!submission) {
      problems.push(
        withCommit.length
          ? `${player.repo}: commit ${player.commit} is in ${withCommit.map((c) => c.repoFullName).join(' and ')}, but not ${player.repo}`
          : `${player.repo}: there is no submission for commit ${player.commit}`,
      )
      continue
    }
    if (submission.projectId !== projectId) {
      problems.push(
        `${player.repo}: commit ${player.commit} is a submission to ${submission.projectId}, not ${projectId}`,
      )
      continue
    }
    const teammate = playerOfTeam.get(submission.teamId)
    if (teammate) {
      problems.push(
        `${player.repo} and ${teammate} are the same team, which can only play once`,
      )
      continue
    }
    playerOfTeam.set(submission.teamId, player.repo)

    const { name, repo: _repo, commit, place, score, ...details } = player
    rows.push({
      submissionId: submission.submissionId,
      teamId: submission.teamId,
      repo: submission.repoFullName,
      place,
      points: score,
      details,
    })
  }

  return { rows, skipped, problems }
}

// - latest takes each team's most recent submission, e.g. for a tournament round
// - best takes each team's highest score, e.g. for final testing
export const PICK_MODES = ['latest', 'best'] as const
export type PickMode = (typeof PICK_MODES)[number]

export interface PickedBot {
  teamId: string
  repositoryId: string
  repoFullName: string
  submission: CompetitionData['submissions'][number]
}

// One on-time submission per active team, best score first
export function pickBots(
  data: CompetitionData,
  statuses: Map<string, TeamStatus>,
  mode: PickMode,
): PickedBot[] {
  const { endDate } = data.project
  const repos = new Map(data.repositories.map((r) => [r.id, r]))

  const picked = new Map<string, PickedBot>()
  for (const submission of data.submissions) {
    if (endDate && submission.submittedAt > endDate) continue
    const repo = repos.get(submission.repositoryId)
    if (!repo || statuses.get(repo.teamId)?.state !== 'active') continue

    const current = picked.get(repo.teamId)
    if (!current || isPreferred(submission, current.submission, mode)) {
      picked.set(repo.teamId, {
        teamId: repo.teamId,
        repositoryId: repo.id,
        repoFullName: repo.fullName,
        submission,
      })
    }
  }
  return [...picked.values()].sort(
    (a, b) => b.submission.score - a.submission.score,
  )
}

export interface LeftOutBot {
  teamId: string
  repoFullName: string
  state: Exclude<TeamState, 'active'>
  // For a hold: who on another team can push to it
  holdBy: { who: string; otherRepoFullName: string }[]
}

// Teams with an on-time submission that pickBots leaves out
export function leftOutBots(
  data: CompetitionData,
  statuses: Map<string, TeamStatus>,
): LeftOutBot[] {
  const { endDate } = data.project
  const repos = new Map(data.repositories.map((r) => [r.id, r]))
  const users = new Map(data.users.map((u) => [u.id, u.name]))
  const repoOf = (teamId: string) =>
    repos.get(statuses.get(teamId)?.newestRepositoryId ?? '')?.fullName ??
    data.repositories.find((r) => r.teamId === teamId)?.fullName ??
    teamId

  const left = new Map<string, LeftOutBot>()
  for (const submission of data.submissions) {
    if (endDate && submission.submittedAt > endDate) continue
    const repo = repos.get(submission.repositoryId)
    const status = repo && statuses.get(repo.teamId)
    if (!status || status.state === 'active' || left.has(status.teamId))
      continue
    left.set(status.teamId, {
      teamId: status.teamId,
      repoFullName: repoOf(status.teamId),
      state: status.state,
      holdBy: status.holdReasons.map((r) => ({
        who:
          users.get(data.userIdOfGithub.get(r.githubUserId) ?? '') ??
          `GitHub ${r.githubUserId}`,
        otherRepoFullName: repoOf(r.otherTeamId),
      })),
    })
  }
  return [...left.values()].sort((a, b) =>
    a.repoFullName.localeCompare(b.repoFullName),
  )
}

export function leftOutReason(bot: LeftOutBot): string {
  switch (bot.state) {
    case 'onHold':
      return `on hold: ${bot.holdBy.map((h) => `${h.who} (on ${h.otherRepoFullName})`).join(', ')} can push to it`
    case 'unclaimed':
      return 'unclaimed: nobody on the team has signed in'
    case 'dsq':
      return 'disqualified'
    case 'hidden':
      return 'hidden'
    case 'left':
      return 'nobody is on it: its people are on other teams'
  }
}

function isPreferred(
  a: { score: number; submittedAt: Date },
  b: { score: number; submittedAt: Date },
  mode: PickMode,
): boolean {
  if (mode === 'best' && a.score !== b.score) return a.score > b.score
  return a.submittedAt > b.submittedAt
}
