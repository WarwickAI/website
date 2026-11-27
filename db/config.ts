import { defineDb, defineTable, column, NOW } from 'astro:db'

// Rules Astro DB can't enforce (no check constraints, enums or triggers), so
// they're kept in code. db/check-integrity.ts checks 1 to 6:
// 1. A team member's team is in their Participant's competition
// 2. A round's results are from teams in its competition
// 3. One result per team per round, except rounds from before teams
// 4. A penalty has exactly one target
// 5. A penalty's kind is known; people only get dsq, hidden or ineligible
// 6. points only on points penalties, beforeRound only on void ones
// 7. A repo joins a team in its template's competition
// On plain SQLite or Postgres, 4 to 6 could be check constraints and 1 to 3
// triggers

// Sign-in, owned by better-auth (src/lib/auth.ts)

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    email: column.text(),
    emailVerified: column.boolean(),
    image: column.text({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
  indexes: [{ on: ['email'], unique: true }],
});

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    token: column.text(),
    expiresAt: column.date(),
    ipAddress: column.text({ optional: true }),
    userAgent: column.text({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
  indexes: [
    { on: ['token'], unique: true },
    { on: ['userId'] },
  ],
});

// accountId is their id with the provider, e.g. their GitHub id
const Account = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    accountId: column.text(),
    providerId: column.text(),
    accessToken: column.text({ optional: true }),
    refreshToken: column.text({ optional: true }),
    accessTokenExpiresAt: column.date({ optional: true }),
    refreshTokenExpiresAt: column.date({ optional: true }),
    scope: column.text({ optional: true }),
    idToken: column.text({ optional: true }),
    password: column.text({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
  indexes: [
    { on: ['providerId', 'accountId'], unique: true },
    { on: ['userId', 'providerId'], unique: true },
  ],
});

const Verification = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    identifier: column.text(),
    value: column.text(),
    expiresAt: column.date(),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// Each sign-in, which outlives its Session. Never holds a token
const LoginRecord = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    loggedInAt: column.date(),
    ipAddress: column.text({ optional: true }),
    userAgent: column.text({ optional: true }),
  },
  indexes: [{ on: ['userId'] }],
});

// Competitions

const Project = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    description: column.text({ optional: true }),
    // Matches submissions to a competition, even if the template is renamed
    templateRepoId: column.number(),
    templateRepo: column.text(), // owner/name, for links (e.g. WarwickAI/poker-comp)
    difficulty: column.text({ optional: true }),
    startDate: column.date({ default: NOW }),
    endDate: column.date({ optional: true }),
    // When teams lock. Empty means at endDate
    teamsLockAt: column.date({ optional: true }),
  },
  indexes: [{ on: ['templateRepoId'], unique: true }],
});

// Never deleted, so penalties on a person follow them between teams
const Participant = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    projectId: column.text({ references: () => Project.columns.id }),
    userId: column.text({ references: () => User.columns.id }),
    joinedAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['projectId', 'userId'], unique: true }],
});

// Members come from its repos' collaborators
const Team = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    projectId: column.text({ references: () => Project.columns.id }),
  },
  indexes: [{ on: ['projectId'] }],
});

// One per participant, so one team per person per competition
const TeamMember = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    participantId: column.text({ references: () => Participant.columns.id }),
    teamId: column.text({ references: () => Team.columns.id }),
    joinedAt: column.date({ default: NOW }),
  },
  indexes: [
    { on: ['participantId'], unique: true },
    { on: ['teamId'] },
  ],
});

// Tracked by GitHub's id, so renames change nothing. githubRepoId is empty only
// for repos deleted before it was kept
const Repository = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    teamId: column.text({ references: () => Team.columns.id }),
    githubRepoId: column.number({ optional: true }),
    fullName: column.text(), // owner/name as last seen
  },
  indexes: [
    { on: ['githubRepoId'], unique: true },
    { on: ['teamId'] },
  ],
});

// Who could push, with when we first and last saw it
const Collaborator = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    repositoryId: column.text({ references: () => Repository.columns.id }),
    githubUserId: column.text(), // matches Account.accountId once they sign in
    addedAt: column.date({ default: NOW }),
    removedAt: column.date({ optional: true }),
  },
  indexes: [
    { on: ['repositoryId', 'githubUserId'], unique: true },
    { on: ['githubUserId'] },
  ],
});

// A scored push
const Submission = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    repositoryId: column.text({ references: () => Repository.columns.id }),
    commitHash: column.text(),
    score: column.number(),
    snapshotUrl: column.text({ optional: true }), // private Vercel Blob .tar.gz of the repo at commitHash
    submittedAt: column.date({ default: NOW }),
  },
  indexes: [
    { on: ['repositoryId', 'commitHash'], unique: true },
    { on: ['commitHash'] },
  ],
});

// A round of a live tournament, recorded with db/record-round.ts
const Round = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    projectId: column.text({ references: () => Project.columns.id }),
    number: column.number(), // 1 for the first round, 2 for the next, and so on
    playedAt: column.date(),
    details: column.json({ optional: true }), // anything else the project records, e.g. poker's seed
    recordedAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['projectId', 'number'], unique: true }],
});

// Points at the submission which played. Early poker rounds had people with
// two seats, so one result per team is kept in code (rule 3)
const RoundResult = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    roundId: column.text({ references: () => Round.columns.id }),
    submissionId: column.text({ references: () => Submission.columns.id }),
    place: column.number(), // 1 for the winner
    points: column.number(), // the official result, kept as recorded
    details: column.json({ optional: true }), // anything else the project records, e.g. poker's peak chips
  },
  indexes: [
    { on: ['roundId', 'submissionId'], unique: true },
    { on: ['submissionId'] },
  ],
});

// On a team, or on a person wherever they are. Only added with addPenalty
// (rules 4 to 6). Lifted, never deleted
const Penalty = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    teamId: column.text({ references: () => Team.columns.id, optional: true }),
    participantId: column.text({ references: () => Participant.columns.id, optional: true }),
    kind: column.text(), // dsq, hidden, void, points or ineligible
    points: column.number({ optional: true }), // taken off the total, for kind points
    beforeRound: column.number({ optional: true }), // rounds before this don't count, for kind void
    reason: column.text(), // private
    publicNote: column.text({ optional: true }), // shown on the leaderboard
    createdAt: column.date({ default: NOW }),
    liftedAt: column.date({ optional: true }),
  },
  indexes: [{ on: ['teamId'] }, { on: ['participantId'] }],
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    User,
    Session,
    Account,
    Verification,
    LoginRecord,
    Project,
    Participant,
    Team,
    TeamMember,
    Repository,
    Collaborator,
    Submission,
    Round,
    RoundResult,
    Penalty,
  },
});
