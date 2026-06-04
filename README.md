# ShramSaathi

ShramSaathi is a Next.js web application that connects customers with local workers and provides job posting, job feeds, and worker progress tracking.

## Features
- Customer and worker dashboards
- Job posting and job feed for workers
- QR generator for jobs
- Firebase integration for auth and data
- PWA support via `next-pwa`

## Prerequisites
- Node.js 18+ (recommended)
- npm (or yarn / pnpm)

## Install
Clone the repo, install dependencies, and start the dev server:

```bash
npm install
npm run dev
```

Available scripts (from `package.json`):

- `npm run dev` — start development server
- `npm run build` — build production assets
- `npm run start` — start production server after build
- `npm run lint` — run ESLint

## Environment
Create a `.env.local` in the project root to add any required environment variables. This project uses Firebase; set your Firebase config values as `NEXT_PUBLIC_...` variables matching the keys used in `src/lib/firebase.js`.

## Notes about this repository
- The repo uses `next` 14 and `firebase` for backend services.


