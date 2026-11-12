import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { searchDocumentsGlobal } from "@/lib/data/documents";
import { getAllUnits } from "@/lib/data/units";
import { searchUnits } from "@/lib/search-units";

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (profile.role === "system_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ results: [], units: [] });
  }

  try {
    const [results, allUnits] = await Promise.all([
      searchDocumentsGlobal(q, { role: profile.role, unitId: profile.unit_id ?? undefined }),
      getAllUnits(),
    ]);
    const accessibleUnits = profile.role === "qao"
      ? allUnits
      : allUnits.filter((unit) => unit.id === profile.unit_id || unit.type === "college");
    return NextResponse.json({ results, units: searchUnits(accessibleUnits, q) });
  } catch {
    return NextResponse.json({ error: "Search is unavailable. Please try again." }, { status: 500 });
  }
}
