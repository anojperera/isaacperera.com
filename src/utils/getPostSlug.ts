import type { CollectionEntry } from "astro:content";

/**
 * Canonical URL slug for a blog post.
 *
 * The glob content loader exposes `id` (e.g. "bromley_championship"), not the
 * legacy `slug` field, so links must derive the slug the same way the
 * `/posts/[slug]` route does in getStaticPaths. Keep this the single source of
 * truth for both.
 */
export default function getPostSlug(post: CollectionEntry<"blog">): string {
  return (
    post.id
      .split("/")
      .pop()
      ?.replace(/\.(md|mdx)$/, "") ||
    post.data.title.toLowerCase().replace(/\s+/g, "-")
  );
}
