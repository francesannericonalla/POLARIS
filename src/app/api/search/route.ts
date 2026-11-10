import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { searchDocumentsGlobal } from "@/lib/data/documents";

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchDocumentsGlobal(q, { role: profile.role, unitId: profile.unit_id ?? undefined });
  return NextResponse.json({ results });
}
