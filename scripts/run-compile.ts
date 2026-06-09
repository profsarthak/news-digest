// Run the full compile pipeline once, store the result, and print an exact
// cost breakdown from real token/search usage.
// Run with:  node --env-file=.env.local --import tsx scripts/run-compile.ts
import { compileDigest } from "../lib/compile";
import { writeDigest } from "../lib/storage";
import { usage, type CallUsage } from "../lib/anthropic";

// Standard published rates ($ per 1M tokens). Verify against your console.
const RATES: Record<string, { in: number; out: number; cacheRead: number }> = {
  "claude-sonnet-4-6": { in: 3, out: 15, cacheRead: 0.3 },
  "claude-haiku-4-5": { in: 1, out: 5, cacheRead: 0.1 },
};
const WEB_SEARCH_RATE = 10 / 1000; // $0.01 per search

function costOf(c: CallUsage): number {
  const r = RATES[c.model] ?? { in: 3, out: 15, cacheRead: 0.3 };
  return (
    (c.input * r.in +
      c.output * r.out +
      c.cacheRead * r.cacheRead) /
      1_000_000 +
    c.webSearches * WEB_SEARCH_RATE
  );
}

function summarize(calls: CallUsage[]) {
  const groups = new Map<string, CallUsage[]>();
  for (const c of calls) {
    const key = `${c.label} (${c.model})`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(c);
  }
  let totalCost = 0;
  let totalIn = 0;
  let totalOut = 0;
  let totalSearch = 0;
  console.log("\n=== COST BREAKDOWN ===");
  console.log(
    "step".padEnd(28) + "calls  input      output    searches   $",
  );
  for (const [key, cs] of groups) {
    const input = cs.reduce((s, c) => s + c.input + c.cacheRead, 0);
    const output = cs.reduce((s, c) => s + c.output, 0);
    const searches = cs.reduce((s, c) => s + c.webSearches, 0);
    const cost = cs.reduce((s, c) => s + costOf(c), 0);
    totalCost += cost;
    totalIn += input;
    totalOut += output;
    totalSearch += searches;
    console.log(
      key.padEnd(28) +
        String(cs.length).padEnd(7) +
        String(input).padEnd(11) +
        String(output).padEnd(10) +
        String(searches).padEnd(11) +
        "$" + cost.toFixed(4),
    );
  }
  console.log("-".repeat(72));
  console.log(
    "TOTAL".padEnd(28) +
      String(calls.length).padEnd(7) +
      String(totalIn).padEnd(11) +
      String(totalOut).padEnd(10) +
      String(totalSearch).padEnd(11) +
      "$" + totalCost.toFixed(4),
  );
  console.log(`\nEstimated monthly (daily run): $${(totalCost * 30).toFixed(2)}`);
}

async function main() {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  usage.reset();
  console.log(`Compiling digest for ${date}...`);
  const t0 = Date.now();
  const digest = await compileDigest(date);
  await writeDigest(digest);
  console.log(
    `\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s — ${digest.topics.length} topics:`,
  );
  for (const t of digest.topics) {
    console.log(
      `  • ${t.researched ? "🔎" : "  "} ${t.title}  [ctx ${t.context.length} | impl ${t.implications.length} | gloss ${t.glossary.length} | src ${t.sources.length}]`,
    );
  }
  summarize(usage.calls);
}

main().then(() => process.exit(0));
