import type { CollectionEntry } from 'astro:content'

export type ContentEntry = CollectionEntry<'blog'> | CollectionEntry<'courses'>

export interface ContentCollectionConfig {
  name: string
  basePath: string
  label: string
  subpostLabel: string
  parentLabel: string
  groupEntries: (entries: ContentEntry[]) => Record<string, ContentEntry[]>
  getAdjacentFromParent: (
    currentId: string,
    subposts: ContentEntry[],
    allParentEntries: ContentEntry[],
  ) => { next: ContentEntry | null; prev: ContentEntry | null }
}

function groupByYear(entries: ContentEntry[]): Record<string, ContentEntry[]> {
  return entries.reduce(
    (acc: Record<string, ContentEntry[]>, entry) => {
      const year = entry.data.date.getFullYear().toString()
      ;(acc[year] ??= []).push(entry)
      return acc
    },
    {},
  )
}

function groupByCourse(entries: ContentEntry[]): Record<string, ContentEntry[]> {
  return entries.reduce(
    (acc: Record<string, ContentEntry[]>, entry) => {
      const course = 'course' in entry.data ? String(entry.data.course) : 'Uncategorized'
      ;(acc[course] ??= []).push(entry)
      return acc
    },
    {},
  )
}

export const blogConfig: ContentCollectionConfig = {
  name: 'blog',
  basePath: '/blog',
  label: 'Blog',
  subpostLabel: 'subpost',
  parentLabel: 'Parent Post',
  groupEntries: groupByYear,
  getAdjacentFromParent: (currentId, _subposts, allParents) => {
    const idx = allParents.findIndex((e) => e.id === currentId)
    if (idx === -1) return { next: null, prev: null }
    return {
      next: idx > 0 ? allParents[idx - 1] : null,
      prev: idx < allParents.length - 1 ? allParents[idx + 1] : null,
    }
  },
}

export const coursesConfig: ContentCollectionConfig = {
  name: 'courses',
  basePath: '/education/courses',
  label: 'Courses',
  subpostLabel: 'page',
  parentLabel: 'Course Page',
  groupEntries: groupByCourse,
  getAdjacentFromParent: (_currentId, subposts, _allParents) => ({
    next: subposts[0] ?? null,
    prev: null,
  }),
}
