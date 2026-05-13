import { SITE } from '@/consts'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllEntries } from '@/lib/data-utils'
import { blogConfig } from '@/lib/collections'

export async function GET(context: APIContext) {
  try {
    const posts = await getAllEntries(blogConfig)

    return rss({
      title: SITE.title,
      description: SITE.description,
      site: context.site ?? SITE.href,
      items: posts.map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/blog/${post.id}/`,
      })),
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
