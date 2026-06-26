# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`isaacperera.com` — a personal static site for sharing a child's swimming, violin/strings, and science updates. Built on the [AstroPaper](https://github.com/satnaing/astro-paper) theme, heavily customized. Astro generates static HTML into `dist/`, which is synced to an S3 bucket served via CloudFront. **All media (videos/large images) is hosted in a separate S3 bucket** and embedded by URL — media is never committed to the repo.

## Commands

```bash
npm run dev          # Dev server (http://localhost:4321)
npm run build        # astro build + jampack optimization pass over ./dist
npm run preview      # Preview the production build locally
npm run sync         # Regenerate Astro content collection types (run after schema changes)

npm run lint         # ESLint
npm run format       # Prettier (write) — uses prettier-plugin-astro
npm run format:check # Prettier (check only)

npm run deploy       # aws s3 sync dist/ s3://isaacperera-client --delete
                     # postdeploy auto-runs: CloudFront invalidation (distribution E1T5SR7CSIVJHT)
```

- Use Node `21.1` (`.nvmrc`). `npm run deploy` requires authenticated AWS CLI.
- A full release is: `npm run build` then `npm run deploy`. `deploy` only uploads what's already in `dist/`, so always build first.
- There is no test suite. "Verification" means `npm run build` succeeds and `npm run preview` looks right.
- Husky + lint-staged run Prettier on staged files at commit. Commits use Commitizen (`npm run cz`, conventional-changelog).

## Stack notes (versions matter)

- **Astro 7**, **Tailwind CSS 4** (configured via the `@tailwindcss/vite` plugin in `astro.config.ts`, not a PostCSS setup), **React 19** islands via `@astrojs/react`.
- Path aliases (see `tsconfig.json`): `@config`, `@components/*`, `@layouts/*`, `@utils/*`, `@assets/*`, `@content/*`, `@styles/*`, `@pages/*`. Prefer these over relative imports.
- OG images are generated in-process with **Satori + @resvg/resvg-js** (no external service). `@resvg/resvg-js` is excluded from Vite optimizeDeps — leave that exclusion in place.

## Architecture

Content flows: Markdown in `src/content/blog/` → validated by the Zod schema → filtered/sorted by utils → rendered through layouts → static pages.

- **Content collection** is defined in `src/content.config.ts` (note: top-level `src/`, not `src/content/config.ts` — older docs may say otherwise). It uses the `glob` loader over `src/content/blog/**/[^_]*.{md,mdx}`. Posts are plain `.md` but freely embed raw HTML (notably `<video class="video-js vjs-default-skin">` pointing at the media S3 bucket). After changing the schema, run `npm run sync`.
- **Post visibility** is centralized in `src/utils/postFilter.ts`: it hides `draft: true` posts and any post whose `pubDatetime` is in the future beyond `SITE.scheduledPostMargin` (15 min). `getSortedPosts.ts` applies this filter and sorts by `modDatetime ?? pubDatetime` (newest first). Almost every page consumes posts through these utils — change visibility/ordering logic there, not in individual pages.
- **Site-wide config** lives in `src/config.ts` (`SITE`, `SOCIALS`, `LOCALE`, `LOGO_IMAGE`). `SITE.postPerPage` (3) drives pagination via `getPagination.ts` / `getPageNumbers.ts`. Social links are toggled per-item with the `active` flag.
- **Routing** is file-based under `src/pages/`: home (`index.astro`), `posts/` (archive + `[slug]/index.astro` detail), `tags/` (index + `[tag]/[page]`), `search.astro` (client-side Fuse.js, syncs `?q=`), plus endpoint routes `rss.xml.ts`, `robots.txt.ts`, `og.png.ts`, and per-post OG at `posts/[slug]/index.png.ts`.
- **Layouts** (`src/layouts/`): `Layout.astro` is the HTML shell (head/meta/OG/theme); `Main.astro` wraps content sections; `PostDetails`, `Posts`, `TagPosts`, `AboutLayout` are page-type specific.
- **OG image generation**: `src/utils/generateOgImages.tsx` + templates in `src/utils/og-templates/{post,site}.tsx`. Posts without a custom `ogImage` get an auto-generated PNG at build via the `[slug]/index.png.ts` endpoint. Custom `ogImage` must be ≥ 1200×630 (enforced by the schema).
- **Theme**: light/dark toggle persisted in localStorage, respects `prefers-color-scheme`; design tokens and prose overrides live in `src/styles/base.css`.

## Authoring a post

Add a `.md` file to `src/content/blog/`. Required frontmatter: `title`, `description`, `pubDatetime` (a date). Common optional fields: `modDatetime`, `featured` (shows on homepage), `draft`, `tags` (array; defaults to `["others"]`), `slug`, `ogImage`, `canonicalURL`. Embed media via `<video>`/`<img>` tags whose `src` is the media S3 URL — do not commit video files. See existing posts in `src/content/blog/` for the pattern.
