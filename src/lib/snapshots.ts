import { put } from '@vercel/blob'
import type { Octokit } from 'octokit'

// Uploads a .tar.gz of `repo` (e.g. "owner/name") at commit `sha` to the
// private Blob store and returns the blob's URL
export async function snapshotSubmission(
  octokit: Octokit,
  { projectId, repo, sha }: { projectId: string; repo: string; sha: string },
): Promise<string> {
  const [owner, name] = repo.split('/')
  const { data: tarball } = (await octokit.rest.repos.downloadTarballArchive({
    owner,
    repo: name,
    ref: sha,
  })) as { data: ArrayBuffer }

  const blob = await put(
    `submissions/${projectId}/${repo}/${sha}.tar.gz`,
    tarball,
    {
      access: 'private',
      contentType: 'application/gzip',
      allowOverwrite: true,
    },
  )
  return blob.url
}
