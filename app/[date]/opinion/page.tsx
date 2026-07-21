import { notFound } from "next/navigation";
import { getDigestByDate, listDates } from "@/lib/data";
import { DatePicker } from "@/components/DatePicker";
import { SectionTabs } from "@/components/SectionTabs";
import { OpEdCard } from "@/components/OpEdCard";

export const dynamic = "force-dynamic";

export default async function OpinionPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const digest = await getDigestByDate(date);
  if (!digest) notFound();
  const dates = await listDates();
  const opeds = digest.opeds;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:pt-10">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-[-0.045em] text-ink-900">
          News<span className="text-orange-600">Digest</span>
        </h1>
        <DatePicker current={digest.date} dates={dates} section="opinion" />
      </header>

      <SectionTabs date={digest.date} active="opinion" />

      <p className="mb-6 font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ink-500">
        {opeds.length} {opeds.length === 1 ? "op-ed" : "op-eds"} today
      </p>

      {opeds.length === 0 ? (
        <p className="font-body text-[15px] text-ink-500">
          No op-eds compiled for this day.
        </p>
      ) : (
        <div className="space-y-6">
          {opeds.map((o) => (
            <OpEdCard key={o.id} oped={o} />
          ))}
        </div>
      )}
    </main>
  );
}
