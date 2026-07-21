import type { Digest } from "@/lib/types";
import { TopicCard } from "./TopicCard";
import { DatePicker } from "./DatePicker";
import { SectionTabs } from "./SectionTabs";

type Props = {
  digest: Digest;
  dates: string[];
};

// The morning reading view: wordmark, section tabs, and a stack of topic cards.
export function TodayView({ digest, dates }: Props) {
  const count = digest.topics.length;
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:pt-10">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-[-0.045em] text-ink-900">
          News<span className="text-orange-600">Digest</span>
        </h1>
        <DatePicker current={digest.date} dates={dates} />
      </header>

      <SectionTabs date={digest.date} active="news" />

      <p className="mb-6 font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ink-500">
        {count} {count === 1 ? "topic" : "topics"} this morning
      </p>

      <div className="space-y-6">
        {digest.topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} date={digest.date} />
        ))}
      </div>
    </main>
  );
}
