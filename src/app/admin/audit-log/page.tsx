import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSystemAdmin } from "@/lib/permissions";
import { getAuditLog, getAuditLogCount, labelForAction } from "@/lib/data/audit-log";
import { AdminNavbar } from "@/components/admin-navbar";
import { formatDate } from "@/lib/date-utils";

const PAGE_SIZE = 25;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (!isSystemAdmin(profile)) redirect("/dashboard");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [entries, total] = await Promise.all([
    getAuditLog(PAGE_SIZE, offset),
    getAuditLogCount(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    return `/admin/audit-log?page=${p}`;
  }

  const ACTION_COLOR: Record<string, string> = {
    upload_document: "bg-blue-50 text-blue-700 border-blue-200",
    upload_new_version: "bg-indigo-50 text-indigo-700 border-indigo-200",
    archive_document: "bg-orange-50 text-orange-700 border-orange-200",
    restore_document: "bg-green-50 text-green-700 border-green-200",
    approve_account: "bg-green-50 text-green-700 border-green-200",
    reject_account: "bg-red-50 text-red-600 border-red-200",
    suspend_account: "bg-red-50 text-red-600 border-red-200",
    reactivate_account: "bg-green-50 text-green-700 border-green-200",
    promote_to_admin: "bg-purple-50 text-purple-700 border-purple-200",
    revoke_admin: "bg-amber-50 text-amber-700 border-amber-200",
    upsert_deadline: "bg-amber-50 text-amber-700 border-amber-200",
    delete_deadline: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="min-h-screen flex h-screen overflow-hidden bg-[#f5f6f8]">
      <AdminNavbar
        userName={profile.full_name}
        role={profile.role}
        idNumber={profile.id_number}
        unitName={profile.unit_name}
      />

      <main className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 w-full">
        <div className="mb-7">
          <p className="text-[11px] font-bold uppercase tracking-widest text-maroon mb-1">System Administration</p>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
            Audit Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track all system actions — uploads, approvals, deadlines, and account changes.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Actor</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Action</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-400">
                    No audit log entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-b-0">
                    <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800 text-sm">{entry.actor_name ?? "System"}</p>
                      {entry.actor_email && (
                        <p className="text-xs text-gray-400">{entry.actor_email}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          ACTION_COLOR[entry.action] ?? "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {labelForAction(entry.action)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">
                      {entry.meta ? (
                        <span className="font-mono text-[11px] bg-gray-50 border border-gray-100 rounded px-2 py-0.5">
                          {Object.entries(entry.meta)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </span>
                      ) : (
                        entry.target_id ? (
                          <span className="font-mono text-[11px] text-gray-300">{entry.target_id.slice(0, 8)}…</span>
                        ) : "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {total > 0 && (
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-4">
              <span className="text-xs text-gray-400">
                Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total} entries
              </span>
              <div className="flex items-center gap-1">
                <a
                  href={page > 1 ? pageHref(page - 1) : "#"}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors ${page <= 1 ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </a>
                <span className="text-sm text-gray-600 font-medium px-2">
                  {page} / {totalPages}
                </span>
                <a
                  href={page < totalPages ? pageHref(page + 1) : "#"}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors ${page >= totalPages ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}
