import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { anthropic, RESEARCH_MODEL, textOf, usage } from "./anthropic";
import type { FeedItem } from "./feeds";

export type Research = {
  context: string;
  implications: string;
};

const ResearchSchema = z.object({
  context: z.string(),
  implications: z.string(),
});

// Cap searches per topic to keep cost bounded (web search is the main driver).
const MAX_SEARCHES = 2;

const SYSTEM = `You are a news analyst writing the "context" and "implications" for one topic in a
personal morning digest, aimed at a smart general reader.

Use the web_search tool (sparingly — at most ${MAX_SEARCHES} searches) to ground your answer in
recent developments and prior coverage.

Write:
- "context": 2–4 sentences of background — how we got here, key prior events, why it matters now.
- "implications": 2–4 sentences on what this means, who is affected, and what could plausibly follow.

Be concrete and neutral. No citations or URLs in the prose.

Respond with ONLY a JSON object: {"context": "...", "implications": "..."}
No markdown, no code fences, no extra text.`;

function parseResearch(text: string): Research | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      const obj = JSON.parse(text.slice(start, end + 1));
      const ok = ResearchSchema.safeParse(obj);
      if (ok.success) {
        return {
          context: clean(ok.data.context),
          implications: clean(ok.data.implications),
        };
      }
    } catch {
      /* fall through */
    }
  }
  return null;
}

// The web_search tool wraps cited claims in <cite index="...">...</cite> tags.
// Strip those (and any stray HTML tags) so they don't render as literal text.
function clean(s: string): string {
  return s
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Web-search-backed context + implications for a topic, using the cheaper
 * research model with a capped number of searches. Returns null on failure so
 * the caller can fall back to the article-derived context/implications.
 */
export async function research(
  topicTitle: string,
  items: FeedItem[],
): Promise<Research | null> {
  const headlines = items.map((it) => `- (${it.outlet}) ${it.title}`).join("\n");
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Topic: ${topicTitle}\n\nToday's coverage:\n${headlines}\n\nResearch and return the JSON.`,
    },
  ];

  try {
    for (let i = 0; i < 4; i++) {
      const response = await anthropic.messages.create({
        model: RESEARCH_MODEL,
        max_tokens: 3000,
        tools: [
          {
            type: "web_search_20260209",
            name: "web_search",
            max_uses: MAX_SEARCHES,
            // Haiku supports web search as a direct tool call (not via
            // programmatic/code-execution calling).
            allowed_callers: ["direct"],
          },
        ],
        system: SYSTEM,
        messages,
      });
      usage.add("research", RESEARCH_MODEL, response.usage);

      if (response.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: response.content });
        continue;
      }
      return parseResearch(textOf(response));
    }
    return null;
  } catch (err) {
    console.error(`[research] failed for "${topicTitle}":`, err);
    return null;
  }
}
