export const JOB_MARKER_RE = /\[\[job:([0-9a-fA-F-]{36})\]\]/g;

export function extractJobIds(body: string | null | undefined): string[] {
  if (!body) return [];
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const m of body.matchAll(JOB_MARKER_RE)) {
    const id = m[1].toLowerCase();
    if (!seen.has(id)) { seen.add(id); ids.push(id); }
  }
  return ids;
}
