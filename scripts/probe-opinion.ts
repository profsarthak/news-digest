// Probe candidate opinion/op-ed feeds. Run: npx tsx scripts/probe-opinion.ts
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

function gnews(q: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:3d")}&hl=en-IN&gl=IN&ceid=IN:en`;
}

const candidates: Record<string, string[]> = {
  "Indian Express": ["https://indianexpress.com/section/opinion/feed/"],
  "Financial Times": ["https://www.ft.com/opinion?format=rss", "https://www.ft.com/rss/opinion"],
  "The Wire": [gnews("site:thewire.in opinion"), "https://thewire.in/category/opinion/feed"],
  Scroll: [gnews("site:scroll.in opinion"), "https://scroll.in/feeds/all.rss"],
  "The Ken": [gnews("site:the-ken.com opinion")],
};

async function main() {
  for (const [outlet, urls] of Object.entries(candidates)) {
    console.log(`\n=== ${outlet} ===`);
    for (const url of urls) {
      try {
        const feed = await parser.parseURL(url);
        const it = feed.items?.[0];
        const author =
          // deno-lint-ignore no-explicit-any
          (it as any)?.creator ?? (it as any)?.author ?? (it as any)?.["dc:creator"] ?? "—";
        console.log(`  OK   ${url}`);
        console.log(`       items=${feed.items?.length ?? 0}  author="${author}"  e.g. "${it?.title ?? ""}"`);
      } catch (e) {
        console.log(`  FAIL ${url}  -> ${e instanceof Error ? e.message : e}`);
      }
    }
  }
}

main().then(() => process.exit(0));
