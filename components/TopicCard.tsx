import Link from "next/link";
import type { Topic } from "@/lib/types";

type Props = {
  topic: Topic;
  date: string;
};

// A single topic preview. Brand Card: paper surface, square, 1.5px ink border,
// hard offset shadow; hover shifts the card into a deeper shadow.
export function TopicCard({ topic, date }: Props) {
  // Distinct outlet names (a topic often has several articles from one outlet).
  const outlets = [...new Set(topic.sources.map((s) => s.outlet))];

  return (
    <Link
      href={`/${date}/${topic.id}`}
      className="group block border-[1.5px] border-ink-900 bg-paper p-5 shadow-card transition duration-150 ease-out hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-lg"
    >
      <h2 className="font-display text-xl font-bold leading-[1.08] tracking-[-0.03em] text-ink-900">
        {topic.title}
      </h2>

      <p className="mt-3 line-clamp-3 font-body text-[15px] leading-relaxed text-ink-700">
        {topic.explainer}
      </p>

      <p className="mt-4 font-mono text-[11px] uppercase leading-none tracking-[0.06em] text-ink-500">
        {outlets.join(" · ")}
      </p>

      {topic.glossary.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topic.glossary.slice(0, 4).map((g) => (
            <span
              key={g.term}
              className="inline-flex items-center border-[1.5px] border-ink-900 px-[9px] py-[5px] font-mono text-[11px] uppercase leading-none tracking-[0.06em] text-ink-700"
            >
              {g.term}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 font-mono text-[11px] uppercase leading-none tracking-[0.06em] text-orange-600">
        Read &rarr;
      </div>
    </Link>
  );
}
