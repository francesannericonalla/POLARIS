import type { Profile } from "@/lib/auth";
import { Topbar } from "@/components/topbar";
import { OfficeUserSidebar } from "@/components/office-user-sidebar";
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
  // office_user: white sidebar with logo, nav, profile + theme toggle at bottom
  if (profile.role === "office_user" && profile.unit_id) {
    return (
      <div className="h-screen flex overflow-hidden ou-main" style={{ background: "var(--ou-bg)" }}>
        <OfficeUserSidebar
          unitId={profile.unit_id}
          unitName={profile.unit_name}
          userName={profile.full_name}
          idNumber={profile.id_number}
          activeHref={activeHref}
        />
        <main className="flex-1 overflow-y-auto" style={{ background: "var(--ou-bg)" }}>{children}</main>
      </div>
    );
  }

  // qao: sidebar + plain topbar (logo + profile only)
  return (
    <div className="h-screen flex flex-col overflow-hidden">
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
