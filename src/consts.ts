import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Warwick AI',
  description: 'Your gateway into AI at the University of Warwick!',
  href: 'https://warwick.ai',
  author: 'Warwick AI Exec',
  locale: 'en-GB',
  featuredPostCount: 2,
  postsPerPage: 5,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/authors/exec',
    label: 'meet our exec',
  },
  // {
  //   href: '/about',
  //   label: 'about',
  // },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'mailto:hello@warwick.ai',
    label: 'Email',
  },
  {
    href: 'https://discord.gg/YshvNtPUZm',
    label: 'Discord',
  },
  {
    href: 'https://instagram.com/warwick_ai',
    label: 'Instagram',
  },
  {
    href: 'https://linkedin.com/company/warwick-ai',
    label: 'LinkedIn',
  },
  {
    href: 'https://github.com/WarwickAI',
    label: 'GitHub',
  },
  {
    href: 'https://www.warwicksu.com/societies-sports/societies/warwickai/',
    label: 'WarwickSU',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Instagram: 'lucide:instagram',
  Email: 'lucide:mail',
  Discord: 'discord',
  WarwickSU: 'warwick-su',
  RSS: 'lucide:rss',
}
