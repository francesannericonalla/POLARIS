import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSystemAdmin } from "@/lib/permissions";
import { getAllProfiles, getProfilesByStatus } from "@/lib/data/profiles";
import { AdminNavbar } from "@/components/admin-navbar";
import { AccountManagementClient } from "@/components/account-management-client";

export default async function AccountsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (!isSystemAdmin(profile)) redirect("/dashboard");

  const [allProfiles, pendingProfiles] = await Promise.all([
    getAllProfiles(),
    getProfilesByStatus("pending"),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6f8]">
      <AdminNavbar
        userName={profile.full_name}
        role={profile.role}
        idNumber={profile.id_number}
        unitName={profile.unit_name}
      />
      <AccountManagementClient
        allProfiles={allProfiles}
        pendingProfiles={pendingProfiles}
        currentUserId={profile.id}
      />
    </div>
  );
}
