import type { Profile } from "@/lib/auth";
import { Topbar } from "@/components/topbar";
import { Sidebar } from "@/components/sidebar";

export async function AppShell({
  profile,
  title,
  activeUnitId,
  children,
}: {
  profile: Profile;
  title: string;
  activeUnitId?: string;
  children: React.ReactNode;
}) {
  const navLinks: { label: string; href: string }[] =
    profile.role === "system_admin"
      ? [
          { label: "Account Approvals", href: "/admin/approvals" },
          { label: "All Accounts", href: "/admin/accounts" },
        ]
      : [
          { label: "Dashboard", href: "/dashboard" },
          ...(profile.unit_id ? [{ label: "Repository", href: `/repository/${profile.unit_id}` }] : []),
        ];

  const showSidebar = profile.role === "qao";

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar title={title} userName={profile.full_name} role={profile.role} idNumber={profile.id_number} unitName={profile.unit_name} navLinks={navLinks} />
      <div className="flex flex-1 min-h-0">
        {showSidebar && <Sidebar profile={profile} activeUnitId={activeUnitId} />}
        <main className="flex-1 overflow-y-auto bg-[#f0f2f5]">{children}</main>
      </div>
    </div>
  );
}
