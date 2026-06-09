// Storage backend selector: Neon Postgres in production (DATABASE_URL set),
// local JSON files in development. Callers import from here, not the backends.
import type { Digest } from "./types";
import * as local from "./store";
import * as db from "./db";

const useDb = Boolean(process.env.DATABASE_URL);
const backend = useDb ? db : local;

export function writeDigest(digest: Digest): Promise<void> {
  return backend.writeDigest(digest);
}

export function readDigest(date: string): Promise<Digest | null> {
  return backend.readDigest(date);
}

export function listDigestDates(): Promise<string[]> {
  return backend.listDigestDates();
}
