import Anthropic from "@anthropic-ai/sdk";

// Shared Claude client. Reads ANTHROPIC_API_KEY from the environment.
// Extra retries let the SDK ride out 429s (it honors Retry-After) so a brief
// rate-limit spike during the daily burst self-heals instead of failing.
export const anthropic = new Anthropic({ maxRetries: 6 });

// Models are env-configurable. Clustering + explainer use Sonnet; the
// web-search research step uses the cheaper Haiku.
// `||` (not `??`) so an empty-string env var from CI falls back to the default.
export const MODEL = process.env.DIGEST_MODEL || "claude-sonnet-4-6";
export const RESEARCH_MODEL = process.env.RESEARCH_MODEL || "claude-haiku-4-5";

// ---- Usage instrumentation ----------------------------------------------
// Accumulates token/search usage across a run so we can report exact cost.
export type CallUsage = {
  label: string;
  model: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  webSearches: number;
};

class UsageTracker {
  calls: CallUsage[] = [];
  reset() {
    this.calls = [];
  }
  add(label: string, model: string, u: Anthropic.Usage | undefined) {
    if (!u) return;
    this.calls.push({
      label,
      model,
      input: u.input_tokens ?? 0,
      output: u.output_tokens ?? 0,
      cacheRead: u.cache_read_input_tokens ?? 0,
      cacheWrite: u.cache_creation_input_tokens ?? 0,
      webSearches: u.server_tool_use?.web_search_requests ?? 0,
    });
  }
}

export const usage = new UsageTracker();

// Concatenate the text blocks of a Message into a single string.
export function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
