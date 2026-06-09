import { notFound } from "next/navigation";
import { getTopic } from "@/lib/data";
import { TopicDetail } from "@/components/TopicDetail";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ date: string; id: string }>;
}) {
  const { date, id } = await params;
  const result = await getTopic(date, id);
  if (!result) notFound();
  return <TopicDetail topic={result.topic} digest={result.digest} />;
}
