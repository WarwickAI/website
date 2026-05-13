import { getCollection, render, type CollectionEntry } from 'astro:content'
import { readingTime, calculateWordCountFromHtml } from '@/lib/utils'
import type { ContentCollectionConfig, ContentEntry } from '@/lib/collections'

export async function getAllAuthors(): Promise<CollectionEntry<'authors'>[]> {
  const authors = await getCollection('authors')
  return authors.sort((a, b) => a.id.localeCompare(b.id))
}

export async function getAllExec(): Promise<CollectionEntry<'authors'>[]> {
  const authors = await getCollection('authors')
  return authors.filter((a) => a.data.exec).sort((a, b) => a.id.localeCompare(b.id))
}

export async function getAllProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects')
  return projects.sort((a, b) => {
    const dateA = a.data.startDate?.getTime() || 0
    const dateB = b.data.startDate?.getTime() || 0
    return dateB - dateA
  })
}

export async function parseAuthors(authorIds: string[] = []) {
  if (!authorIds.length) return []

  const allAuthors = await getAllAuthors()
  const authorMap = new Map(allAuthors.map((author) => [author.id, author]))

  return authorIds.map((id) => {
    const author = authorMap.get(id)
    return {
      id,
      name: author?.data?.name || id,
      avatar: author?.data?.avatar || '/static/logo.png',
      isRegistered: !!author,
    }
  })
}

export function isSubpost(postId: string): boolean {
  return postId.includes('/')
}

export function getParentId(subpostId: string): string {
  return subpostId.split('/')[0]
}

export async function getAllEntries(
  config: ContentCollectionConfig,
): Promise<ContentEntry[]> {
  const entries = await getCollection(config.name as any)
  return (entries as ContentEntry[])
    .filter((entry) => !entry.data.draft && !isSubpost(entry.id))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllEntriesAndSubentries(
  config: ContentCollectionConfig,
): Promise<ContentEntry[]> {
  const entries = await getCollection(config.name as any)
  return (entries as ContentEntry[])
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getEntryById(
  config: ContentCollectionConfig,
  entryId: string,
): Promise<ContentEntry | null> {
  const allEntries = await getAllEntriesAndSubentries(config)
  return allEntries.find((entry) => entry.id === entryId) || null
}

export async function getSubentriesForParent(
  config: ContentCollectionConfig,
  parentId: string,
): Promise<ContentEntry[]> {
  const entries = await getCollection(config.name as any)
  return (entries as ContentEntry[])
    .filter(
      (entry) =>
        !entry.data.draft &&
        isSubpost(entry.id) &&
        getParentId(entry.id) === parentId,
    )
    .sort((a, b) => {
      const dateDiff = a.data.date.valueOf() - b.data.date.valueOf()
      if (dateDiff !== 0) return dateDiff

      const orderA = a.data.order ?? 0
      const orderB = b.data.order ?? 0
      return orderA - orderB
    })
}

export async function hasSubentries(
  config: ContentCollectionConfig,
  entryId: string,
): Promise<boolean> {
  const subentries = await getSubentriesForParent(config, entryId)
  return subentries.length > 0
}

export async function getEntryAuthorIds(
  config: ContentCollectionConfig,
  entryId: string,
): Promise<string[]> {
  const entry = await getEntryById(config, entryId)
  if (!entry) return []

  if (entry.data.authors && entry.data.authors.length > 0) {
    return entry.data.authors
  }

  if (isSubpost(entryId)) return []

  const subentries = await getSubentriesForParent(config, entryId)
  const seen = new Set<string>()
  for (const subentry of subentries) {
    for (const authorId of subentry.data.authors ?? []) {
      seen.add(authorId)
    }
  }
  return [...seen]
}

export async function getEntryTags(
  config: ContentCollectionConfig,
  entryId: string,
): Promise<string[]> {
  const entry = await getEntryById(config, entryId)
  if (!entry) return []

  if (entry.data.tags && entry.data.tags.length > 0) {
    return entry.data.tags
  }

  if (isSubpost(entryId)) return []

  const subentries = await getSubentriesForParent(config, entryId)
  const seen = new Set<string>()
  for (const subentry of subentries) {
    for (const tag of subentry.data.tags ?? []) {
      seen.add(tag)
    }
  }
  return [...seen]
}

export async function getParentEntry(
  config: ContentCollectionConfig,
  subentryId: string,
): Promise<ContentEntry | null> {
  if (!isSubpost(subentryId)) {
    return null
  }

  const parentId = getParentId(subentryId)
  const allEntries = await getAllEntries(config)
  return allEntries.find((entry) => entry.id === parentId) || null
}

export async function getSubentryCount(
  config: ContentCollectionConfig,
  parentId: string,
): Promise<number> {
  const subentries = await getSubentriesForParent(config, parentId)
  return subentries.length
}

export async function getAdjacentEntries(
  config: ContentCollectionConfig,
  currentId: string,
): Promise<{
  next: ContentEntry | null
  prev: ContentEntry | null
  parent: ContentEntry | null
}> {
  if (isSubpost(currentId)) {
    const parentId = getParentId(currentId)
    const allEntries = await getAllEntries(config)
    const parent = allEntries.find((entry) => entry.id === parentId) || null

    const subentries = await getSubentriesForParent(config, parentId)

    const currentIndex = subentries.findIndex((entry) => entry.id === currentId)
    if (currentIndex === -1) {
      return { next: null, prev: null, parent }
    }

    return {
      next:
        currentIndex < subentries.length - 1
          ? subentries[currentIndex + 1]
          : null,
      prev: currentIndex > 0 ? subentries[currentIndex - 1] : null,
      parent,
    }
  }

  const allEntries = await getAllEntries(config)
  const parentEntries = allEntries.filter((entry) => !isSubpost(entry.id))
  const subentries = await getSubentriesForParent(config, currentId)
  const configNav = config.getAdjacentFromParent(currentId, subentries, parentEntries)

  return {
    next: configNav.next,
    prev: configNav.prev,
    parent: null,
  }
}

export async function getAllTags(
  config: ContentCollectionConfig,
): Promise<Map<string, number>> {
  const entries = await getAllEntries(config)
  const counts = new Map<string, number>()
  for (const entry of entries) {
    const tags = await getEntryTags(config, entry.id)
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1)
    }
  }
  return counts
}

export async function getSortedTags(
  config: ContentCollectionConfig,
): Promise<{ tag: string; count: number }[]> {
  const tagCounts = await getAllTags(config)
  return [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}

export async function getEntriesByAuthor(
  config: ContentCollectionConfig,
  authorId: string,
): Promise<ContentEntry[]> {
  const entries = await getAllEntries(config)
  const matches = await Promise.all(
    entries.map(async (entry) => {
      const authorIds = await getEntryAuthorIds(config, entry.id)
      return authorIds.includes(authorId) ? entry : null
    }),
  )
  return matches.filter((entry): entry is ContentEntry => entry !== null)
}

export async function getEntriesByTag(
  config: ContentCollectionConfig,
  tag: string,
): Promise<ContentEntry[]> {
  const entries = await getAllEntries(config)
  const matches = await Promise.all(
    entries.map(async (entry) => {
      const tags = await getEntryTags(config, entry.id)
      return tags.includes(tag) ? entry : null
    }),
  )
  return matches.filter((entry): entry is ContentEntry => entry !== null)
}

export async function getRecentEntries(
  config: ContentCollectionConfig,
  count: number,
): Promise<ContentEntry[]> {
  const entries = await getAllEntries(config)
  return entries.slice(0, count)
}

export async function getCombinedReadingTime(
  config: ContentCollectionConfig,
  entryId: string,
): Promise<string> {
  const entry = await getEntryById(config, entryId)
  if (!entry) return readingTime(0)

  let totalWords = calculateWordCountFromHtml(entry.body)

  if (!isSubpost(entryId)) {
    const subentries = await getSubentriesForParent(config, entryId)
    for (const subentry of subentries) {
      totalWords += calculateWordCountFromHtml(subentry.body)
    }
  }

  return readingTime(totalWords)
}

export async function getEntryReadingTime(
  config: ContentCollectionConfig,
  entryId: string,
): Promise<string> {
  const entry = await getEntryById(config, entryId)
  if (!entry) return readingTime(0)

  const wordCount = calculateWordCountFromHtml(entry.body)
  return readingTime(wordCount)
}

export type TOCHeading = {
  slug: string
  text: string
  depth: number
  isSubpostTitle?: boolean
}

export type TOCSection = {
  type: 'parent' | 'subpost'
  title: string
  headings: TOCHeading[]
  subpostId?: string
}

export async function getTOCSections(
  config: ContentCollectionConfig,
  entryId: string,
): Promise<TOCSection[]> {
  const entry = await getEntryById(config, entryId)
  if (!entry) return []

  const parentId = isSubpost(entryId) ? getParentId(entryId) : entryId
  const parentEntry = isSubpost(entryId)
    ? await getEntryById(config, parentId)
    : entry

  if (!parentEntry) return []

  const sections: TOCSection[] = []

  const { headings: parentHeadings } = await render(parentEntry)
  if (parentHeadings.length > 0) {
    sections.push({
      type: 'parent',
      title: 'Overview',
      headings: parentHeadings.map((heading) => ({
        slug: heading.slug,
        text: heading.text,
        depth: heading.depth,
      })),
    })
  }

  const subentries = await getSubentriesForParent(config, parentId)
  for (const subentry of subentries) {
    const { headings: subentryHeadings } = await render(subentry)
    if (subentryHeadings.length > 0) {
      sections.push({
        type: 'subpost',
        title: subentry.data.title,
        headings: subentryHeadings.map((heading, index) => ({
          slug: heading.slug,
          text: heading.text,
          depth: heading.depth,
          isSubpostTitle: index === 0,
        })),
        subpostId: subentry.id,
      })
    }
  }

  return sections
}
