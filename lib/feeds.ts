import Parser from "rss-parser";

// The five outlets, with candidate RSS endpoints. Some sites expose several
// feeds; these are the broad "latest" feeds. Verified/adjusted via the
// fetch test in scripts/test-feeds.ts.
export type Outlet = {
  name: string;
  url: string;
  /** Paywalled outlets: never scrape full text (headline + blurb only). */
  paywalled?: boolean;
};

// A Google News RSS search scoped to one publisher's domain. Used for outlets
// that block direct RSS / serve a bot interstitial (The Wire, The Ken).
function googleNews(site: string): string {
  return `https://news.google.com/rss/search?q=site:${site}%20when:2d&hl=en-IN&gl=IN&ceid=IN:en`;
}

export const OUTLETS: Outlet[] = [
  { name: "Indian Express", url: "https://indianexpress.com/feed/" },
  { name: "Financial Times", url: "https://www.ft.com/rss/home", paywalled: true },
  { name: "Scroll", url: "https://feeds.feedburner.com/ScrollinArticles" },
  { name: "The Wire", url: googleNews("thewire.in") },
  { name: "The Ken", url: googleNews("the-ken.com"), paywalled: true },
];

export type FeedItem = {
  outlet: string;
  title: string;
  /** Short summary/blurb (headline-level; no paywalled full text). */
  blurb: string;
  url: string;
  publishedAt: Date | null;
  /** Whether the full article may be fetched (non-paywalled, direct URL). */
  scrapeable: boolean;
  /** Best-effort byline from the feed (often empty). */
  author?: string;
};

// Opinion/op-ed feeds. Only outlets with a clean, dedicated opinion section are
// included — The Wire/Scroll/The Ken expose no reliable opinion feed (see
// scripts/probe-opinion.ts). Indian Express op-eds are full-text scrapeable;
// FT opinion is paywalled (headline-level).
export const OPINION_FEEDS: Outlet[] = [
  { name: "Indian Express", url: "https://indianexpress.com/section/opinion/feed/" },
  { name: "Financial Times", url: "https://www.ft.com/rss/opinion", paywalled: true },
];

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Google News titles look like "Headline - Publisher". Strip that suffix.
function cleanTitle(title: string, isGoogleNews: boolean): string {
  if (!isGoogleNews) return title;
  return title.replace(/\s+-\s+[^-]+$/, "").trim();
}

function toDate(item: Parser.Item): Date | null {
  const raw = item.isoDate ?? item.pubDate;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/** Fetch one outlet's feed, normalized. Returns [] on failure (logged). */
export async function fetchOutlet(outlet: Outlet): Promise<FeedItem[]> {
  const isGoogleNews = outlet.url.includes("news.google.com");
  // Scrape only non-paywalled outlets that give direct article URLs.
  // (Google News links are redirects, so they're not scraped.)
  const scrapeable = !outlet.paywalled && !isGoogleNews;
  try {
    const feed = await parser.parseURL(outlet.url);
    return (feed.items ?? []).flatMap((item) => {
      const url = item.link?.trim();
      const rawTitle = item.title?.trim();
      if (!url || !rawTitle) return [];
      const title = cleanTitle(rawTitle, isGoogleNews);
      const blurbRaw =
        item.contentSnippet ?? item.summary ?? item.content ?? "";
      // Google News snippets just echo the title — drop them so we don't
      // store noise; the headline carries the signal for those outlets.
      const blurb = isGoogleNews ? "" : stripHtml(blurbRaw).slice(0, 600);
      const author =
        (item.creator || (item as { author?: string }).author || "").trim() ||
        undefined;
      return [
        {
          outlet: outlet.name,
          title,
          blurb,
          url,
          publishedAt: toDate(item),
          scrapeable,
          author,
        },
      ];
    });
  } catch (err) {
    console.error(`[feeds] failed to fetch ${outlet.name} (${outlet.url}):`, err);
    return [];
  }
}

/**
 * Fetch all outlets in parallel and return items published within the last
 * `windowHours`. Items without a parseable date are kept (better to include).
 */
export async function fetchRecentItems(
  windowHours = 24,
  maxPerOutlet = 40,
): Promise<FeedItem[]> {
  const cutoff = Date.now() - windowHours * 60 * 60 * 1000;
  const perOutlet = await Promise.all(OUTLETS.map(fetchOutlet));

  const capped = perOutlet.flatMap((items) =>
    items
      .filter((it) => it.publishedAt === null || it.publishedAt.getTime() >= cutoff)
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
      .slice(0, maxPerOutlet),
  );

  return capped.sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
  );
}

/** Recent op-ed/opinion items across OPINION_FEEDS (same shape as news items). */
export async function fetchOpinionItems(
  windowHours = 48,
  maxPerFeed = 30,
): Promise<FeedItem[]> {
  const cutoff = Date.now() - windowHours * 60 * 60 * 1000;
  const perFeed = await Promise.all(OPINION_FEEDS.map(fetchOutlet));

  const capped = perFeed.flatMap((items) =>
    items
      .filter((it) => it.publishedAt === null || it.publishedAt.getTime() >= cutoff)
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
      .slice(0, maxPerFeed),
  );

  return capped.sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
  );
}
