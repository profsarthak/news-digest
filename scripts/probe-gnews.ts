import Parser from "rss-parser";
const parser = new Parser({ timeout: 15000, headers: { "User-Agent": "Mozilla/5.0" } });
const sites = ["thewire.in", "the-ken.com", "scroll.in"];
async function main() {
  for (const s of sites) {
    const url = `https://news.google.com/rss/search?q=site:${s}%20when:2d&hl=en-IN&gl=IN&ceid=IN:en`;
    try {
      const f = await parser.parseURL(url);
      console.log(`OK ${s}: ${f.items?.length ?? 0} items; e.g. "${f.items?.[0]?.title ?? ""}"`);
      console.log(`   link: ${f.items?.[0]?.link ?? ""}`);
      console.log(`   snippet: ${(f.items?.[0]?.contentSnippet ?? "").slice(0,100)}`);
    } catch (e) { console.log(`FAIL ${s}: ${e instanceof Error ? e.message : e}`); }
  }
}
main().then(() => process.exit(0));
