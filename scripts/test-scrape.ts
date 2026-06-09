import { fetchOutlet, OUTLETS } from "../lib/feeds";
import { extractArticle } from "../lib/scrape";
async function main() {
  const ie = OUTLETS.find((o) => o.name === "Indian Express")!;
  const items = await fetchOutlet(ie);
  console.log(`IE items: ${items.length}, scrapeable: ${items[0]?.scrapeable}`);
  for (const it of items.slice(0, 3)) {
    const full = await extractArticle(it.url);
    console.log(`\n- ${it.title}\n  url: ${it.url}\n  full text: ${full ? full.length + " chars" : "NULL"}`);
    if (full) console.log(`  preview: ${full.slice(0, 160)}...`);
  }
}
main().then(() => process.exit(0));
