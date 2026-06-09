import { extract } from "@extractus/article-extractor";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Best-effort full-article text extraction for non-paywalled pages.
 * Returns null on failure or thin content — callers fall back to the blurb.
 */
export async function extractArticle(url: string): Promise<string | null> {
  try {
    const article = await Promise.race([
      extract(url),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000)),
    ]);
    if (!article || !article.content) return null;
    const text = stripHtml(article.content);
    return text.length > 250 ? text : null;
  } catch (err) {
    console.error(`[scrape] failed for ${url}:`, err);
    return null;
  }
}
