# GROK.md — isaacperera.com

A personal static website for Isaac Perera (a boy). It serves as a "mission log" / deep-space console for sharing swimming achievements, violin/string performances, science projects, and other personal updates.

The site has a custom **sci-fi "Mission Control" UI** designed to feel exciting for a 10-year-old explorer: neon aqua/violet/lime accents on a dark starfield console, glassy header, HUD-style stats, animated reveals, glowing video frames, and subtle background grid + drifting orbs + film grain.

Built on the [AstroPaper](https://github.com/satnaing/astro-paper) Astro theme with heavy customization.

## Core Technology

- **Framework**: Astro 7 (static site generation)
- **Content**: Astro Content Collections (glob loader) using Markdown (`.md` files in `src/content/blog/`) with rich HTML embeds (especially `<video>`)
- **Interactive UI**: React 19 components via `@astrojs/react` (Search, Card)
- **Styling**: Tailwind CSS 4 via `@tailwindcss/vite` plugin + `@tailwindcss/typography`. Heavy use of CSS custom properties for the mission-control theme (`--bg`, `--ink`, `--accent`, `--glow-*`, etc.). Dark-only (`lightAndDarkMode: false`).
- **Fonts**: Custom display stack (Orbitron + Outfit) + Outfit sans + IBM Plex Mono
- **Search**: Fuse.js (client-side, URL-synced query)
- **OG Images**: Dynamic generation using Satori + @resvg/resvg-js (no external service)
- **RSS / Sitemap**: Native Astro integrations
- **Remark plugins**: `remark-toc` + `remark-collapse` (wired via `@astrojs/markdown-remark` unified processor)
- **Video**: Direct `<video class="video-js ...">` embeds pointing to external media S3 bucket. Styled with glowing frames.
- **Build optimization**: jampack (`@divriots/jampack`)
- **TypeScript** + ESLint 9 + Prettier + Husky 9
- **UI Effects**: "reveal" animations, pulsing logo dot, drifting background orbs, HUD grid + grain (defined in `src/layouts/Layout.astro` + `base.css`)
- **Header**: Glassy rounded "header-bar" with callsign logo, uppercase tracking-widest nav links, mobile slide-in menu.

## Project Structure

```
src/
├── components/          # Reusable UI (Header with glassy bar + mobile menu, Footer, Card, Tag, Search, etc.)
├── config.ts            # Site-wide constants (SITE, SOCIALS, LOCALE, LOGO_IMAGE) — lightAndDarkMode: false
├── content.config.ts    # Content collection (glob loader + Zod schema). Moved from legacy src/content/config.ts for Astro 6/7
├── content/
│   └── blog/            # All blog posts as .md files (raw <video> + images from media bucket)
├── layouts/             # Page layouts + global FX background (Layout.astro injects .fx-bg orbs/grid/grain)
├── pages/               # File-based routing
│   ├── index.astro      # Home — "Personal mission log" hero with HUD stats (Pool/Strings/Lab), reveal animations, Featured + Latest
│   ├── posts/           # List + dynamic [slug] + per-post OG
│   ├── tags/            # Tag index + filtered pages
│   ├── about.md         # About page
│   ├── search.astro     # Client-side search
│   └── ... (rss, robots, og.png.ts, etc.)
├── styles/base.css      # Full mission-control theme: CSS vars, HUD styles, .grad-text, .kicker, .reveal, .hud-bracket, prose overrides, video glow frames, FX
├── utils/
│   └── getPostSlug.ts   # Canonical slug helper (content layer uses .id; used by Card + pages)
└── ...
```

`public/` contains static assets.

The UI is intentionally playful and "cool kid": uppercase tracking, neon glows, console-like labels ("priority signal", "incoming transmissions", "Launch adventures").

## Content Model & Frontmatter

Blog posts live in `src/content/blog/` as `.md` files.

**Schema** (defined in `src/content.config.ts` using the glob loader):

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

- `featured: true` → shown in the Featured "priority signal" section
- `draft: true` → hidden (postFilter)
- Future posts hidden in prod (SITE.scheduledPostMargin)
- Posts without ogImage get auto-generated PNGs
- Slug resolution now uses `getPostSlug(post)` (src/utils/getPostSlug.ts) because the content glob loader exposes `.id` rather than legacy `.slug` in many cases.

## Key Pages & Features

| Route                  | Description |
|------------------------|-------------|
| `/`                    | Home: "Mission Log" hero with animated HUD stats (🏊 Pool / 🎻 Strings / 🧪 Lab), grad-text title, "Launch adventures" CTAs, Featured + Latest sections with "kicker" labels |
| `/posts/`              | Paginated archive |
| `/posts/[slug]/`       | Full post + glowing video frames |
| `/tags/` + `/tags/[tag]/` | Tag navigation |
| `/search/`             | Fuse.js search |
| `/about/`              | About |
| `/rss.xml` + sitemap   | Standard |

**Theme / Visuals**:
- Dark-only deep-space console
- Glassy `.header-bar` (rounded-2xl, backdrop blur)
- Pulsing `.logo-dot`, `.grad-text`, `.nav-link` + `.nav-active`
- `.reveal` + staggered animation-delays
- Custom background FX layer (grid + 3 drifting glow orbs + noise grain)
- Special video styling in `.prose`
- Lots of font-display + uppercase tracking-widest for "mission log" feel.

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

- **Site metadata**: `src/config.ts` (`SITE`, `SOCIALS`, `LOCALE`, `lightAndDarkMode: false`)
- **Content schema + loader**: `src/content.config.ts`
- **Posts per page**: `SITE.postPerPage` (3)
- **OG images**: 1200×630
- **Logo / theme**: Logo is now a styled callsign in Header. Theme is dark-only with custom CSS vars in base.css.
- **Amplify hosting**: See `amplify.yml` + Deployment section above.

## Build, Scripts & Deployment

```json
"dev": "astro dev",
"build": "astro build && jampack ./dist",
"deploy": "echo 'Hosting on AWS Amplify — see GROK.md + amplify.yml'"
```

**Hosting (as of latest update)**: AWS Amplify (static site hosting)

- `amplify.yml` at repo root defines the build (npm ci → npm run build → serve `dist/`).
- Recommended: Connect the Git repository directly in the AWS Amplify Console (Hosting → New app). Amplify auto-detects the config and deploys on push.
- Manual deploys also supported (drag `dist/` folder or use Amplify CLI).
- Build artifacts: `baseDirectory: dist`

**Custom Domain + Certificates**
- In Amplify Console: App settings → Domain management → Add domain.
- You can bring your existing ACM certificate(s) (ensure the cert is in a supported region; Amplify often works best with certs it can manage or that match the domain validation).
- Update DNS:
  - Apex domain: Route 53 A/ALIAS record pointing to the Amplify domain (or use Amplify's nameservers).
  - www / subdomains: CNAME to the Amplify-provided domain name.
- Amplify will provision a managed certificate if you prefer not to use the existing one.

**Old hosting** (S3 + CloudFront at s3://isaacperera-client + distro E1T5SR7CSIVJHT) has been retired in favor of Amplify.

Docker compose is still available for local dev.

## Important Utilities

- `postFilter.ts`, `getSortedPosts.ts`, `getPagination.ts`, `getUniqueTags.ts`, `getPostsByTag.ts`
- `getPostSlug.ts` — single source of truth for deriving the route slug from content layer entries (uses `post.id` primarily).
- `generateOgImages.tsx` + og-templates

## Notes & Customizations

- The UI was completely refreshed into a **"Mission Log" / deep-space console** experience for a 10-year-old boy (neon HUD, glassy header, drifting glow orbs, grain, animated reveals, "kicker" labels, stat readouts).
- Dark-only theme (`lightAndDarkMode: false` in `src/config.ts`).
- Content uses the modern glob loader + `src/content.config.ts` (Astro 6/7 requirement).
- Videos hosted externally (media S3) and embedded with special glowing frame styles.
- No social accounts are active in the config.
- Still uses plain `.md` files + raw HTML embeds.

## Quick Commands

```bash
npm run dev
npm run build
npm run format
```

**For deployment**: Push to the connected Git repo (Amplify auto-deploys) or use the Amplify Console manual deploy flow.

---

This file exists to help future Grok (or human) sessions quickly understand the intent, architecture, and maintenance of the site.