# Constance Turyova — Actor Portfolio

A full-stack SEO-optimized actor portfolio website for Constance Turyova, featuring a dynamic CMS for managing slider images and blog posts, built in the Umbrella Light theme aesthetic.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + wouter (routing) + TanStack Query + react-helmet-async (SEO)
- API: Express 5 + multer (file uploads)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/portfolio/src/` — React frontend (pages, components, CSS)
- `artifacts/portfolio/src/pages/` — Home, About, Blog, BlogPost, Contact, Admin
- `artifacts/portfolio/src/components/` — Layout.tsx (fixed UI layer), Slider.tsx (auto-advancing)
- `artifacts/portfolio/src/index.css` — Complete Umbrella Light theme CSS
- `artifacts/api-server/src/routes/` — slides.ts, blog.ts, settings.ts, upload.ts, health.ts
- `artifacts/api-server/uploads/` — uploaded images served at /api/uploads/:filename
- `lib/db/src/schema/` — slidesTable, blogPostsTable, siteSettingsTable
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for hooks + Zod schemas)
- `.github/workflows/deploy.yml` — GitHub Actions FTP deploy to Namecheap (secrets: FTP_SERVER, FTP_USERNAME, FTP_PASSWORD)
- `php-site/` — PHP deployment support files for Namecheap shared hosting

## Architecture decisions

- **Contract-first API**: OpenAPI spec in `lib/api-spec/openapi.yaml` drives code generation for both React Query hooks (`lib/api-client-react`) and server-side Zod validators (`lib/api-zod`). Always edit the spec first, then run codegen.
- **Full-screen slider layout**: The Umbrella Light theme uses `position: fixed` for every UI element — slider fills `0 0 0 0`, layout panel overlays at z-index 1, content panels slide in from right (right-side pages) or left (blog). This avoids scroll and gives the cinematic feel.
- **Admin auth**: Client-side only (localStorage flag). Password is `constance2024`. This is intentional for a simple CMS — no server session needed for this use case.
- **File uploads**: Custom `/api/upload` multer route (NOT in OpenAPI spec) stores files in `artifacts/api-server/uploads/`. Served back at `/api/uploads/:filename`. Frontend POSTs via plain `fetch` with `FormData`.
- **SEO**: `react-helmet-async` provides per-page `<title>`, `<meta name="description">`, `<meta property="og:*">`, and JSON-LD structured data on the home page.

## Product

- **Home**: Full-screen auto-advancing slider (managed via CMS), hamburger navigation overlay, blog/contact/email links
- **About**: Tabbed panel (History, Training, Philosophy, Goals) alongside slider background
- **Blog**: Left-side panel with post list; click to open full article; managed from Admin
- **Contact**: Instagram (@constanceturyova), email, and contact form
- **Admin** (`/admin`, password: `constance2024`): Slide image upload, blog post CRUD (create/edit/publish/delete), site settings editor

## User preferences

- Instagram: https://www.instagram.com/constanceturyova/
- Admin password: constance2024
- Deploy target: Namecheap shared hosting via FTP (GitHub Actions)
- Theme: Umbrella Light — minimal, cinematic, editorial (warm off-white background, all-caps labels, light typography)

## Gotchas

- After changing `lib/db/src/schema/`, run `pnpm --filter @workspace/db run push` AND `pnpm run typecheck:libs` before typechecking server routes.
- Do NOT use `zod/v4` in `artifacts/api-server` — the api-server package does not have zod installed directly. Use types from `@workspace/api-zod` instead.
- The API server must be restarted after route changes (it builds with esbuild before starting).
- `artifacts/portfolio` is a Vite SPA — all routes are handled client-side via wouter; the Vite dev server serves `index.html` for all paths.
- File upload endpoint (`/api/upload`) is custom, not generated from the OpenAPI spec — use plain `fetch + FormData` on the frontend.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- GitHub Actions FTP deploy: add `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` secrets to the GitHub repo
