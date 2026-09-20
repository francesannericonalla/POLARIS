import type { Profile } from "@/lib/auth";
import { Topbar } from "@/components/topbar";
import { OfficeUserTopbar } from "@/components/office-user-topbar";
import { Sidebar } from "@/components/sidebar";

export async function AppShell({
  profile,
  title,
  activeUnitId,
  activeHref,
  children,
}: {
  profile: Profile;
  title: string;
  activeUnitId?: string;
  activeHref?: string;
  children: React.ReactNode;
}) {
  // office_user: inline nav links in topbar, no sidebar
  // unit_id should always be set for approved office_users, but guard defensively.
  if (profile.role === "office_user" && profile.unit_id) {
    return (
      <div className="min-h-screen flex flex-col">
        <OfficeUserTopbar
          userName={profile.full_name}
          role={profile.role}
          idNumber={profile.id_number}
          unitName={profile.unit_name}
          unitId={profile.unit_id}
          activeHref={activeHref}
        />
        <main className="flex-1 overflow-y-auto bg-[#f0f2f5]">{children}</main>
      </div>
    );
  }

  // qao: sidebar + plain topbar (logo + profile only)
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar
        title={title}
        userName={profile.full_name}
        role={profile.role}
        idNumber={profile.id_number}
        unitName={profile.unit_name}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar profile={profile} activeUnitId={activeUnitId} />
        <main className="flex-1 overflow-y-auto bg-[#f0f2f5]">{children}</main>
      </div>
    </div>
  );
}
