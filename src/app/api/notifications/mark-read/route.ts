import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { markAllRead } from "@/lib/data/notifications";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await markAllRead(profile.id);
  return NextResponse.json({ ok: true });
}
