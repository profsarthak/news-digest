import { NextResponse } from "next/server";
import { compileDigest } from "@/lib/compile";
import { writeDigest } from "@/lib/storage";

// RSS fetching + fs writes need the Node runtime (not edge). Allow a long
// duration for the parallel compile (Hobby caps at 60s; Pro/fluid honor this).
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true; // manual trigger
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Today's date in IST (the digest is keyed by the Indian calendar day).
function istDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const date = istDate();
  try {
    const digest = await compileDigest(date);
    await writeDigest(digest);
    return NextResponse.json({
      ok: true,
      date,
      topics: digest.topics.length,
      titles: digest.topics.map((t) => t.title),
    });
  } catch (err) {
    console.error("[compile] failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
