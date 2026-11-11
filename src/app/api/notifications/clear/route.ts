import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { deleteAllReadNotifications } from "@/lib/data/notifications";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteAllReadNotifications(profile.id);
  return NextResponse.json({ ok: true });
}
