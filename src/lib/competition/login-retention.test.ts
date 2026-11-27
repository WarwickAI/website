import { describe, expect, it } from 'vitest'
import { loginRecordsToDelete } from './login-retention'

const at = (iso: string) => new Date(`${iso}T12:00:00Z`)
const poker = { startDate: at('2026-10-13'), endDate: at('2026-12-08') }

describe('loginRecordsToDelete', () => {
  it('keeps a login during a competition until 3 months after it ends', () => {
    const records = [{ id: 'during', loggedInAt: at('2026-11-20') }]
    expect(loginRecordsToDelete(records, [poker], at('2027-03-07'))).toEqual([])
    expect(loginRecordsToDelete(records, [poker], at('2027-03-09'))).toEqual([
      'during',
    ])
  })

  it('deletes a login outside any competition 3 months after it', () => {
    const records = [{ id: 'summer', loggedInAt: at('2026-07-01') }]
    expect(loginRecordsToDelete(records, [poker], at('2026-09-30'))).toEqual([])
    expect(loginRecordsToDelete(records, [poker], at('2026-10-02'))).toEqual([
      'summer',
    ])
  })

  it('uses the latest-ending competition when two overlap', () => {
    const longer = { startDate: at('2026-11-01'), endDate: at('2027-02-01') }
    const records = [{ id: 'both', loggedInAt: at('2026-11-20') }]
    expect(
      loginRecordsToDelete(records, [poker, longer], at('2027-04-15')),
    ).toEqual([])
    expect(
      loginRecordsToDelete(records, [poker, longer], at('2027-05-02')),
    ).toEqual(['both'])
  })

  it('never deletes while a competition with no end date is running', () => {
    const open = { startDate: at('2026-01-01'), endDate: null }
    const records = [{ id: 'open', loggedInAt: at('2026-02-01') }]
    expect(loginRecordsToDelete(records, [open], at('2030-01-01'))).toEqual([])
  })
})
