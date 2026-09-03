# 📢 AdsMVP (Scouter Ads)

An AI-assisted Google Ads campaign generator built on Next.js.

## Features

- 🤖 **AI campaign generation** — an `/api/generate-campaign` route uses the OpenAI/Vercel AI SDK to draft ad campaign content
- 📊 **Google Ads integration** — wired up with `google-ads-api` for pulling or pushing campaign data
- 🎨 **Modern UI** — React 19 + Tailwind-adjacent styling with `framer-motion` animations and `lucide-react` icons
- 🌗 **Theming** — dark/light mode via `next-themes`

## Installation

```bash
git clone <this repo>
cd AdsMVP
npm install
```

## Usage

```bash
npm run dev        # start the Next.js dev server
npm run dev:server  # run the standalone Express/ts-node server (server.ts)
npm run dev:all     # run both together
```

Then open [http://localhost:3000](http://localhost:3000).

## Built with

- [Next.js](https://nextjs.org/) 16 + React 19
- [Express](https://expressjs.com/) (secondary server in `server.ts`)
- [OpenAI SDK](https://github.com/openai/openai-node) / [Vercel AI SDK](https://sdk.vercel.ai/)
- [google-ads-api](https://github.com/Opteo/google-ads-api)
- Tailwind-merge, Framer Motion, Lucide icons

## Status

🚧 Early-stage MVP — the repo mixes a Vite/React scaffold (`src/`) with a newer Next.js app (`app/`), and the project has been renamed at least once ("Impact Ads" → "Scouter Ads"), suggesting it's still finding its shape.
