import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

function getCardAccent(tags: string[] = []) {
  const lower = tags.map(t => t.toLowerCase());
  if (lower.some(t => t.includes("swim") || t.includes("time"))) return "brand";
  if (
    lower.some(
      t => t.includes("violin") || t.includes("string") || t.includes("concert")
    )
  )
    return "jam";
  if (
    lower.some(
      t =>
        t.includes("science") || t.includes("matter") || t.includes("project")
    )
  )
    return "explore";
  return "brand";
}

const accentColors: Record<string, string> = {
  brand: "from-aqua-400 to-aqua-600",
  jam: "from-violet-400 to-violet-500",
  explore: "from-lime-400 to-lime-500",
};

const accentLabels: Record<string, string> = {
  brand: "AQUA",
  jam: "STRINGS",
  explore: "LAB",
};

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const {
    title,
    pubDatetime,
    modDatetime,
    description,
    tags = [],
  } = frontmatter;

  const accent = getCardAccent(tags);
  const accentClass = accentColors[accent] || accentColors.brand;

  const TitleTag = secHeading ? "h2" : "h3";

  return (
    <li>
      <a
        href={href}
        className="group block fun-card hud-bracket focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      >
        <div className="flex items-start gap-4">
          {/* Glowing accent rail with channel label */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div
              className={`h-12 w-1.5 rounded-full bg-gradient-to-b ${accentClass} shadow-[0_0_14px_var(--glow-a)] transition group-hover:h-14`}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
              {accentLabels[accent]}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <TitleTag
              className="font-display text-xl font-bold leading-snug tracking-tight text-[color:var(--ink)] transition group-hover:text-[color:var(--accent)]"
              style={{ viewTransitionName: slugifyStr(title) }}
            >
              {title}
            </TitleTag>

            <div className="mt-1.5">
              <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} />
            </div>

            <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-soft)] line-clamp-3">
              {description}
            </p>

            {/* Tag preview chips */}
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="tag-pill group-hover:border-[color:var(--accent)] group-hover:text-[color:var(--accent)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </a>
    </li>
  );
}
