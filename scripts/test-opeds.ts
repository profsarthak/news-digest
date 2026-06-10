// Validate the op-ed pipeline alone (cheap). Prints results + cost.
// Run: node --env-file=.env.local --import tsx scripts/test-opeds.ts
import { compileOpEds } from "../lib/opeds";
import { usage } from "../lib/anthropic";

const RATE: Record<string, { in: number; out: number }> = {
  "claude-sonnet-4-6": { in: 3, out: 15 },
  "claude-haiku-4-5": { in: 1, out: 5 },
};

async function main() {
  usage.reset();
  const t0 = Date.now();
  const opeds = await compileOpEds();
  console.log(`\nCompiled ${opeds.length} op-eds in ${((Date.now() - t0) / 1000).toFixed(1)}s:`);
  for (const o of opeds) {
    console.log(`\n• ${o.title}`);
    console.log(`  author: ${JSON.stringify(o.author)} | outlet: ${o.outlet}`);
    console.log(`  thesis: ${o.thesis}`);
    console.log(`  summary: ${o.summary.slice(0, 180)}`);
    console.log(`  glossary: ${o.glossary.map((g) => g.term).join(", ") || "(none)"}`);
  }

  let cost = 0;
  for (const c of usage.calls) {
    const r = RATE[c.model] ?? { in: 3, out: 15 };
    cost += (c.input * r.in + c.output * r.out) / 1_000_000;
  }
  console.log(
    `\ncalls: ${usage.calls.map((c) => `${c.label}/${c.model}`).join(", ")}`,
  );
  console.log(`op-ed run cost: $${cost.toFixed(4)}  (~$${(cost * 30).toFixed(2)}/mo)`);
}

main().then(() => process.exit(0));
