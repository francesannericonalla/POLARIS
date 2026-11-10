"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  approveAccount,
  rejectAccount,
  suspendAccount,
  reactivateAccount,
  promoteToAdmin,
  revokeAdmin,
} from "@/lib/actions/approval-actions";
import type { ProfileRow } from "@/lib/data/profiles";

const ROLE_LABEL: Record<string, string> = {
  qao: "QAO",
  office_user: "Office User",
  system_admin: "System Admin",
};

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_DOT: Record<string, string> = {
  approved: "bg-green-500",
  pending: "bg-amber-500",
  rejected: "bg-red-500",
};

const ITEMS_PER_PAGE = 6;

function ActionsMenu({
  profileId,
  status,
  role,
  isSelf,
}: {
  profileId: string;
  status: string;
  role: string;
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = role === "system_admin";
  const isSuspended = status === "rejected";
  const isPending = status === "pending";

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        aria-label="Actions"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
          {/* Approve pending accounts */}
          {isPending && (
            <form action={approveAccount.bind(null, profileId)}>
              <button
                type="submit"
                onClick={() => setOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
            </form>
          )}

          {/* Promote / Revoke Admin — not for self, not for pending */}
          {!isSelf && !isPending && !isAdmin && (
            <form action={promoteToAdmin.bind(null, profileId)}>
              <button
                type="submit"
                onClick={() => setOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-maroon hover:bg-maroon/5 transition-colors flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Promote to Admin
              </button>
            </form>
          )}
          {!isSelf && !isPending && isAdmin && (
            <form action={revokeAdmin.bind(null, profileId)}>
              <button
                type="submit"
                onClick={() => setOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Revoke Admin
              </button>
            </form>
          )}

          {/* Suspend / Reactivate — not for self, not for pending */}
          {!isSelf && !isPending && (
            <>
              {!isSelf && (isAdmin || status === "approved") && (
                <div className="mx-3 my-1 border-t border-gray-100" />
              )}
              {!isSuspended ? (
                <form action={suspendAccount.bind(null, profileId)}>
                  <button
                    type="submit"
                    onClick={() => setOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Suspend
                  </button>
                </form>
              ) : (
                <form action={reactivateAccount.bind(null, profileId)}>
                  <button
                    type="submit"
                    onClick={() => setOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2.5"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reactivate
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function AccountManagementClient({
  allProfiles,
  pendingProfiles,
  currentUserId,
  defaultTab = "accounts",
}: {
  allProfiles: ProfileRow[];
  pendingProfiles: ProfileRow[];
  currentUserId: string;
  defaultTab?: "accounts" | "requests";
}) {
  const [tab, setTab] = useState<"accounts" | "requests">(defaultTab);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allProfiles.filter((p) => {
      const matchesSearch =
        !q ||
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.unit_name ?? "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || p.role === roleFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allProfiles, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function handleFilterChange() {
    setPage(1);
  }

  function exportCSV() {
    const rows = [
      ["Name", "Email", "Unit", "Role", "Status"],
      ...filtered.map((p) => [
        p.full_name,
        p.email,
        p.unit_name ?? "",
        ROLE_LABEL[p.role] ?? p.role,
        p.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accounts.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-[#f5f6f8]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-7">
          <p className="text-[11px] font-bold uppercase tracking-widest text-maroon mb-1">
            System Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
            Account Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage user accounts and review new account requests.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6">
          <button
            onClick={() => setTab("accounts")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "accounts"
                ? "bg-maroon text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Accounts
          </button>
          <button
            onClick={() => setTab("requests")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              tab === "requests"
                ? "bg-maroon text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Account Requests
            {pendingProfiles.length > 0 && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  tab === "requests"
                    ? "bg-white/20 text-white"
                    : "bg-maroon text-white"
                }`}
              >
                {pendingProfiles.length}
              </span>
            )}
          </button>
        </div>


        {/* ALL ACCOUNTS TAB */}
        {tab === "accounts" && (
          <>
            {/* Search + filters toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or unit..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/40 transition-colors"
                />
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium hidden sm:inline">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); handleFilterChange(); }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/40 transition-colors text-gray-700"
                >
                  <option value="all">All Roles</option>
                  <option value="qao">QAO</option>
                  <option value="office_user">Office User</option>
                  <option value="system_admin">System Admin</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium hidden sm:inline">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); handleFilterChange(); }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/40 transition-colors text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Export */}
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-maroon text-white text-sm font-semibold rounded-lg hover:bg-maroon-dark transition-colors shadow-sm shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>

            {/* Account Table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Email</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden md:table-cell">Unit</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Role</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                        No accounts match your search or filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-b-0">
                        <td className="px-5 py-3.5 font-semibold text-gray-800">{p.full_name}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">{p.email}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs hidden md:table-cell">{p.unit_name ?? "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md font-medium">
                            {ROLE_LABEL[p.role] ?? p.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[p.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[p.status]}`} />
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <ActionsMenu profileId={p.id} status={p.status} role={p.role} isSelf={p.id === currentUserId} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {filtered.length > 0 && (
                <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400">
                    Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} account{filtered.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          n === currentPage
                            ? "bg-maroon text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ACCOUNT REQUESTS TAB */}
        {tab === "requests" && (
          <>
            {pendingProfiles.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-14 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No pending account requests</p>
                <p className="text-xs text-gray-400">New signups will appear here for your review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProfiles.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-4"
                    style={{ borderLeft: "3px solid #B8892B" }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 text-sm">{p.full_name}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md font-medium">
                          {ROLE_LABEL[p.role] ?? p.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{p.email}</p>
                      {p.unit_name && (
                        <p className="text-xs text-maroon font-medium mt-1">{p.unit_name}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <form action={approveAccount.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-semibold bg-maroon text-white rounded-lg hover:bg-maroon-dark transition-colors shadow-sm"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={rejectAccount.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
