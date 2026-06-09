import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, usage } from "./anthropic";
import type { FeedItem } from "./feeds";

export type ClusteredTopic = {
  title: string;
  items: FeedItem[];
};

const ClusterSchema = z.object({
  topics: z
    .array(
      z.object({
        title: z
          .string()
          .describe("A concise, neutral headline for the topic (max ~12 words)."),
        article_indexes: z
          .array(z.number().int())
          .describe("Indexes (from the provided list) of articles about this topic."),
      }),
    )
    .describe("The most significant topics of the day, most important first."),
});

const SYSTEM = `You are a news editor compiling a personal morning digest from Indian and international outlets.
You are given today's article headlines (and short blurbs where available) from several outlets.
Group articles that cover the SAME underlying event or story into a single topic — including when
different outlets cover it. Then select only the most significant topics worth reading this morning.

Rules:
- Prefer topics covered by multiple outlets, and genuinely important single-outlet stories.
- Aim for 6–10 topics. Do not force unrelated articles together.
- Ignore pure listicles, horoscopes, sports scores, and promotional content.
- Each article index should appear in at most one topic. Some articles may be left out.`;

/**
 * Ask Claude to group the day's feed items into the most significant topics.
 * Returns topics with their member FeedItems resolved from indexes.
 */
export async function clusterItems(items: FeedItem[]): Promise<ClusteredTopic[]> {
  if (items.length === 0) return [];

  const list = items
    .map((it, i) => {
      const blurb = it.blurb ? ` — ${it.blurb.slice(0, 200)}` : "";
      return `[${i}] (${it.outlet}) ${it.title}${blurb}`;
    })
    .join("\n");

  const response = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "low",
      format: zodOutputFormat(ClusterSchema),
    },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Here are today's articles:\n\n${list}\n\nGroup and select the top topics.`,
      },
    ],
  });

  usage.add("cluster", MODEL, response.usage);

  const parsed = response.parsed_output;
  if (!parsed) return [];

  return parsed.topics
    .map((t) => ({
      title: t.title,
      items: t.article_indexes
        .filter((i) => i >= 0 && i < items.length)
        .map((i) => items[i]),
    }))
    .filter((t) => t.items.length > 0);
}
