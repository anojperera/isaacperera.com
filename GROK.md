# GROK.md — isaacperera.com

A personal static website for Isaac Perera (a boy). It serves as a simple webspace for sharing swimming achievements, violin/string performances, science projects, and other personal updates.

Built on the [AstroPaper](https://github.com/satnaing/astro-paper) Astro theme (v4) with heavy customization for a child's content.

## Core Technology

- **Framework**: Astro 4 (static site generation)
- **Content**: Astro Content Collections using Markdown (`.md` files in `src/content/blog/`) with rich HTML embeds
- **Interactive UI**: React components via `@astrojs/react` (Search, Card)
- **Styling**: Tailwind CSS + `@tailwindcss/typography` with custom "skin" design tokens for light/dark themes
- **Fonts**: IBM Plex Mono (loaded via Google Fonts + self-hosted for OG images)
- **Search**: Fuse.js (client-side, URL-synced query)
- **OG Images**: Dynamic generation using Satori + @resvg/resvg-js (no external service)
- **RSS / Sitemap**: Native Astro integrations (`@astrojs/rss`, `@astrojs/sitemap`)
- **Remark plugins**: `remark-toc` + `remark-collapse` (for "Table of contents")
- **Video**: Direct `<video>` HTML embeds (classed for video.js styling) served from external S3 bucket
- **Build optimization**: jampack (`@divriots/jampack`)
- **TypeScript** + ESLint + Prettier + Husky

## Project Structure

```
src/
├── components/          # Reusable UI (Header, Footer, Card, Tag, Search, etc.)
├── config.ts            # Site-wide constants (SITE, SOCIALS, LOCALE, LOGO_IMAGE)
├── content/
│   ├── blog/            # All blog posts as .md files
│   └── config.ts        # Content collection schema (Zod)
├── layouts/             # Page layouts (Layout, PostDetails, AboutLayout, Posts, TagPosts, Main)
├── pages/               # File-based routing
│   ├── index.astro      # Home (hero + featured + recent)
│   ├── posts/           # List + dynamic [slug] pages + OG image endpoint
│   ├── tags/            # Tag index + [tag] filtered pages
│   ├── about.md         # About page (uses AboutLayout)
│   ├── search.astro     # Search UI
│   ├── rss.xml.ts, robots.txt.ts, og.png.ts, etc.
├── styles/base.css      # Design tokens + prose overrides
├── utils/               # Helpers (getSortedPosts, getUniqueTags, slugify, pagination, OG generation)
└── assets/
    └── socialIcons.ts   # Inline SVG icons for social links
```

`public/` contains static assets (favicon, logo, toggle-theme.js, images).

## Content Model & Frontmatter

Blog posts live in `src/content/blog/` as `.md` files.

**Schema** (defined in `src/content/config.ts`):

```ts
{
  author: string,           // defaults to SITE.author
  pubDatetime: Date,
  modDatetime?: Date | null,
  title: string,
  featured?: boolean,
  draft?: boolean,
  tags: string[],           // defaults to ["others"]
  ogImage?: Image | string, // must be >= 1200x630 if image
  description: string,
  canonicalURL?: string,
  slug?: string,            // can be set in frontmatter
}
```

### Frontmatter Example

```md
---
author: Isaac Perera
pubDatetime: 2025-11-09 18:40:00
modDatetime: 2025-11-09 18:40:00
title: Bromley Swimming Championship
slug: bromley_championship
featured: true
draft: false
tags:
  - swimming, fly, back, free
description: Bromley Championships.
---

Post body (Markdown + raw HTML supported).
```

### Special Behaviors

- `featured: true` → shown in the Featured section on the homepage
- `draft: true` → hidden everywhere (including dev, via `postFilter`)
- Future `pubDatetime` posts are hidden in production (15-minute margin via `SITE.scheduledPostMargin`)
- Posts without a custom `ogImage` get auto-generated PNGs at build time via `/posts/[slug].png`

## Key Pages & Features

| Route                  | Description |
|------------------------|-------------|
| `/`                    | Home: Hero intro + Featured posts + Recent posts (max 4) |
| `/posts/`              | Paginated archive (3 posts/page) |
| `/posts/[slug]/`       | Full post view (PostDetails layout) |
| `/tags/`               | All unique tags |
| `/tags/[tag]/`         | Paginated posts filtered by tag |
| `/search/`             | Client-side Fuse.js search (title + description), updates URL `?q=` |
| `/about/`              | Simple about page |
| `/rss.xml`             | Full post RSS feed |
| `/sitemap-index.xml`   | Auto-generated |

**Post page extras**:
- Datetime (pub/mod) with "Updated:" when `modDatetime` present
- Tag pills
- Share links (WhatsApp, Facebook, Twitter, Telegram, Pinterest, Mail)
- Heading anchor links (`#`)
- Copy buttons on `<pre>` code blocks
- "Back to Top" button

**Theme**:
- Light/dark toggle persisted in localStorage
- Respects `prefers-color-scheme`
- Theme color meta synced to body background

## Content Topics (Observed)

Current posts cover:
- **Swimming**: Time trials (Maidstone SC), Bromley Championships, Medway Championships. Many include multiple embedded videos from S3 showing races (50m fly, back, free, breast, 200m free, etc.).
- **Strings / Violin**: School string concerts and workshops (with performance videos).
- **Science**: School project on states of matter (with image).

Videos are hosted on `https://isaacperera-media.s3.eu-west-2.amazonaws.com/` and embedded directly as `<video class="video-js vjs-default-skin" ...>`.

## Configuration Points

- **Site metadata**: `src/config.ts` (`SITE`, `SOCIALS`, `LOCALE`)
- **Content schema**: `src/content/config.ts`
- **Posts per page**: `SITE.postPerPage` (currently 3)
- **OG image dimensions**: Hardcoded 1200×630 in `generateOgImages.tsx`
- **Social links**: Controlled per-item via `active` flag in `SOCIALS`
- **Logo**: Controlled by `LOGO_IMAGE` (currently disabled, shows text title)

## Build, Scripts & Deployment

```json
// package.json (key scripts)
"dev": "astro dev",
"build": "astro build && jampack ./dist",
"deploy": "aws s3 sync dist/ s3://isaacperera-client --delete",
"postdeploy": "aws cloudfront create-invalidation --distribution-id E1T5SR7CSIVJHT --paths /*",
```

- Production site deployed to AWS S3 + CloudFront.
- Build output goes to `dist/`.
- Docker compose available for dev (`docker-compose.yml`).

## Important Utilities

- `postFilter.ts` — filters drafts + future posts
- `getSortedPosts.ts` — applies filter + sorts by modDatetime (fallback pubDatetime)
- `getUniqueTags.ts` / `getPostsByTag.ts` / `slugify.ts`
- `getPagination.ts` + `getPageNumbers.ts`
- `generateOgImages.tsx` + `og-templates/{post,site}.tsx`

## Notes & Customizations from AstroPaper

- Heavily tailored for a child's personal updates (swimming + music focus).
- Heavy use of raw HTML video embeds inside MD content (not typical blog pattern).
- Custom AWS S3 media hosting for videos/images.
- No active social accounts linked in config (most `active: false`).
- Uses `.md` files (not `.mdx`) but still leverages Astro content collections.
- OG images are generated both at build (for pages that need them) and via endpoint.

## Quick Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build + optimize
npm run deploy       # Sync to S3 + invalidate CloudFront (requires AWS CLI auth)
npm run format       # Prettier
```

---

This file exists to help future Grok (or human) sessions quickly understand the intent, architecture, and maintenance of the site.