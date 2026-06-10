// Small shared helpers used by both the news and op-ed pipelines.

/**
 * Run an async mapper over items with a fixed concurrency, preserving order.
 * Keeps the per-minute token rate under the account's limit during the burst.
 */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

/** URL-safe slug from a title (lowercase, hyphenated, capped at 60 chars). */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Ensure a slug is unique within a set, appending -2, -3, … as needed. */
export function uniqueSlug(title: string, used: Set<string>): string {
  const base = slugify(title) || "item";
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}
