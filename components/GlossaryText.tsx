import type { GlossaryEntry } from "@/lib/types";
import { GlossaryTerm } from "./GlossaryTerm";

type Props = {
  text: string;
  glossary: GlossaryEntry[];
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Renders text with glossary terms highlighted as tappable GlossaryTerm
// popovers. Each distinct term is highlighted on its first occurrence only,
// to avoid a wall of underlines.
export function GlossaryText({ text: rawText, glossary }: Props) {
  // Defensive: strip any stray HTML/citation tags (e.g. the web_search tool's
  // <cite index="...">…</cite>) so they never render as literal text.
  const text = rawText.replace(/<\/?[a-zA-Z][^>]*>/g, "").replace(/\s{2,}/g, " ");

  if (glossary.length === 0) return <>{text}</>;

  // Longest terms first so multi-word terms win over their substrings.
  const sorted = [...glossary].sort((a, b) => b.term.length - a.term.length);
  const pattern = new RegExp(
    `\\b(${sorted.map((g) => escapeRegExp(g.term)).join("|")})\\b`,
    "gi",
  );

  const used = new Set<string>();
  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const matched = match[0];
    const idx = match.index ?? 0;
    const entry = glossary.find(
      (g) => g.term.toLowerCase() === matched.toLowerCase(),
    );
    const lower = matched.toLowerCase();

    if (!entry || used.has(lower)) continue; // only first occurrence

    used.add(lower);
    if (idx > lastIndex) out.push(text.slice(lastIndex, idx));
    out.push(
      <GlossaryTerm key={key++} term={matched} definition={entry.definition} />,
    );
    lastIndex = idx + matched.length;
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex));

  return <>{out}</>;
}
