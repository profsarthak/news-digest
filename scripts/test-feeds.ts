// Diagnostic: fetch each outlet's RSS and report availability/recency.
// Run with:  npx tsx scripts/test-feeds.ts
import { OUTLETS, fetchOutlet, fetchRecentItems } from "../lib/feeds";

async function main() {
  for (const outlet of OUTLETS) {
    const items = await fetchOutlet(outlet);
    const latest = items
      .map((i) => i.publishedAt)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    console.log(`\n=== ${outlet.name} (${outlet.url}) ===`);
    console.log(`  items: ${items.length}`);
    console.log(`  latest: ${latest ? latest.toISOString() : "n/a"}`);
    if (items[0]) {
      console.log(`  sample title: ${items[0].title}`);
      console.log(`  sample blurb: ${items[0].blurb.slice(0, 120)}...`);
    }
  }

  const recent = await fetchRecentItems(24);
  console.log(`\n>>> total items in last 24h across all outlets: ${recent.length}`);
}

main().then(() => process.exit(0));
