// Probe candidate RSS endpoints for the outlets whose feeds failed.
// Run with:  npx tsx scripts/probe-feeds.ts
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

const candidates: Record<string, string[]> = {
  "The Wire": [
    "https://thewire.in/feed",
    "https://thewire.in/rss",
    "https://m.thewire.in/feed",
    "https://thewire.in/feed/rss",
  ],
  "The Ken": [
    "https://the-ken.com/feed/",
    "https://the-ken.com/rss/",
    "https://the-ken.com/feed/rss/",
  ],
  Scroll: [
    "https://scroll.in/feed",
    "https://scroll.in/rss",
    "https://feeds.feedburner.com/ScrollinArticles",
    "https://scroll.in/feeds/all.rss",
  ],
};

async function main() {
  for (const [outlet, urls] of Object.entries(candidates)) {
    console.log(`\n=== ${outlet} ===`);
    for (const url of urls) {
      try {
        const feed = await parser.parseURL(url);
        const n = feed.items?.length ?? 0;
        console.log(`  OK   ${url}  (${n} items)  e.g. "${feed.items?.[0]?.title ?? ""}"`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`  FAIL ${url}  -> ${msg}`);
      }
    }
  }
}

main().then(() => process.exit(0));
