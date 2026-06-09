import { promises as fs } from "fs";
import path from "path";
import type { Digest } from "./types";

// Local-JSON storage for development: one file per day under .data/digests/.
// At deploy this is swapped for the Neon-backed implementation (lib/db.ts);
// callers go through lib/data.ts so they don't change.
const DIR = path.join(process.cwd(), ".data", "digests");

async function ensureDir() {
  await fs.mkdir(DIR, { recursive: true });
}

export async function writeDigest(digest: Digest): Promise<void> {
  await ensureDir();
  const file = path.join(DIR, `${digest.date}.json`);
  await fs.writeFile(file, JSON.stringify(digest, null, 2), "utf8");
}

export async function readDigest(date: string): Promise<Digest | null> {
  try {
    const raw = await fs.readFile(path.join(DIR, `${date}.json`), "utf8");
    return JSON.parse(raw) as Digest;
  } catch {
    return null;
  }
}

/** Stored digest dates, newest first. */
export async function listDigestDates(): Promise<string[]> {
  try {
    const files = await fs.readdir(DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}
