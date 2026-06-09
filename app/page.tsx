import { notFound } from "next/navigation";
import { getLatestDigest, listDates } from "@/lib/data";
import { TodayView } from "@/components/TodayView";

// Re-read the latest digest on every request (it changes daily).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const digest = await getLatestDigest();
  if (!digest) notFound();
  const dates = await listDates();
  return <TodayView digest={digest} dates={dates} />;
}
