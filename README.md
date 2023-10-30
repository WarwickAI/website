# Website

Planning to use Next.js with Tailwind CSS and TypeScript.

## Getting Started

Created using:

1. `npx create-next-app@latest website --typescript` (Next.js with TypeScript)
1. `cd website`
1. `npm install -D tailwindcss postcss autoprefixer` (Tailwind CSS)
1. `npx tailwindcss init -p` (Tailwind CSS)

Code formatting:

1. `npm install -D prettier prettier-plugin-tailwindcss` (Installing Prettier)
1. `npx prettier ./src --write --plugin=prettier-plugin-tailwindcss` (Running
   Prettier)

Recommended VS Code extensions:

1. [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
1. [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
1. [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss)

## Running Locally

To run locally with hot reloading:

1. `npm run dev`

## Deploying

TODO(czarlinski): Deploy the website to `warwick.ai`.
