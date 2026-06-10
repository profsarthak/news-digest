import type { Digest } from "@/lib/types";
import { TopicCard } from "./TopicCard";
import { DatePicker } from "./DatePicker";
import { SectionTabs } from "./SectionTabs";

type Props = {
  digest: Digest;
  dates: string[];
};

// The morning reading view: header + a scrolling stack of topic cards.
export function TodayView({ digest, dates }: Props) {
  const count = digest.topics.length;
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:pt-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            News<span className="text-honey">Digest</span>
          </h1>
        </div>
        <DatePicker current={digest.date} dates={dates} />
      </header>

      <SectionTabs date={digest.date} active="news" />

      <p className="mb-6 text-[15px] text-neutral-500 dark:text-neutral-400">
        ☕ {count} {count === 1 ? "topic" : "topics"} this morning
      </p>

      <div className="space-y-4">
        {digest.topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} date={digest.date} />
        ))}
      </div>
    </main>
  );
}
