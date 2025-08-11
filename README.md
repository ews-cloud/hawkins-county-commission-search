# Hawkins County Commission Search

A Next.js app that crawls the county clerk site for **Agendas, Minutes, Resolutions**, builds a JSON search index, and serves a fast client-side search UI.

## Quick start
```bash
# 1) Install
npm i   # or: pnpm i / yarn

# 2) (Optional) Build index from the live site
npm run crawl

# 3) Run
npm run dev
# open http://localhost:3000
```

## Deploy
- **Vercel** (recommended): push to GitHub, connect the repo in Vercel, Deploy. Add a cron (GitHub Action/Vercel Cron) to run `npm run crawl` on a schedule to refresh `public/index.json`.
- **Replit / CodeSandbox**: import this folder and click Run.

## Notes
- For demo: `public/index.json` already contains sample records so it works out-of-the-box.
- Crawler: `tools/build-index.ts` (Node runtime, uses `pdf-parse`).