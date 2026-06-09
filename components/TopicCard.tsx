import Link from "next/link";
import type { Topic } from "@/lib/types";

type Props = {
  topic: Topic;
  date: string;
};

// A single topic preview on the Today view. Tapping anywhere opens the detail.
export function TopicCard({ topic, date }: Props) {
  const outlets = topic.sources.map((s) => s.outlet);
  return (
    <Link
      href={`/${date}/${topic.id}`}
      className="group block rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm transition hover:border-accent/30 hover:shadow-md dark:border-white/10 dark:bg-neutral-900"
    >
      <h2 className="font-mono text-base font-semibold leading-snug tracking-tight text-foreground transition group-hover:text-accent-strong">
        {topic.title}
      </h2>
      <p className="mt-2 line-clamp-3 font-serif text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
        {topic.explainer}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
        <span aria-hidden>📰</span>
        <span>{outlets.join(" · ")}</span>
      </div>

      {topic.glossary.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span aria-hidden className="text-neutral-400">
            🏷
          </span>
          {topic.glossary.slice(0, 4).map((g) => (
            <span
              key={g.term}
              className="rounded-full bg-honey-soft px-2 py-0.5 text-honey-strong dark:bg-amber-500/10 dark:text-amber-300"
            >
              {g.term}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 text-sm font-medium text-honey">
        Read &middot; context &amp; implications &rarr;
      </div>
    </Link>
  );
}
