# Website

Planning to use Next.js with Tailwind CSS and TypeScript.

## Getting Started

Requires Node.js 20.

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

To test a build (as would be built by Vercel):

1. `npm run build`

## Deploying

Main website is the Main branch of GitHub. Make a pull request to it for the automatic deployment pipeline to kick in.

- Have another branch, push to it, then make a pull request on GitHub to main. 
  - This will require a reviewer (can be bypassed for small patches + hotfixes)

