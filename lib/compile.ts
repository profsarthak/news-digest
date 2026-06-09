import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, usage } from "./anthropic";
import { fetchRecentItems, type FeedItem } from "./feeds";
import { clusterItems, type ClusteredTopic } from "./cluster";
import { research } from "./research";
import { extractArticle } from "./scrape";
import type { Digest, Source, Topic } from "./types";

const CoreSchema = z.object({
  explainer: z
    .string()
    .describe(
      "A plain-English explainer (3–6 sentences) compiling what happened across the outlets' coverage. Note where outlets differ in emphasis.",
    ),
  context: z
    .string()
    .describe(
      "2–4 sentences of background from the coverage — how we got here and why it matters now.",
    ),
  implications: z
    .string()
    .describe(
      "2–4 sentences on what this means, who is affected, and what could plausibly follow.",
    ),
  glossary: z
    .array(
      z.object({
        term: z.string(),
        definition: z
          .string()
          .describe("A simple, jargon-free one-sentence definition."),
      }),
    )
    .describe("Jargon or specialized terms a general reader may not know (0–6)."),
});

type Core = z.infer<typeof CoreSchema>;
const EMPTY_CORE: Core = { explainer: "", context: "", implications: "", glossary: [] };

const CORE_SYSTEM = `You are compiling one topic for a personal morning news digest, for a smart general reader.
Given the topic and the day's coverage (headlines, blurbs, and full article text where available),
write a clear, neutral explainer that synthesizes the coverage (not a list of separate summaries).
Also write "context" (background from the coverage) and "implications" (what it means and what could
follow). Then list any jargon or specialized terms that appear, each with a simple one-sentence
definition — only terms a general reader might not know. Keep everything plain and concrete.`;

async function compileCore(
  topicTitle: string,
  items: FeedItem[],
): Promise<Core> {
  // For non-paywalled outlets, fetch the full article text so the explainer is
  // grounded in the real reporting. Cap how many we scrape per topic to keep
  // prompt size (and token rate) bounded.
  let scrapeBudget = 3;
  const enriched = await Promise.all(
    items.map(async (it) => {
      let body = it.blurb;
      if (it.scrapeable && scrapeBudget > 0) {
        scrapeBudget--;
        const full = await extractArticle(it.url);
        if (full) body = full.slice(0, 2200);
      }
      return { it, body };
    }),
  );

  const coverage = enriched
    .map(({ it, body }) => {
      const detail = body ? `\n  ${body}` : "";
      return `- (${it.outlet}) ${it.title}${detail}`;
    })
    .join("\n");

  const response = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: { effort: "low", format: zodOutputFormat(CoreSchema) },
    system: CORE_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Topic: ${topicTitle}\n\nCoverage:\n${coverage}`,
      },
    ],
  });

  usage.add("core", MODEL, response.usage);
  return response.parsed_output ?? EMPTY_CORE;
}

// Run an async mapper over items with a fixed concurrency, preserving order.
// Keeps the per-minute token rate under the account's limit during the burst.
async function mapLimit<T, R>(
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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function sourcesOf(items: FeedItem[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const it of items) {
    if (seen.has(it.url)) continue;
    seen.add(it.url);
    out.push({ outlet: it.outlet, headline: it.title, url: it.url });
  }
  return out.slice(0, 8);
}

// Number of top topics that get the (paid) web-search research upgrade.
const TOP_RESEARCHED = Number(process.env.TOP_RESEARCHED) || 4;

// Compile a single clustered topic. Every topic gets an article-derived
// explainer/context/implications/glossary from the core call. The top topics
// additionally get web-search-backed context/implications that override the
// article-derived ones. Failures are contained so the digest still renders.
async function compileTopic(
  cluster: ClusteredTopic,
  id: string,
  withResearch: boolean,
): Promise<Topic> {
  const core = await compileCore(cluster.title, cluster.items);

  let context = core.context;
  let implications = core.implications;
  let researched = false;

  if (withResearch) {
    const r = await research(cluster.title, cluster.items);
    if (r && r.context.trim() && r.implications.trim()) {
      context = r.context;
      implications = r.implications;
      researched = true;
    }
  }

  return {
    id,
    title: cluster.title,
    explainer: core.explainer,
    context,
    implications,
    glossary: core.glossary,
    sources: sourcesOf(cluster.items),
    researched,
  };
}

/**
 * Full daily pipeline: fetch recent items, cluster into topics, then compile
 * every topic in parallel into the day's Digest.
 */
export async function compileDigest(date: string): Promise<Digest> {
  const items = await fetchRecentItems(24);
  const clusters = await clusterItems(items);

  // Assign unique ids up front so parallel compiles don't collide.
  const usedIds = new Set<string>();
  const withIds = clusters.map((c) => {
    let id = slugify(c.title) || "topic";
    let n = 2;
    while (usedIds.has(id)) id = `${slugify(c.title)}-${n++}`;
    usedIds.add(id);
    return { cluster: c, id };
  });

  // Limited concurrency (not all-at-once) to stay under the per-minute token
  // rate limit. Clusters are ordered most-important-first, so the first
  // TOP_RESEARCHED topics get the web-search upgrade.
  const topics = await mapLimit(withIds, 2, ({ cluster, id }, index) =>
    compileTopic(cluster, id, index < TOP_RESEARCHED),
  );

  return { date, topics };
}
