import type { Digest, Topic } from "./types";
import { sampleDigest } from "./sample-digest";
import { listDigestDates, readDigest } from "./storage";

// Data-access seam for the read path. Uses stored (compiled) digests when any
// exist; otherwise falls back to the bundled sample so the UI is never empty.
// The storage backend (local JSON now, Neon later) lives behind lib/store.ts.

export async function listDates(): Promise<string[]> {
  const dates = await listDigestDates();
  return dates.length > 0 ? dates : [sampleDigest.date];
}

export async function getLatestDigest(): Promise<Digest | null> {
  const dates = await listDigestDates();
  if (dates.length === 0) return sampleDigest;
  return readDigest(dates[0]);
}

export async function getDigestByDate(date: string): Promise<Digest | null> {
  const stored = await readDigest(date);
  if (stored) return stored;
  const dates = await listDigestDates();
  if (dates.length === 0 && date === sampleDigest.date) return sampleDigest;
  return null;
}

export async function getTopic(
  date: string,
  topicId: string,
): Promise<{ digest: Digest; topic: Topic } | null> {
  const digest = await getDigestByDate(date);
  if (!digest) return null;
  const topic = digest.topics.find((t) => t.id === topicId);
  return topic ? { digest, topic } : null;
}
