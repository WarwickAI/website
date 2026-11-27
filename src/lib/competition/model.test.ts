import { describe, expect, it } from 'vitest'
import { lockTime, validatePenalty } from './model'

const project = {
  id: 'poker',
  name: 'Poker',
  templateRepo: 'WarwickAI/poker-comp',
  startDate: new Date('2026-10-13T16:00:00Z'),
  endDate: null,
  teamsLockAt: null,
}

describe('lockTime', () => {
  it('uses teamsLockAt when it is set', () => {
    const teamsLockAt = new Date('2026-12-01T00:00:00Z')
    expect(
      lockTime({
        ...project,
        endDate: new Date('2026-12-08T17:00:00Z'),
        teamsLockAt,
      }),
    ).toEqual(teamsLockAt)
  })

  it('falls back to the end date', () => {
    const endDate = new Date('2026-12-08T17:00:00Z')
    expect(lockTime({ ...project, endDate })).toEqual(endDate)
  })

  it('never locks without either', () => expect(lockTime(project)).toBeNull())
})

describe('validatePenalty', () => {
  it('accepts a team dsq', () =>
    expect(
      validatePenalty({ teamId: 't', kind: 'dsq', reason: 'collusion' }),
    ).toEqual([]))

  it('accepts a points penalty with points', () =>
    expect(
      validatePenalty({
        teamId: 't',
        kind: 'points',
        points: 7500,
        reason: 'r',
      }),
    ).toEqual([]))

  it('accepts void with beforeRound', () =>
    expect(
      validatePenalty({
        teamId: 't',
        kind: 'void',
        beforeRound: 8,
        reason: 'r',
      }),
    ).toEqual([]))

  it('accepts a person ineligible', () =>
    expect(
      validatePenalty({ participantId: 'p', kind: 'ineligible', reason: 'r' }),
    ).toEqual([]))

  it('needs exactly one target', () => {
    expect(validatePenalty({ kind: 'dsq', reason: 'r' })).toHaveLength(1)
    expect(
      validatePenalty({
        teamId: 't',
        participantId: 'p',
        kind: 'dsq',
        reason: 'r',
      }),
    ).toHaveLength(1)
  })

  it('rejects unknown kinds', () =>
    expect(
      validatePenalty({ teamId: 't', kind: 'ban', reason: 'r' }),
    ).toHaveLength(1))

  it('only gives a person dsq, hidden or ineligible', () =>
    expect(
      validatePenalty({
        participantId: 'p',
        kind: 'points',
        points: 5,
        reason: 'r',
      }),
    ).toHaveLength(1))

  it('needs a positive points only on points penalties', () => {
    expect(
      validatePenalty({ teamId: 't', kind: 'points', reason: 'r' }),
    ).toHaveLength(1)
    expect(
      validatePenalty({ teamId: 't', kind: 'points', points: 0, reason: 'r' }),
    ).toHaveLength(1)
    expect(
      validatePenalty({ teamId: 't', kind: 'dsq', points: 5, reason: 'r' }),
    ).toHaveLength(1)
  })

  it('needs a whole beforeRound of at least 2 only on void penalties', () => {
    expect(
      validatePenalty({ teamId: 't', kind: 'void', reason: 'r' }),
    ).toHaveLength(1)
    expect(
      validatePenalty({
        teamId: 't',
        kind: 'void',
        beforeRound: 1,
        reason: 'r',
      }),
    ).toHaveLength(1)
    expect(
      validatePenalty({
        teamId: 't',
        kind: 'void',
        beforeRound: 2.5,
        reason: 'r',
      }),
    ).toHaveLength(1)
    expect(
      validatePenalty({
        teamId: 't',
        kind: 'dsq',
        beforeRound: 8,
        reason: 'r',
      }),
    ).toHaveLength(1)
  })

  it('needs a reason', () =>
    expect(
      validatePenalty({ teamId: 't', kind: 'dsq', reason: ' ' }),
    ).toHaveLength(1))
})
