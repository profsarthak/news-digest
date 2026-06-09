import { neon } from "@neondatabase/serverless";
import type { Digest } from "./types";

// Neon Postgres backend (used in production when DATABASE_URL is set).
// One row per day: digests(date PK, payload JSONB, created_at).
// Lazily initialized so importing this module doesn't require DATABASE_URL
// (local dev uses the JSON backend and never calls these functions).
type Sql = ReturnType<typeof neon>;
let _sql: Sql | null = null;
function sql(): Sql {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}

let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql()`
        CREATE TABLE IF NOT EXISTS digests (
          date        DATE PRIMARY KEY,
          payload     JSONB NOT NULL,
          created_at  TIMESTAMPTZ DEFAULT now()
        )`;
    })();
  }
  return schemaReady;
}

export async function writeDigest(digest: Digest): Promise<void> {
  await ensureSchema();
  await sql()`
    INSERT INTO digests (date, payload)
    VALUES (${digest.date}, ${JSON.stringify(digest)}::jsonb)
    ON CONFLICT (date) DO UPDATE
      SET payload = EXCLUDED.payload, created_at = now()`;
}

export async function readDigest(date: string): Promise<Digest | null> {
  await ensureSchema();
  const rows = (await sql()`SELECT payload FROM digests WHERE date = ${date}`) as {
    payload: Digest;
  }[];
  return rows[0]?.payload ?? null;
}

export async function listDigestDates(): Promise<string[]> {
  await ensureSchema();
  const rows = (await sql()`
    SELECT to_char(date, 'YYYY-MM-DD') AS date FROM digests ORDER BY date DESC
  `) as { date: string }[];
  return rows.map((r) => r.date);
}
