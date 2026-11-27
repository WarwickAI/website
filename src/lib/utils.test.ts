import { describe, expect, it } from 'vitest'
import { tryTwice } from './utils'

describe('tryTwice', () => {
  it('runs a task once when it works', async () => {
    let runs = 0
    expect(await tryTwice(async () => void runs++)).toBeNull()
    expect(runs).toBe(1)
  })

  it('runs it again when it fails once', async () => {
    let runs = 0
    const flaky = async () => {
      if (++runs === 1) throw new Error('UNIQUE constraint failed')
    }
    expect(await tryTwice(flaky)).toBeNull()
    expect(runs).toBe(2)
  })

  it('returns the error instead of throwing when it fails twice', async () => {
    const error = await tryTwice(async () => {
      throw new Error('still failing')
    })
    expect(error?.message).toBe('still failing')
  })
})
