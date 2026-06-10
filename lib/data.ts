import type { Digest, OpEd, Topic } from "./types";
import { sampleDigest } from "./sample-digest";
import { listDigestDates, readDigest } from "./storage";

// Data-access seam for the read path. Uses stored (compiled) digests when any
// exist; otherwise falls back to the bundled sample so the UI is never empty.
// The storage backend (local JSON now, Neon later) lives behind lib/store.ts.

// Older stored digests predate the `opeds` field — default it so the read
// path and Opinion tab never see `undefined`.
function normalize(d: Digest | null): Digest | null {
  if (!d) return null;
  return { ...d, opeds: d.opeds ?? [] };
}

export async function listDates(): Promise<string[]> {
  const dates = await listDigestDates();
  return dates.length > 0 ? dates : [sampleDigest.date];
}

export async function getLatestDigest(): Promise<Digest | null> {
  const dates = await listDigestDates();
  if (dates.length === 0) return sampleDigest;
  return normalize(await readDigest(dates[0]));
}

export async function getDigestByDate(date: string): Promise<Digest | null> {
  const stored = normalize(await readDigest(date));
  if (stored) return stored;
  const dates = await listDigestDates();
  if (dates.length === 0 && date === sampleDigest.date) return sampleDigest;
  return null;
}

export async function getOpEds(date: string): Promise<OpEd[] | null> {
  const digest = await getDigestByDate(date);
  return digest ? digest.opeds : null;
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
