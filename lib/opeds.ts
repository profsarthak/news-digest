import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, OPED_MODEL, usage } from "./anthropic";
import { fetchOpinionItems, type FeedItem } from "./feeds";
import { extractArticle } from "./scrape";
import { mapLimit, uniqueSlug } from "./util";
import type { OpEd } from "./types";

const OPED_COUNT = Number(process.env.OPED_COUNT) || 4;
const INDIA_OUTLET = "Indian Express";

// ---- Selection (Sonnet) --------------------------------------------------

const SelectSchema = z.object({
  picks: z
    .array(z.number().int())
    .describe("Indexes of the chosen op-eds, most significant first."),
  india_pick: z
    .number()
    .int()
    .describe(
      "Index of the single best India-focused opinion column (ideally from Indian Express), so the digest always includes Indian coverage; -1 if none is suitable.",
    ),
});

const SELECT_SYSTEM = `You curate op-eds for a personal morning digest. From the opinion-section
headlines provided, choose the ${OPED_COUNT} most substantive and distinct argument/analysis pieces
("picks"), most significant first. Prefer genuine columns with a clear viewpoint. EXCLUDE archival
reprints ("N years ago…"), straight news reports, listicles, obituaries, letters, and near-duplicates.

Separately set "india_pick" to the index of the single best India-focused opinion column (ideally
from Indian Express) — the digest must always include Indian coverage. Use -1 only if nothing
suitable exists.`;

async function selectOpEds(items: FeedItem[]): Promise<FeedItem[]> {
  if (items.length === 0) return [];
  const list = items
    .map((it, i) => {
      const blurb = it.blurb ? ` — ${it.blurb.slice(0, 160)}` : "";
      return `[${i}] (${it.outlet}) ${it.title}${blurb}`;
    })
    .join("\n");

  const res = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 2000,
    thinking: { type: "adaptive" },
    output_config: { effort: "low", format: zodOutputFormat(SelectSchema) },
    system: SELECT_SYSTEM,
    messages: [{ role: "user", content: `Opinion pieces:\n\n${list}` }],
  });
  usage.add("oped-select", MODEL, res.usage);

  const out = res.parsed_output;
  const valid = (i: number) => Number.isInteger(i) && i >= 0 && i < items.length;

  // Merit picks, de-duped and capped.
  const seen = new Set<number>();
  const chosen: number[] = [];
  for (const i of out?.picks ?? []) {
    if (valid(i) && !seen.has(i)) {
      seen.add(i);
      chosen.push(i);
    }
    if (chosen.length >= OPED_COUNT) break;
  }

  // Guarantee at least one Indian Express op-ed (deterministic, not just the
  // prompt). Prefer the model's india_pick when it's Indian Express; otherwise
  // fall back to the most recent Indian Express item.
  const hasIndia = chosen.some((i) => items[i].outlet === INDIA_OUTLET);
  if (!hasIndia) {
    const ip = out?.india_pick ?? -1;
    let inject =
      valid(ip) && items[ip].outlet === INDIA_OUTLET
        ? ip
        : items.findIndex((it) => it.outlet === INDIA_OUTLET);
    if (inject >= 0 && !seen.has(inject)) {
      if (chosen.length >= OPED_COUNT) chosen[chosen.length - 1] = inject; // swap weakest
      else chosen.push(inject);
    }
  }

  return chosen.slice(0, OPED_COUNT).map((i) => items[i]);
}

// ---- Summarise one op-ed (Haiku) -----------------------------------------

const OpEdSchema = z.object({
  author: z
    .string()
    .describe("The op-ed's author/byline if present in the text, else an empty string."),
  summary: z
    .string()
    .describe("A NEUTRAL 2–4 sentence summary of the argument (do not endorse it)."),
  thesis: z
    .string()
    .describe("One line: the core thesis / which way the piece leans."),
  glossary: z
    .array(z.object({ term: z.string(), definition: z.string() }))
    .describe("Jargon terms a general reader may not know (0–4)."),
});

const OPED_SYSTEM = `You summarise one op-ed for a personal digest reader. Given the piece (full text
where available, otherwise just the headline), write a NEUTRAL summary of the argument (don't take a
side), a one-line thesis capturing its core claim and which way it leans, and a short glossary of any
jargon. If a byline/author is present in the text, return it; otherwise return an empty string.`;

async function compileOpEd(item: FeedItem, id: string): Promise<OpEd> {
  const base: OpEd = {
    id,
    title: item.title,
    author: item.author ?? "",
    outlet: item.outlet,
    summary: item.blurb,
    thesis: "",
    glossary: [],
    url: item.url,
  };
  try {
    let body = item.blurb;
    if (item.scrapeable) {
      const full = await extractArticle(item.url);
      if (full) body = full.slice(0, 3000);
    }
    const res = await anthropic.messages.parse({
      model: OPED_MODEL,
      max_tokens: 2000,
      output_config: { format: zodOutputFormat(OpEdSchema) },
      system: OPED_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Outlet: ${item.outlet}\nTitle: ${item.title}\n\n${body}`,
        },
      ],
    });
    usage.add("oped", OPED_MODEL, res.usage);
    const out = res.parsed_output;
    if (!out) return base;
    return {
      ...base,
      author: (out.author?.trim() || item.author || "").trim(),
      summary: out.summary || item.blurb,
      thesis: out.thesis ?? "",
      glossary: out.glossary ?? [],
    };
  } catch (err) {
    console.error(`[opeds] failed for "${item.title}":`, err);
    return base;
  }
}

/**
 * Curate and summarise the day's op-eds. Resilient: any failure yields an empty
 * list (or a minimal fallback per op-ed) so it never sinks the news digest.
 */
export async function compileOpEds(): Promise<OpEd[]> {
  try {
    const items = await fetchOpinionItems(48);
    const picked = await selectOpEds(items);
    const used = new Set<string>();
    const withIds = picked.map((it) => ({ it, id: uniqueSlug(it.title, used) }));
    return mapLimit(withIds, 2, ({ it, id }) => compileOpEd(it, id));
  } catch (err) {
    console.error("[opeds] compile failed:", err);
    return [];
  }
}
