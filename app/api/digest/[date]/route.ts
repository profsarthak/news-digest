import { NextResponse } from "next/server";
import { getDigestByDate } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  const digest = await getDigestByDate(date);
  if (!digest) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(digest);
}
