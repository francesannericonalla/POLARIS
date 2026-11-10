import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSystemAdmin } from "@/lib/permissions";

export default async function ApprovalsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (!isSystemAdmin(profile)) redirect("/dashboard");

  redirect("/admin/accounts");
}
