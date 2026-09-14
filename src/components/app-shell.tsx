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
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar title={title} userName={profile.full_name} />
      <div className="flex flex-1 min-h-0">
        <Sidebar profile={profile} activeUnitId={activeUnitId} />
        <main className="flex-1 overflow-y-auto bg-[#F1F1F3]">{children}</main>
      </div>
    </div>
  );
}
