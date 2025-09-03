import { defineDb, defineTable, column, NOW } from 'astro:db'

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
});

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

const Project = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    description: column.text({ optional: true }),
    templateRepo: column.text(), // GitHub repo URL (e.g. WarwickAI/wordle)
    difficulty: column.text({ optional: true }),
    startDate: column.date({ default: NOW }),
    endDate: column.date({ optional: true }),
    isActive: column.boolean({ default: true }),
  },
  indexes: [
    { on: ["templateRepo"] },
    { on: ["isActive"] }
  ],
});

const Submission = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    projectId: column.text({ references: () => Project.columns.id }),
    score: column.number(),
    submissionRepo: column.text(),
    commitHash: column.text(),
    submittedAt: column.date({ default: NOW }),
  },
  indexes: [
    { on: ["projectId", "score"] },
    { on: ["commitHash"], unique: true },
    { on: ["submissionRepo"] },
  ],
});

const Contribution = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    submissionId: column.text({ references: () => Submission.columns.id }),
    userId: column.text({ references: () => User.columns.id, optional: true }), // NULL until user auths on WAI website
    githubUserId: column.number(), // GitHub's numeric ID
    commitCount: column.number({ default: 1 }),
    detectedAt: column.date({ default: NOW }),
    linkedAt: column.date({ optional: true }), // when userID was added
  },
  indexes: [
    { on: ["submissionId", "githubUserId"], unique: true },
    { on: ["userId"] },
    { on: ["githubUserId"] },
    { on: ["submissionId"] },
  ],
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    User,
    Session,
    Account,
    Verification,
    Project,
    Submission,
    Contribution,
  },
});
