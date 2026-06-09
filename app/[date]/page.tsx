import { notFound } from "next/navigation";
import { getDigestByDate, listDates } from "@/lib/data";
import { TodayView } from "@/components/TodayView";

export default async function DatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const digest = await getDigestByDate(date);
  if (!digest) notFound();
  const dates = await listDates();
  return <TodayView digest={digest} dates={dates} />;
}
