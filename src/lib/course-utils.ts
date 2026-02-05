import { getCollection, render, type CollectionEntry } from 'astro:content'
import { readingTime, calculateWordCountFromHtml } from '@/lib/utils'

export async function getAllAuthors(): Promise<CollectionEntry<'authors'>[]> {
  const authors = await getCollection('authors')
  return authors.sort((a, b) => a.id.localeCompare(b.id))
}

export async function getAllExec(): Promise<CollectionEntry<'authors'>[]> {
  const authors = await getCollection('authors')
  return authors.filter((a) => a.data.exec).sort((a, b) => a.id.localeCompare(b.id))
}

export async function getAllCourses(): Promise<CollectionEntry<'courses'>[]> {
  const posts = await getCollection('courses')
  return posts
    .filter((post) => !post.data.draft && !isSubpost(post.id))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllCoursesAndPages(): Promise<
  CollectionEntry<'courses'>[]
> {
  const posts = await getCollection('courses')
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getAllCourses()
  return posts.reduce((acc, post) => {
    post.data.tags?.forEach((tag) => {
      acc.set(tag, (acc.get(tag) || 0) + 1)
    })
    return acc
  }, new Map<string, number>())
}

export async function getAdjacentPosts(currentId: string): Promise<{
  next: CollectionEntry<'courses'> | null
  prev: CollectionEntry<'courses'> | null
  parent: CollectionEntry<'courses'> | null
}> {

    if (isSubpost(currentId)) {
        const parentId = getParentId(currentId)
        const allPosts = await getAllCourses()
        const parent = allPosts.find((post) => post.id === parentId) || null

        const posts = await getCollection('courses')
        const subposts = posts
            .filter(
            (post) =>
                isSubpost(post.id) &&
                getParentId(post.id) === parentId &&
                !post.data.draft,
            )

        const currentIndex = subposts.findIndex((post) => post.id === currentId)
        if (currentIndex === -1) {
            return { next: null, prev: null, parent }
        }

        return {
            next:
            currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
            prev: currentIndex > 0 ? subposts[currentIndex - 1] : null,
            parent,
        }
    }

    // If post is parent post, link to first subpost.
    const parentId = currentId
    const allPosts = await getAllCourses()
    const parent = allPosts.find((post) => post.id === parentId) || null

    const posts = await getCollection('courses')
    const subposts = posts
        .filter(
        (post) =>
            isSubpost(post.id) &&
            getParentId(post.id) === parentId &&
            !post.data.draft,
        )

    return {
        next: subposts[0],
        prev: null,
        parent,
    }
}

export async function getPostsByAuthor(
  authorId: string,
): Promise<CollectionEntry<'courses'>[]> {
  const posts = await getAllCourses()
  return posts.filter((post) => post.data.authors?.includes(authorId))
}

export async function getPostsByTag(
  tag: string,
): Promise<CollectionEntry<'courses'>[]> {
  const posts = await getAllCourses()
  return posts.filter((post) => post.data.tags?.includes(tag))
}

export async function getRecentCourses(
  count: number,
): Promise<CollectionEntry<'courses'>[]> {
  const posts = await getAllCourses()
  return posts.slice(0, count)
}

export async function getSortedTags(): Promise<
  { tag: string; count: number }[]
> {
  const tagCounts = await getAllTags()
  return [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}

export function getParentId(subpostId: string): string {
  return subpostId.split('/')[0]
}

export async function getSubpostsForParent(
  parentId: string,
): Promise<CollectionEntry<'courses'>[]> {
  const posts = await getCollection('courses')
  return posts
    .filter(
      (post) =>
        !post.data.draft &&
        isSubpost(post.id) &&
        getParentId(post.id) === parentId,
    )
    .sort((a, b) => {
      const dateDiff = a.data.date.valueOf() - b.data.date.valueOf()
      if (dateDiff !== 0) return dateDiff

      const orderA = a.data.order ?? 0
      const orderB = b.data.order ?? 0
      return orderA - orderB
    })
}


export function groupPostsByCourse(
  posts: CollectionEntry<'courses'>[],
): Record<string, CollectionEntry<'courses'>[]> {
  return posts.reduce(
    (acc: Record<string, CollectionEntry<'courses'>[]>, post) => {
      const course = post.data.course.toString()
      ;(acc[course] ??= []).push(post)
      return acc
    },
    {},
  )
}

export function groupPostsByYear(
  posts: CollectionEntry<'courses'>[],
): Record<string, CollectionEntry<'courses'>[]> {
  return posts.reduce(
    (acc: Record<string, CollectionEntry<'courses'>[]>, post) => {
      const year = post.data.date.getFullYear().toString()
      ;(acc[year] ??= []).push(post)
      return acc
    },
    {},
  )
}

export async function hasSubposts(postId: string): Promise<boolean> {
  const subposts = await getSubpostsForParent(postId)
  return subposts.length > 0
}

export function isSubpost(postId: string): boolean {
  return postId.includes('/')
}

export async function getParentPost(
  subpostId: string,
): Promise<CollectionEntry<'courses'> | null> {
  if (!isSubpost(subpostId)) {
    return null
  }

  const parentId = getParentId(subpostId)
  const allPosts = await getAllCourses()
  return allPosts.find((post) => post.id === parentId) || null
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

export async function getPostById(
  postId: string,
): Promise<CollectionEntry<'courses'> | null> {
  const allPosts = await getAllCoursesAndPages()
  return allPosts.find((post) => post.id === postId) || null
}

export async function getSubpostCount(parentId: string): Promise<number> {
  const subposts = await getSubpostsForParent(parentId)
  return subposts.length
}

export async function getCombinedReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)
  if (!post) return readingTime(0)

  let totalWords = calculateWordCountFromHtml(post.body)

  if (!isSubpost(postId)) {
    const subposts = await getSubpostsForParent(postId)
    for (const subpost of subposts) {
      totalWords += calculateWordCountFromHtml(subpost.body)
    }
  }

  return readingTime(totalWords)
}

export async function getPostReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)
  if (!post) return readingTime(0)

  const wordCount = calculateWordCountFromHtml(post.body)
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

export async function getTOCSections(postId: string): Promise<TOCSection[]> {
  const post = await getPostById(postId)
  if (!post) return []

  const parentId = isSubpost(postId) ? getParentId(postId) : postId
  const parentPost = isSubpost(postId) ? await getPostById(parentId) : post

  if (!parentPost) return []

  const sections: TOCSection[] = []

  const { headings: parentHeadings } = await render(parentPost)
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

  const subposts = await getSubpostsForParent(parentId)
  for (const subpost of subposts) {
    const { headings: subpostHeadings } = await render(subpost)
    if (subpostHeadings.length > 0) {
      sections.push({
        type: 'subpost',
        title: subpost.data.title,
        headings: subpostHeadings.map((heading, index) => ({
          slug: heading.slug,
          text: heading.text,
          depth: heading.depth,
          isSubpostTitle: index === 0,
        })),
        subpostId: subpost.id,
      })
    }
  }

  return sections
}
