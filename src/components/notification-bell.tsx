"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Bell, FileText, UserCheck, UserX, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  meta: Record<string, string> | null;
};

type Props = {
  initialNotifications: Notification[];
  initialUnread: number;
};

function timeAgo(dateStr: string) {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === "account_approved") return <UserCheck size={14} style={{ color: "#15803d" }} />;
  if (type === "account_rejected") return <UserX size={14} style={{ color: "#dc2626" }} />;
  if (type === "deadline_set") return <CalendarDays size={14} style={{ color: "#d97706" }} />;
  return <FileText size={14} style={{ color: "#7A1330" }} />;
}

function iconBg(type: string) {
  if (type === "account_approved") return "rgba(21,128,61,0.1)";
  if (type === "account_rejected") return "rgba(220,38,38,0.08)";
  if (type === "deadline_set") return "rgba(217,119,6,0.08)";
  return "rgba(122,19,48,0.07)";
}

function notifHref(n: Notification): string | null {
  if (n.type === "account_approved" || n.type === "account_rejected" || n.type === "deadline_set") return "/dashboard";
  if (n.type === "document_uploaded" && n.meta?.unit_id && n.meta?.folder_id)
    return `/repository/${n.meta.unit_id}/${n.meta.folder_id}`;
  if (n.type === "document_uploaded" && n.meta?.unit_id)
    return `/repository/${n.meta.unit_id}`;
  return null;
}

export function NotificationBell({ initialNotifications, initialUnread }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopupStyle({
        position: "fixed",
        bottom: window.innerHeight - rect.top + 8,
        left: Math.max(8, rect.left - 280 + rect.width),
        width: 320,
        zIndex: 9999,
      });
    }
    setOpen((o) => !o);
    if (!open && unread > 0) {
      startTransition(async () => {
        await fetch("/api/notifications/mark-read", { method: "POST" });
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnread(0);
      });
    }
  }

  function handleDismiss(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    fetch("/api/notifications/dismiss", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  }

  function handleClearAll() {
    setNotifications([]);
    setUnread(0);
    fetch("/api/notifications/clear", { method: "POST" });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="relative flex items-center justify-center w-8 h-8 rounded-xl transition-colors hover:bg-[var(--ou-toggle-bg)]"
        title="Notifications"
      >
        <Bell size={16} className="text-slate-500 dark:text-slate-400" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
            style={{ background: "#7A1330" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            ...popupStyle,
            background: "var(--ou-card-bg)",
            borderColor: "var(--ou-card-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--ou-divider)" }}
          >
            <span className="text-[13px] font-bold" style={{ color: "var(--ou-heading)" }}>Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] font-semibold hover:underline"
                style={{ color: "var(--ou-accent)" }}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px]" style={{ color: "var(--ou-muted)" }}>No notifications yet.</p>
            ) : (
              notifications.map((n) => {
                const href = notifHref(n);
                return (
                <div
                  key={n.id}
                  onClick={() => { if (href) { setOpen(false); router.push(href); } }}
                  className="flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors"
                  style={{
                    borderColor: "var(--ou-divider)",
                    background: n.read ? "transparent" : "var(--ou-pill-bg)",
                    cursor: href ? "pointer" : "default",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: iconBg(n.type) }}
                  >
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold" style={{ color: "var(--ou-heading)" }}>{n.title}</p>
                    <p className="text-[12px] mt-0.5 leading-snug" style={{ color: "var(--ou-subtext)" }}>{n.body}</p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--ou-muted)" }}>{timeAgo(n.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full" style={{ background: "var(--ou-accent)" }} />
                    )}
                    <button
                      onClick={(e) => handleDismiss(e, n.id)}
                      className="transition-colors leading-none"
                      style={{ color: "var(--ou-muted)" }}
                      title="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
