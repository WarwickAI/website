import {
  db,
  and,
  eq,
  inArray,
  isNull,
  or,
  Account,
  Collaborator,
  Participant,
  Penalty,
  Project,
  Repository,
  Round,
  RoundResult,
  Submission,
  Team,
  TeamMember,
  User,
  LoginRecord,
} from 'astro:db'
import {
  type CompetitionData,
  type PenaltyKind,
  type PenaltyRow,
  validatePenalty,
  type NewPenalty,
} from './model'
import type { DatabaseRows } from './integrity'
import { randomUUID } from 'node:crypto'
import type { Octokit } from 'octokit'

// Reads and writes the database for the competition logic, which never does

const toPenalty = (p: typeof Penalty.$inferSelect): PenaltyRow => ({
  ...p,
  kind: p.kind as PenaltyKind,
})

// `inArray` with nothing to match would be invalid SQL
const among = <T>(column: Parameters<typeof inArray>[0], values: T[]) =>
  values.length ? inArray(column, values) : undefined

export async function loadCompetition(
  projectId: string,
): Promise<CompetitionData> {
  const project = await db
    .select()
    .from(Project)
    .where(eq(Project.id, projectId))
    .get()
  if (!project) throw new Error(`There's no project ${projectId}`)

  const [teams, participants, rounds] = await Promise.all([
    db.select().from(Team).where(eq(Team.projectId, projectId)),
    db.select().from(Participant).where(eq(Participant.projectId, projectId)),
    db.select().from(Round).where(eq(Round.projectId, projectId)),
  ])
  const teamIds = teams.map((t) => t.id)
  const participantIds = participants.map((p) => p.id)

  const [teamMembers, repositories, roundResults, penalties] =
    await Promise.all([
      teamIds.length
        ? db.select().from(TeamMember).where(among(TeamMember.teamId, teamIds))
        : [],
      teamIds.length
        ? db.select().from(Repository).where(among(Repository.teamId, teamIds))
        : [],
      rounds.length
        ? db
            .select()
            .from(RoundResult)
            .where(
              among(
                RoundResult.roundId,
                rounds.map((r) => r.id),
              ),
            )
        : [],
      teamIds.length || participantIds.length
        ? db
            .select()
            .from(Penalty)
            .where(
              or(
                among(Penalty.teamId, teamIds),
                among(Penalty.participantId, participantIds),
              ),
            )
        : [],
    ])
  const repoIds = repositories.map((r) => r.id)
  const [collaborators, submissions] = repoIds.length
    ? await Promise.all([
        db
          .select()
          .from(Collaborator)
          .where(among(Collaborator.repositoryId, repoIds)),
        db
          .select()
          .from(Submission)
          .where(among(Submission.repositoryId, repoIds)),
      ])
    : [[], []]

  // Participants, and collaborators who have signed in
  const participantUserIds = participants.map((p) => p.userId)
  const collaboratorIds = [...new Set(collaborators.map((c) => c.githubUserId))]
  const accounts =
    participantUserIds.length || collaboratorIds.length
      ? await db
          .select({ userId: Account.userId, accountId: Account.accountId })
          .from(Account)
          .where(
            and(
              eq(Account.providerId, 'github'),
              or(
                among(Account.userId, participantUserIds),
                among(Account.accountId, collaboratorIds),
              ),
            ),
          )
      : []
  const userIds = [
    ...new Set([...participantUserIds, ...accounts.map((a) => a.userId)]),
  ]
  const users = userIds.length
    ? await db
        .select({ id: User.id, name: User.name, image: User.image })
        .from(User)
        .where(among(User.id, userIds))
    : []

  return {
    project: {
      id: project.id,
      name: project.name,
      templateRepo: project.templateRepo,
      startDate: project.startDate,
      endDate: project.endDate ?? null,
      teamsLockAt: project.teamsLockAt ?? null,
    },
    teams: teams.map((t) => ({ id: t.id })),
    participants,
    teamMembers,
    users: users.map((u) => ({ ...u, image: u.image ?? null })),
    githubUserIdOf: new Map(accounts.map((a) => [a.userId, a.accountId])),
    userIdOfGithub: new Map(accounts.map((a) => [a.accountId, a.userId])),
    repositories: repositories.map((r) => ({
      ...r,
      githubRepoId: r.githubRepoId ?? null,
    })),
    collaborators: collaborators.map((c) => ({
      ...c,
      removedAt: c.removedAt ?? null,
    })),
    submissions: submissions.map((s) => ({
      ...s,
      snapshotUrl: s.snapshotUrl ?? null,
    })),
    rounds: rounds.map((r) => ({
      id: r.id,
      number: r.number,
      playedAt: r.playedAt,
    })),
    roundResults: roundResults.map((r) => ({
      id: r.id,
      roundId: r.roundId,
      submissionId: r.submissionId,
      place: r.place,
      points: r.points,
    })),
    penalties: penalties.map(toPenalty),
  }
}

// For the integrity check
export async function loadEverything(): Promise<DatabaseRows> {
  const [
    projects,
    teams,
    participants,
    teamMembers,
    repositories,
    collaborators,
    submissions,
    rounds,
    roundResults,
    penalties,
    accounts,
  ] = await Promise.all([
    db
      .select({
        id: Project.id,
        endDate: Project.endDate,
        teamsLockAt: Project.teamsLockAt,
      })
      .from(Project),
    db.select({ id: Team.id, projectId: Team.projectId }).from(Team),
    db
      .select({
        id: Participant.id,
        projectId: Participant.projectId,
        userId: Participant.userId,
      })
      .from(Participant),
    db
      .select({
        participantId: TeamMember.participantId,
        teamId: TeamMember.teamId,
      })
      .from(TeamMember),
    db
      .select({
        id: Repository.id,
        teamId: Repository.teamId,
        fullName: Repository.fullName,
      })
      .from(Repository),
    db.select().from(Collaborator),
    db
      .select({ id: Submission.id, repositoryId: Submission.repositoryId })
      .from(Submission),
    db
      .select({
        id: Round.id,
        projectId: Round.projectId,
        number: Round.number,
      })
      .from(Round),
    db
      .select({
        roundId: RoundResult.roundId,
        submissionId: RoundResult.submissionId,
      })
      .from(RoundResult),
    db.select().from(Penalty),
    db
      .select({ userId: Account.userId, accountId: Account.accountId })
      .from(Account)
      .where(eq(Account.providerId, 'github')),
  ])
  return {
    projects: projects.map((p) => ({
      ...p,
      endDate: p.endDate ?? null,
      teamsLockAt: p.teamsLockAt ?? null,
    })),
    teams,
    participants,
    teamMembers,
    repositories,
    collaborators: collaborators.map((c) => ({
      ...c,
      removedAt: c.removedAt ?? null,
    })),
    submissions,
    rounds,
    roundResults,
    penalties: penalties.map(toPenalty),
    userIdOfGithub: new Map(accounts.map((a) => [a.accountId, a.userId])),
  }
}

// Competitions someone is in, or can push to a repo of
export async function projectsOfUser(userId: string): Promise<string[]> {
  const [participations, account] = await Promise.all([
    db
      .select({ projectId: Participant.projectId })
      .from(Participant)
      .where(eq(Participant.userId, userId)),
    db
      .select({ accountId: Account.accountId })
      .from(Account)
      .where(and(eq(Account.userId, userId), eq(Account.providerId, 'github')))
      .get(),
  ])
  const projects = new Set(participations.map((p) => p.projectId))
  if (account) {
    const reachable = await db
      .select({ projectId: Team.projectId })
      .from(Collaborator)
      .innerJoin(Repository, eq(Collaborator.repositoryId, Repository.id))
      .innerJoin(Team, eq(Repository.teamId, Team.id))
      .where(
        and(
          eq(Collaborator.githubUserId, account.accountId),
          isNull(Collaborator.removedAt),
        ),
      )
    for (const { projectId } of reachable) projects.add(projectId)
  }
  return [...projects]
}

// The only way penalties are added, so every one is checked
export async function addPenalty(input: NewPenalty): Promise<string> {
  const problems = validatePenalty(input)
  if (problems.length) throw new Error(problems.join('; '))

  const target = input.teamId
    ? await db
        .select({ id: Team.id })
        .from(Team)
        .where(eq(Team.id, input.teamId))
        .get()
    : await db
        .select({ id: Participant.id })
        .from(Participant)
        .where(eq(Participant.id, input.participantId!))
        .get()
  if (!target)
    throw new Error(
      `There's no ${input.teamId ? `team ${input.teamId}` : `participant ${input.participantId}`}`,
    )

  const id = randomUUID()
  await db.insert(Penalty).values({
    id,
    teamId: input.teamId ?? null,
    participantId: input.participantId ?? null,
    kind: input.kind,
    points: input.points ?? null,
    beforeRound: input.beforeRound ?? null,
    reason: input.reason.trim(),
    publicNote: input.publicNote?.trim() || null,
    createdAt: new Date(),
  })
  return id
}

// The row stays, as a record
export async function liftPenalty(id: string, at = new Date()): Promise<void> {
  const penalty = await db
    .select()
    .from(Penalty)
    .where(eq(Penalty.id, id))
    .get()
  if (!penalty) throw new Error(`There's no penalty ${id}`)
  if (penalty.liftedAt)
    throw new Error(
      `Penalty ${id} was already lifted on ${penalty.liftedAt.toISOString()}`,
    )
  await db.update(Penalty).set({ liftedAt: at }).where(eq(Penalty.id, id))
}

// When and where someone signed in, which outlives their Session. No token
export async function recordLogin(session: {
  userId: string
  createdAt: Date
  ipAddress?: string | null
  userAgent?: string | null
}): Promise<void> {
  await db.insert(LoginRecord).values({
    id: randomUUID(),
    userId: session.userId,
    loggedInAt: session.createdAt,
    ipAddress: session.ipAddress ?? null,
    userAgent: session.userAgent ?? null,
  })
}

// The competition whose template a repo came from
export async function findProject(
  octokit: Octokit,
  owner: string,
  name: string,
): Promise<typeof Project.$inferSelect | null> {
  const { data } = await octokit.rest.repos.get({ owner, repo: name })
  const templateId = data.template_repository?.id
  if (!templateId) return null
  return (
    (await db
      .select()
      .from(Project)
      .where(eq(Project.templateRepoId, templateId))
      .get()) ?? null
  )
}
