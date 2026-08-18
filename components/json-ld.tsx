/**
 * Structured data. Worth shipping now the site has a real domain to be indexed
 * under (BACKLOG "Domain unlocked" §4) — `JobPosting` in particular is what
 * gets a listing into Google Jobs rather than ordinary blue links.
 *
 * ponytail: one component, no schema types, no builder. The shape is whatever
 * schema.org says and the caller writes it literally.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered from our own DB rows, but a brief is user-written text:
      // JSON.stringify escapes the quotes and `<` is escaped below, so a brief
      // containing "</script>" cannot close the tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
