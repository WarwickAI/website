import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// The tested modules are plain TypeScript and never import astro:db, so this
// doesn't need Astro's Vite config
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts', 'db/**/*.test.ts'],
  },
})
