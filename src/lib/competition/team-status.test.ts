import { describe, expect, it } from 'vitest'
import { teamStatuses } from './team-status'
import {
  END,
  competition,
  day,
  participant,
  penalty,
  submission,
  team,
  user,
} from './test-fixtures'

const NOW = day(20)

describe('teamStatuses', () => {
  it('a team with a signed-in member is active', () => {
    const data = competition()
    const alice = user(data, 'alice')
    team(data, 'A', {
      members: [alice],
      repos: [{ id: 'a1', collaborators: ['gh-alice'] }],
    })

    const status = teamStatuses(data, NOW).get('A')!
    expect(status.state).toBe('active')
    expect(status.memberUserIds).toEqual([alice])
  })

  it('hidden beats dsq, and dsq beats everything else', () => {
    const data = competition()
    team(data, 'A', { repos: [{ id: 'a1', collaborators: ['gh-nobody'] }] })
    penalty(data, { kind: 'dsq', teamId: 'A' })
    expect(teamStatuses(data, NOW).get('A')!.state).toBe('dsq')

    penalty(data, { kind: 'hidden', teamId: 'A' })
    expect(teamStatuses(data, NOW).get('A')!.state).toBe('hidden')
  })

  it('a participant penalty applies to their current team, not to one they left', () => {
    const data = competition()
    const alice = user(data, 'alice')
    const bob = user(data, 'bob')
    team(data, 'A', { members: [alice] })
    team(data, 'B', { members: [bob] })
    penalty(data, {
      kind: 'ineligible',
      participantId: participant(data, alice),
    })

    const statuses = teamStatuses(data, NOW)
    expect(statuses.get('A')!.ineligible).toBe(true)
    expect(statuses.get('B')!.ineligible).toBe(false)

    // Alice switches to B: the penalty follows her
    data.teamMembers.find(
      (m) => m.participantId === participant(data, alice),
    )!.teamId = 'B'
    const after = teamStatuses(data, NOW)
    expect(after.get('A')!.ineligible).toBe(false)
    expect(after.get('B')!.ineligible).toBe(true)
  })

  it('lifted penalties are ignored', () => {
    const data = competition()
    team(data, 'A', { members: [user(data, 'alice')] })
    penalty(data, { kind: 'dsq', teamId: 'A', liftedAt: day(5) })
    expect(teamStatuses(data, NOW).get('A')!.state).toBe('active')
  })

  it('no members and no signed-in collaborators is unclaimed', () => {
    const data = competition()
    team(data, 'A', { repos: [{ id: 'a1', collaborators: ['gh-stranger'] }] })
    expect(teamStatuses(data, NOW).get('A')!.state).toBe('unclaimed')
  })

  it('no members but a signed-in collaborator on another team is left', () => {
    const data = competition()
    const jan = user(data, 'jan')
    team(data, 'solo', { repos: [{ id: 's1', collaborators: ['gh-jan'] }] })
    team(data, 'daniel', {
      members: [jan],
      repos: [{ id: 'd1', collaborators: ['gh-jan'] }],
    })
    expect(teamStatuses(data, NOW).get('solo')!.state).toBe('left')
  })

  it('a member of another team with push access puts the team on hold', () => {
    const data = competition()
    const alice = user(data, 'alice')
    const bob = user(data, 'bob')
    team(data, 'A', {
      members: [alice],
      repos: [{ id: 'a1', collaborators: ['gh-alice'] }],
    })
    team(data, 'B', {
      members: [bob],
      repos: [{ id: 'b1', collaborators: ['gh-bob', 'gh-alice'] }],
    })

    const statuses = teamStatuses(data, NOW)
    expect(statuses.get('A')!.state).toBe('active')
    expect(statuses.get('B')!.state).toBe('onHold')
    expect(statuses.get('B')!.holdReasons).toEqual([
      { githubUserId: 'gh-alice', otherTeamId: 'A' },
    ])
  })

  it('collaborators who have not signed in never put a team on hold', () => {
    const data = competition()
    team(data, 'A', {
      members: [user(data, 'alice')],
      repos: [{ id: 'a1', collaborators: ['gh-alice', 'gh-ghost'] }],
    })
    team(data, 'B', {
      members: [user(data, 'bob')],
      repos: [{ id: 'b1', collaborators: ['gh-bob', 'gh-ghost'] }],
    })
    expect(teamStatuses(data, NOW).get('B')!.state).toBe('active')
  })

  it('after the end, hold uses collaborators as they were at the end', () => {
    const afterEnd = new Date(END.getTime() + 24 * 60 * 60 * 1000)
    const later = new Date(END.getTime() + 2 * 24 * 60 * 60 * 1000)

    // Removed after the end: still on hold, so the final standings don't change
    const removed = competition()
    team(removed, 'A', { members: [user(removed, 'alice')] })
    team(removed, 'B', {
      members: [user(removed, 'bob')],
      repos: [
        {
          id: 'b1',
          collaborators: [
            'gh-bob',
            { githubUserId: 'gh-alice', removedAt: afterEnd },
          ],
        },
      ],
    })
    expect(teamStatuses(removed, later).get('B')!.state).toBe('onHold')

    // Added after the end: never on hold
    const added = competition()
    team(added, 'A', { members: [user(added, 'alice')] })
    team(added, 'B', {
      members: [user(added, 'bob')],
      repos: [
        {
          id: 'b1',
          collaborators: [
            'gh-bob',
            { githubUserId: 'gh-alice', addedAt: afterEnd },
          ],
        },
      ],
    })
    expect(teamStatuses(added, later).get('B')!.state).toBe('active')
  })

  it('void takes the largest beforeRound and points penalties add up', () => {
    const data = competition()
    team(data, 'A', { members: [user(data, 'alice')] })
    penalty(data, { kind: 'void', teamId: 'A', beforeRound: 3 })
    penalty(data, { kind: 'void', teamId: 'A', beforeRound: 8 })
    penalty(data, {
      kind: 'points',
      teamId: 'A',
      points: 5000,
      publicNote: 'Collusion',
    })
    penalty(data, { kind: 'points', teamId: 'A', points: 2500 })

    const status = teamStatuses(data, NOW).get('A')!
    expect(status.voidBeforeRound).toBe(8)
    expect(status.pointsPenalty).toBe(7500)
    expect(status.publicNotes).toEqual(['Collusion'])
  })

  it('unclaimedCount counts current collaborators on the newest repo with no account', () => {
    const data = competition()
    const alice = user(data, 'alice')
    team(data, 'A', {
      members: [alice],
      repos: [
        { id: 'old', collaborators: ['gh-alice', 'gh-x', 'gh-y'] },
        {
          id: 'new',
          collaborators: [
            'gh-alice',
            'gh-x',
            { githubUserId: 'gh-z', removedAt: day(10) },
          ],
        },
      ],
    })
    submission(data, {
      id: 's-old',
      repositoryId: 'old',
      score: 1,
      submittedAt: day(1),
    })
    submission(data, {
      id: 's-new',
      repositoryId: 'new',
      score: 1,
      submittedAt: day(2),
    })

    const status = teamStatuses(data, NOW).get('A')!
    expect(status.newestRepositoryId).toBe('new')
    expect(status.unclaimedCount).toBe(1)
  })
})
