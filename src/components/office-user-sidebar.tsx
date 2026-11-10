import Link from "next/link";
import { LayoutDashboard, FolderOpen, LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth-actions";
import { NotificationBell } from "@/components/notification-bell";
import { getNotificationsForUser, getUnreadCount } from "@/lib/data/notifications";

export async function OfficeUserSidebar({
  userId,
  unitId,
  unitName,
  userName,
  idNumber,
  activeHref,
}: {
  userId: string;
  unitId: string;
  unitName?: string | null;
  userName: string;
  idNumber?: string | null;
  activeHref?: string;
}) {
  const [notifications, unread] = await Promise.all([
    getNotificationsForUser(userId).catch(() => []),
    getUnreadCount(userId).catch(() => 0),
  ]);
  const trimmed = (userName ?? "").trim();
  const words = trimmed ? trimmed.split(/\s+/) : ["?"];
  const initials =
    words.length === 1
      ? (words[0][0] ?? "?").toUpperCase()
      : ((words[0][0] ?? "") + (words[words.length - 1][0] ?? "")).toUpperCase() || "?";

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Repository", href: `/repository/${unitId}`, icon: FolderOpen },
  ];

  return (
    <nav
      className="w-[230px] shrink-0 h-full flex flex-col"
      style={{
        background: "var(--ou-sidebar-bg)",
        borderRight: "1px solid var(--ou-sidebar-border)",
      }}
    >
      {/* ── Logo + subtitle ── */}
      <div
        className="px-6 pt-7 pb-5"
        style={{ borderBottom: "1px solid var(--ou-sidebar-divider)" }}
      >
        <Link href="/dashboard" className="block mb-3">
          <img src="/POLARIS-logo.png" alt="POLARIS" className="h-14 w-auto dark:brightness-90" />
        </Link>
        <p className="text-[11px] font-medium leading-snug" style={{ color: "var(--ou-muted)" }}>
          QAO Compliance &amp; Document Repository
        </p>
      </div>

      {/* ── Nav links ── */}
      <div className="flex-1 px-3 pt-5 space-y-1 overflow-y-auto">
        {navLinks.map(({ label, href, icon: Icon }) => {
          const active = activeHref === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors w-full"
              style={
                active
                  ? { color: "var(--ou-accent)", background: "var(--ou-pill-bg)", fontWeight: 600 }
                  : { color: "var(--ou-sidebar-nav-inactive)" }
              }
            >
              <Icon
                size={17}
                className="shrink-0"
                style={{ color: active ? "var(--ou-accent)" : "var(--ou-sidebar-nav-icon)" }}
              />
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── User profile + actions at bottom ── */}
      <div
        className="px-4 pb-5 pt-4"
        style={{ borderTop: "1px solid var(--ou-sidebar-divider)" }}
      >
        <div className="flex items-center gap-3 mb-3 px-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
            style={{ background: "#79132F", color: "#fff" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px] font-semibold truncate leading-tight"
              style={{ color: "var(--ou-heading)" }}
            >
              {userName}
            </p>
            {idNumber && (
              <p className="text-[11px] leading-tight" style={{ color: "var(--ou-muted)" }}>
                ID {idNumber}
              </p>
            )}
            {unitName && !idNumber && (
              <p className="text-[11px] truncate leading-tight" style={{ color: "var(--ou-muted)" }}>
                {unitName}
              </p>
            )}
          </div>
          <NotificationBell initialNotifications={notifications} initialUnread={unread} />
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            style={{ color: "var(--ou-sidebar-nav-inactive)" }}
          >
            <LogOut size={15} className="shrink-0" />
            Log Out
          </button>
        </form>
      </div>
    </nav>
  );
}
