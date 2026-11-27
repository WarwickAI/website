import { type PenaltyRow, validatePenalty } from './model'
import { collaboratorsAt } from './team-status'

export interface DatabaseRows {
  projects: { id: string; endDate: Date | null; teamsLockAt: Date | null }[]
  teams: { id: string; projectId: string }[]
  participants: { id: string; projectId: string; userId: string }[]
  teamMembers: { participantId: string; teamId: string }[]
  repositories: { id: string; teamId: string; fullName: string }[]
  collaborators: {
    repositoryId: string
    githubUserId: string
    addedAt: Date
    removedAt: Date | null
  }[]
  submissions: { id: string; repositoryId: string }[]
  rounds: { id: string; projectId: string; number: number }[]
  roundResults: { roundId: string; submissionId: string }[]
  penalties: PenaltyRow[]
  userIdOfGithub: Map<string, string>
}

// Rounds played before teams existed, which may have two seats for one team
export const PAST_DUPLICATE_SEATS_THROUGH: Record<string, number> = { poker: 7 }

// The rules listed in db/config.ts. Problems break one; flags are worth a look
export function checkIntegrity(
  rows: DatabaseRows,
  now: Date,
): { problems: string[]; flags: string[] } {
  const problems: string[] = []
  const flags: string[] = []

  const projectOfTeam = new Map(rows.teams.map((t) => [t.id, t.projectId]))
  const participants = new Map(rows.participants.map((p) => [p.id, p]))
  const repos = new Map(rows.repositories.map((r) => [r.id, r]))
  const teamOfSubmission = new Map(
    rows.submissions.map((s) => [s.id, repos.get(s.repositoryId)?.teamId]),
  )
  const rounds = new Map(rows.rounds.map((r) => [r.id, r]))
  const teamName = (teamId: string) =>
    rows.repositories
      .filter((r) => r.teamId === teamId)
      .map((r) => r.fullName)
      .join(', ') || `team ${teamId}`

  // 1. A team member's team is in the same competition as their Participant
  const teamOfUser = new Map<string, string>() // `${projectId}:${userId}` -> team
  for (const member of rows.teamMembers) {
    const participant = participants.get(member.participantId)
    const teamProject = projectOfTeam.get(member.teamId)
    if (!participant || participant.projectId !== teamProject) {
      problems.push(
        `Participant ${member.participantId} is on ${teamName(member.teamId)}, which is in another competition`,
      )
      continue
    }
    teamOfUser.set(
      `${participant.projectId}:${participant.userId}`,
      member.teamId,
    )
  }

  // 2. A round's results come from teams in that round's competition, and
  // 3. a team has one result per round
  const seats = new Map<string, number>()
  for (const result of rows.roundResults) {
    const round = rounds.get(result.roundId)
    const teamId = teamOfSubmission.get(result.submissionId)
    if (!round || !teamId) continue
    if (projectOfTeam.get(teamId) !== round.projectId) {
      problems.push(
        `Round ${round.number} of ${round.projectId} has a result for ${teamName(teamId)}, from another competition`,
      )
      continue
    }
    const key = `${round.id}:${teamId}`
    seats.set(key, (seats.get(key) ?? 0) + 1)
    if (
      seats.get(key) === 2 &&
      round.number > (PAST_DUPLICATE_SEATS_THROUGH[round.projectId] ?? 0)
    ) {
      problems.push(
        `${teamName(teamId)} has more than one result in ${round.projectId} round ${round.number}`,
      )
    }
  }

  // 4–6. Penalties
  for (const p of rows.penalties) {
    const issues = validatePenalty({
      teamId: p.teamId ?? undefined,
      participantId: p.participantId ?? undefined,
      kind: p.kind,
      points: p.points ?? undefined,
      beforeRound: p.beforeRound ?? undefined,
      reason: p.reason,
    })
    for (const issue of issues) problems.push(`Penalty ${p.id}: ${issue}`)
  }

  // Signed-in people on other teams who can push to a team's repos
  const current = collaboratorsAt(rows.collaborators, now)
  const pushersOnOtherTeams = (teamId: string) => {
    const projectId = projectOfTeam.get(teamId)
    const people: { githubUserId: string; otherTeamId: string }[] = []
    for (const c of current) {
      if (repos.get(c.repositoryId)?.teamId !== teamId) continue
      const userId = rows.userIdOfGithub.get(c.githubUserId)
      const otherTeamId = userId && teamOfUser.get(`${projectId}:${userId}`)
      if (otherTeamId && otherTeamId !== teamId)
        people.push({ githubUserId: c.githubUserId, otherTeamId })
    }
    return people
  }

  const running = new Set(
    rows.projects
      .filter((p) => !p.endDate || now <= p.endDate)
      .map((p) => p.id),
  )
  const membersOf = new Map<string, string[]>()
  for (const member of rows.teamMembers) {
    membersOf.set(member.teamId, [
      ...(membersOf.get(member.teamId) ?? []),
      member.participantId,
    ])
  }

  // Memberless teams whose people are on other teams may need merging
  for (const team of rows.teams) {
    if (!running.has(team.projectId) || membersOf.get(team.id)?.length) continue
    const people = pushersOnOtherTeams(team.id)
    if (people.length) {
      flags.push(
        `${teamName(team.id)} has no members, but ${people.map((p) => p.githubUserId).join(', ')} can push to it from ` +
          `${[...new Set(people.map((p) => teamName(p.otherTeamId)))].join(', ')}. If it's the same entry, move the repo with db/move-repo.ts`,
      )
    }
  }

  // Someone on a team who can still push to a disqualified or hidden team
  const banned = new Set<string>()
  for (const p of rows.penalties) {
    if (p.liftedAt || (p.kind !== 'dsq' && p.kind !== 'hidden')) continue
    if (p.teamId) banned.add(p.teamId)
    for (const member of rows.teamMembers) {
      if (p.participantId && member.participantId === p.participantId)
        banned.add(member.teamId)
    }
  }
  for (const teamId of banned) {
    for (const person of pushersOnOtherTeams(teamId)) {
      flags.push(
        `${person.githubUserId} is on ${teamName(person.otherTeamId)} but can push to ${teamName(teamId)}, which is disqualified`,
      )
    }
  }

  return { problems, flags }
}
