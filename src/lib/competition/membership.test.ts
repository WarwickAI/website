import { describe, expect, it } from 'vitest'
import {
  canSwitch,
  planMembership,
  switchOffers,
  type MembershipState,
  attentionLine,
  commitAuthorsToSuggest,
  needsAttention,
  stopsPlay,
  summariseMyTeam,
} from './membership'
import {
  competition,
  day,
  team,
  user,
  participant,
  submission,
} from './test-fixtures'
import { teamStatuses } from './team-status'

const LOCK = day(48)
const NOW = day(20)

// A repo already on team T, with nothing stored and nobody signed in
function state(overrides: Partial<MembershipState> = {}): MembershipState {
  return {
    now: NOW,
    lockAt: LOCK,
    endAt: null,
    repo: { repositoryId: 'R', teamId: 'T', ownerGithubUserId: 'gh-owner' },
    freshCollaborators: [],
    storedCollaborators: [],
    userIdOfGithub: new Map(),
    teamOfUser: new Map(),
    teamMembers: [],
    otherRepoCollaborators: new Set(),
    teamsExistingAtLock: new Set(['T']),
    ...overrides,
  }
}

const stored = (
  githubUserId: string,
  addedAt = day(1),
  removedAt: Date | null = null,
) => ({ githubUserId, addedAt, removedAt })

describe('planMembership', () => {
  it("a new repo joins its owner's team", () => {
    const actions = planMembership(
      state({
        repo: {
          repositoryId: null,
          teamId: null,
          ownerGithubUserId: 'gh-owner',
        },
        freshCollaborators: ['gh-owner'],
        userIdOfGithub: new Map([['gh-owner', 'u-owner']]),
        teamOfUser: new Map([['u-owner', 'OWNERS']]),
      }),
    )
    expect(actions[0]).toEqual({ kind: 'useTeam', teamId: 'OWNERS' })
    expect(actions).not.toContainEqual({ kind: 'joinTeam', userId: 'u-owner' })
  })

  it('a new repo whose owner is on no team gets a new team', () => {
    const actions = planMembership(
      state({
        repo: {
          repositoryId: null,
          teamId: null,
          ownerGithubUserId: 'gh-owner',
        },
        freshCollaborators: ['gh-owner'],
        userIdOfGithub: new Map([['gh-owner', 'u-owner']]),
      }),
    )
    expect(actions).toEqual([
      { kind: 'newTeam' },
      { kind: 'addCollaborator', githubUserId: 'gh-owner' },
      { kind: 'createParticipant', userId: 'u-owner' },
      { kind: 'joinTeam', userId: 'u-owner' },
    ])
  })

  it('adds, removes and restores collaborators from the fresh list', () => {
    const actions = planMembership(
      state({
        freshCollaborators: ['gh-new', 'gh-back', 'gh-stays'],
        storedCollaborators: [
          stored('gh-gone'),
          stored('gh-back', day(1), day(5)),
          stored('gh-stays'),
        ],
      }),
    )
    expect(actions).toEqual([
      { kind: 'useTeam', teamId: 'T' },
      { kind: 'addCollaborator', githubUserId: 'gh-new' },
      { kind: 'restoreCollaborator', githubUserId: 'gh-back' },
      { kind: 'removeCollaborator', githubUserId: 'gh-gone' },
    ])
  })

  it('keeps the stored list when freshCollaborators is null and still joins signed-in collaborators', () => {
    const actions = planMembership(
      state({
        freshCollaborators: null,
        storedCollaborators: [
          stored('gh-teammate'),
          stored('gh-removed', day(1), day(5)),
        ],
        userIdOfGithub: new Map([
          ['gh-teammate', 'u-teammate'],
          ['gh-removed', 'u-removed'],
        ]),
      }),
    )
    expect(actions).toEqual([
      { kind: 'useTeam', teamId: 'T' },
      { kind: 'createParticipant', userId: 'u-teammate' },
      { kind: 'joinTeam', userId: 'u-teammate' },
    ])
  })

  it('signs collaborators up as participants and puts them on the team', () => {
    const actions = planMembership(
      state({
        freshCollaborators: ['gh-a', 'gh-b'],
        storedCollaborators: [stored('gh-a'), stored('gh-b')],
        userIdOfGithub: new Map([
          ['gh-a', 'u-a'],
          ['gh-b', 'u-b'],
        ]),
        teamOfUser: new Map([['u-b', null]]), // already a participant, on no team
      }),
    )
    expect(actions).toEqual([
      { kind: 'useTeam', teamId: 'T' },
      { kind: 'createParticipant', userId: 'u-a' },
      { kind: 'joinTeam', userId: 'u-a' },
      { kind: 'joinTeam', userId: 'u-b' },
    ])
  })

  it('leaves someone who is on another team where they are', () => {
    const actions = planMembership(
      state({
        freshCollaborators: ['gh-a'],
        storedCollaborators: [stored('gh-a')],
        userIdOfGithub: new Map([['gh-a', 'u-a']]),
        teamOfUser: new Map([['u-a', 'OTHER']]),
      }),
    )
    expect(actions).toEqual([{ kind: 'useTeam', teamId: 'T' }])
  })

  it("a member who is no longer a collaborator on any of the team's repos leaves", () => {
    const actions = planMembership(
      state({
        freshCollaborators: [],
        storedCollaborators: [stored('gh-a')],
        teamMembers: [{ userId: 'u-a', githubUserId: 'gh-a' }],
      }),
    )
    expect(actions).toContainEqual({ kind: 'leaveTeam', userId: 'u-a' })
  })

  it("a member still on another of the team's repos stays", () => {
    const actions = planMembership(
      state({
        freshCollaborators: [],
        storedCollaborators: [stored('gh-a')],
        teamMembers: [{ userId: 'u-a', githubUserId: 'gh-a' }],
        otherRepoCollaborators: new Set(['gh-a']),
      }),
    )
    expect(actions).not.toContainEqual({ kind: 'leaveTeam', userId: 'u-a' })
  })

  it('after the lock nobody joins or leaves an existing team', () => {
    const actions = planMembership(
      state({
        now: day(50),
        freshCollaborators: ['gh-late'],
        storedCollaborators: [stored('gh-member')],
        userIdOfGithub: new Map([['gh-late', 'u-late']]),
        teamMembers: [{ userId: 'u-member', githubUserId: 'gh-member' }],
      }),
    )
    expect(actions).not.toContainEqual({ kind: 'joinTeam', userId: 'u-late' })
    expect(actions).not.toContainEqual({
      kind: 'leaveTeam',
      userId: 'u-member',
    })
    // They still become a participant, and can start a team of their own
    expect(actions).toContainEqual({
      kind: 'createParticipant',
      userId: 'u-late',
    })
  })

  it('after the lock, a collaborator from before it can still join', () => {
    const actions = planMembership(
      state({
        now: day(50),
        freshCollaborators: ['gh-early'],
        storedCollaborators: [stored('gh-early', day(10))],
        userIdOfGithub: new Map([['gh-early', 'u-early']]),
      }),
    )
    expect(actions).toContainEqual({ kind: 'joinTeam', userId: 'u-early' })
  })

  it('after the lock, a team with no submission from before it is new and can take members', () => {
    const actions = planMembership(
      state({
        now: day(50),
        freshCollaborators: ['gh-late'],
        userIdOfGithub: new Map([['gh-late', 'u-late']]),
        teamsExistingAtLock: new Set(),
      }),
    )
    expect(actions).toContainEqual({ kind: 'joinTeam', userId: 'u-late' })
  })

  it('after the end, even a collaborator from before the lock cannot join an existing team', () => {
    const actions = planMembership(
      state({
        now: day(60),
        endAt: day(56),
        freshCollaborators: ['gh-early'],
        storedCollaborators: [stored('gh-early', day(10))],
        userIdOfGithub: new Map([['gh-early', 'u-early']]),
      }),
    )
    expect(actions).not.toContainEqual({ kind: 'joinTeam', userId: 'u-early' })
  })

  it('after the end, a brand-new team can still take members, for people trying it to learn', () => {
    const actions = planMembership(
      state({
        now: day(60),
        endAt: day(56),
        repo: {
          repositoryId: null,
          teamId: null,
          ownerGithubUserId: 'gh-learner',
        },
        freshCollaborators: ['gh-learner'],
        userIdOfGithub: new Map([['gh-learner', 'u-learner']]),
        teamsExistingAtLock: new Set(),
      }),
    )
    expect(actions).toContainEqual({ kind: 'joinTeam', userId: 'u-learner' })
  })

  it('collaborators who have not signed in are recorded but join nothing', () => {
    const actions = planMembership(state({ freshCollaborators: ['gh-ghost'] }))
    expect(actions).toEqual([
      { kind: 'useTeam', teamId: 'T' },
      { kind: 'addCollaborator', githubUserId: 'gh-ghost' },
    ])
  })
})

describe('canSwitch', () => {
  const base = {
    now: NOW,
    lockAt: LOCK,
    currentTeamId: 'A',
    targetTeamId: 'B',
    isCollaboratorOnTarget: true,
  }

  it('allows a collaborator to switch before the lock', () =>
    expect(canSwitch(base)).toBeNull())
  it('refuses after the lock', () =>
    expect(canSwitch({ ...base, now: day(50) })).toBeTruthy())
  it('refuses someone who cannot push to the team', () =>
    expect(canSwitch({ ...base, isCollaboratorOnTarget: false })).toBeTruthy())
  it('refuses a switch to the same team', () =>
    expect(canSwitch({ ...base, targetTeamId: 'A' })).toBeTruthy())
})

describe('switchOffers', () => {
  function data() {
    const d = competition({ teamsLockAt: LOCK })
    const alice = user(d, 'alice')
    team(d, 'A', {
      members: [alice],
      repos: [{ id: 'a', fullName: 'alice/bot', collaborators: ['gh-alice'] }],
    })
    team(d, 'B', {
      members: [user(d, 'bob')],
      repos: [
        { id: 'b', fullName: 'bob/bot', collaborators: ['gh-bob', 'gh-alice'] },
      ],
    })
    return { d, alice }
  }

  it("lists another team's repo the user can push to", () => {
    const { d, alice } = data()
    expect(switchOffers(d, alice, NOW)).toEqual([
      { teamId: 'B', repoFullName: 'bob/bot' },
    ])
  })

  it('offers nothing after the lock', () => {
    const { d, alice } = data()
    expect(switchOffers(d, alice, day(50))).toEqual([])
  })
})

describe('summariseMyTeam', () => {
  it("shows the user's team, members and state", () => {
    const data = competition({ teamsLockAt: LOCK })
    const alice = user(data, 'alice')
    const bob = user(data, 'bob')
    team(data, 'A', {
      members: [alice, bob],
      repos: [
        {
          id: 'a',
          fullName: 'alice/bot',
          collaborators: ['gh-alice', 'gh-bob', 'gh-ghost'],
        },
      ],
    })
    submission(data, {
      id: 's',
      repositoryId: 'a',
      score: 1,
      submittedAt: day(1),
    })

    const mine = summariseMyTeam(data, teamStatuses(data, NOW), alice, NOW)
    expect(mine).toMatchObject({
      projectId: 'poker',
      projectName: 'Poker',
      templateRepo: 'WarwickAI/poker-comp',
      locked: false,
      teamId: 'A',
      repoFullName: 'alice/bot',
      state: 'active',
      unclaimedGithubUserIds: ['gh-ghost'],
      switchOffers: [],
    })
    expect(mine.members.map((m) => m.name)).toEqual(['alice', 'bob'])
  })

  it('explains a hold with who is on which other team', () => {
    const data = competition()
    const alice = user(data, 'alice')
    team(data, 'A', {
      members: [alice],
      repos: [{ id: 'a', fullName: 'alice/bot', collaborators: ['gh-alice'] }],
    })
    team(data, 'B', {
      members: [user(data, 'bob')],
      repos: [
        { id: 'b', fullName: 'bob/bot', collaborators: ['gh-bob', 'gh-alice'] },
      ],
    })

    const mine = summariseMyTeam(data, teamStatuses(data, NOW), 'user-bob', NOW)
    expect(mine.state).toBe('onHold')
    expect(mine.holdReasons).toEqual([
      { name: 'alice', otherRepoFullName: 'alice/bot' },
    ])
  })

  it('lists switch offers before the lock and none after', () => {
    const data = competition({ teamsLockAt: LOCK })
    const alice = user(data, 'alice')
    team(data, 'A', {
      members: [alice],
      repos: [{ id: 'a', collaborators: ['gh-alice'] }],
    })
    team(data, 'B', {
      members: [user(data, 'bob')],
      repos: [
        { id: 'b', fullName: 'bob/bot', collaborators: ['gh-bob', 'gh-alice'] },
      ],
    })

    expect(
      summariseMyTeam(data, teamStatuses(data, NOW), alice, NOW).switchOffers,
    ).toEqual([{ teamId: 'B', repoFullName: 'bob/bot' }])
    const late = day(50)
    const after = summariseMyTeam(data, teamStatuses(data, late), alice, late)
    expect(after.switchOffers).toEqual([])
    expect(after.locked).toBe(true)
  })

  it('a participant with no team gets teamId null', () => {
    const data = competition()
    const alice = user(data, 'alice')
    participant(data, alice)

    const mine = summariseMyTeam(data, teamStatuses(data, NOW), alice, NOW)
    expect(mine).toMatchObject({
      teamId: null,
      repoFullName: null,
      state: null,
      members: [],
    })
  })
})

describe('needsAttention', () => {
  const base = {
    projectId: 'poker',
    projectName: 'Poker',
    templateRepo: 'WarwickAI/poker-comp',
    locked: false,
    teamId: 'A',
    repoFullName: 'a/bot',
    members: [],
    state: 'active' as const,
    holdReasons: [],
    unclaimedGithubUserIds: [],
    switchOffers: [],
  }

  it('needs attention when on hold, when teammates have not signed in, or when a switch is offered', () => {
    expect(needsAttention(base)).toBe(false)
    expect(needsAttention({ ...base, state: 'onHold' })).toBe(true)
    expect(needsAttention({ ...base, unclaimedGithubUserIds: ['gh-x'] })).toBe(
      true,
    )
    expect(
      needsAttention({
        ...base,
        switchOffers: [{ teamId: 'B', repoFullName: 'b/bot' }],
      }),
    ).toBe(true)
  })

  it('only a hold stops the team playing', () => {
    expect(stopsPlay({ ...base, state: 'onHold' })).toBe(true)
    expect(stopsPlay({ ...base, unclaimedGithubUserIds: ['gh-x'] })).toBe(false)
    expect(
      stopsPlay({
        ...base,
        switchOffers: [{ teamId: 'B', repoFullName: 'b/bot' }],
      }),
    ).toBe(false)
  })
})

describe('attentionLine', () => {
  const base = {
    projectId: 'poker',
    projectName: 'Poker',
    templateRepo: 'WarwickAI/poker-comp',
    locked: false,
    teamId: 'A',
    repoFullName: 'a/bot',
    members: [],
    state: 'active' as const,
    holdReasons: [],
    unclaimedGithubUserIds: [],
    switchOffers: [],
  }

  it('says nothing when nothing needs doing', () =>
    expect(attentionLine(base)).toBeNull())

  it('puts a hold first', () =>
    expect(
      attentionLine({
        ...base,
        state: 'onHold',
        unclaimedGithubUserIds: ['x'],
      }),
    ).toBe('On hold: someone on another team can push to your repository'))

  it('offers a switch', () =>
    expect(
      attentionLine({
        ...base,
        switchOffers: [{ teamId: 'B', repoFullName: 'bob/bot' }],
      }),
    ).toBe('You can switch to bob/bot'))

  it('counts teammates who have not signed in', () => {
    expect(attentionLine({ ...base, unclaimedGithubUserIds: ['x'] })).toBe(
      "1 teammate hasn't signed in",
    )
    expect(attentionLine({ ...base, unclaimedGithubUserIds: ['x', 'y'] })).toBe(
      "2 teammates haven't signed in",
    )
  })
})

describe('commitAuthorsToSuggest', () => {
  const author = (id: number, login: string, type = 'User') => ({
    id,
    login,
    type,
  })

  it("suggests people with commits who can't push to the repo", () => {
    const suggested = commitAuthorsToSuggest(
      [author(1, 'alice'), author(2, 'forker'), author(3, 'helper')],
      new Set(['1']),
      new Set(),
    )
    expect(suggested).toEqual([
      { githubUserId: '2', login: 'forker' },
      { githubUserId: '3', login: 'helper' },
    ])
  })

  it("leaves out the template's own authors, whose commits come with copies of it", () => {
    const suggested = commitAuthorsToSuggest(
      [author(1, 'alice'), author(9, 'DanielJamesHeywood')],
      new Set(['1']),
      new Set(['9']),
    )
    expect(suggested).toEqual([])
  })

  it('leaves out bots and coding assistants', () => {
    const suggested = commitAuthorsToSuggest(
      [
        author(5, 'warwickai[bot]', 'Bot'),
        author(81847, 'claude'),
        author(6, 'Copilot', 'Bot'),
      ],
      new Set(),
      new Set(),
    )
    expect(suggested).toEqual([])
  })
})
