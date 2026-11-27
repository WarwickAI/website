import { describe, expect, it } from 'vitest'
import { forEachInstalledRepo, type InstalledRepo } from './github'

const repo = (
  id: number,
  extra: Partial<InstalledRepo> = {},
): InstalledRepo => ({
  id,
  name: `repo${id}`,
  full_name: `owner/repo${id}`,
  owner: { login: 'owner', id: 1, type: 'User' },
  fork: false,
  is_template: false,
  ...extra,
})

describe('forEachInstalledRepo', () => {
  it('handles every repo of every installation, skipping forks and templates', async () => {
    const seen: string[] = []
    const failures = await forEachInstalledRepo(
      [10, 20],
      async (installationId) =>
        installationId === 10
          ? [repo(1), repo(2, { fork: true })]
          : [repo(3), repo(4, { is_template: true })],
      async (installationId, r) => void seen.push(`${installationId}:${r.id}`),
    )
    expect(seen.sort()).toEqual(['10:1', '20:3'])
    expect(failures).toEqual([])
  })

  it('reports a repo that fails without stopping the rest', async () => {
    const seen: number[] = []
    const failures = await forEachInstalledRepo(
      [10],
      async () => [repo(1), repo(2), repo(3)],
      async (_, r) => {
        if (r.id === 2) throw new Error('GitHub is down')
        seen.push(r.id)
      },
    )
    expect(seen.sort()).toEqual([1, 3])
    expect(failures).toEqual([
      { what: 'owner/repo2', error: new Error('GitHub is down') },
    ])
  })

  it("reports an installation that can't be listed and still handles the others", async () => {
    const seen: number[] = []
    const failures = await forEachInstalledRepo(
      [10, 20],
      async (installationId) => {
        if (installationId === 10) throw new Error('Not Found')
        return [repo(3)]
      },
      async (_, r) => void seen.push(r.id),
    )
    expect(seen).toEqual([3])
    expect(failures.map((f) => f.what)).toEqual(['installation 10'])
  })

  it('lists the installations at the same time', async () => {
    let askedForTheSecond!: () => void
    const secondAsked = new Promise<void>(
      (resolve) => (askedForTheSecond = resolve),
    )
    const handled: string[] = []
    await forEachInstalledRepo(
      [1, 2],
      async (installationId) => {
        if (installationId === 1) await secondAsked
        else askedForTheSecond()
        return [repo(installationId)]
      },
      async (_, r) => {
        handled.push(r.full_name)
      },
    )
    expect(handled.sort()).toEqual(['owner/repo1', 'owner/repo2'])
  }, 1000)
})
