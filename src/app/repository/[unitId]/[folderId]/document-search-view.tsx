"use client";

import { useState, useMemo } from "react";

function IconSearch() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconX() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Each entry carries the searchable text alongside its pre-rendered node.
export type SearchableDoc = {
  id: string;
  searchText: string; // title + filename concatenated for matching
  node: React.ReactNode;
};

export function DocumentSearchView({
  docs,
  total,
  emptyNode,
}: {
  docs: SearchableDoc[];
  total: number;
  emptyNode: React.ReactNode;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => d.searchText.toLowerCase().includes(q));
  }, [docs, search]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative max-w-sm">
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#A0A8B4" }}
        >
          <IconSearch />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full h-10 pl-10 pr-9 text-[13px] rounded-xl border focus:outline-none"
          style={{
            color: "#202938",
            borderColor: "#E2E5EC",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
            style={{ color: "#A0A8B4" }}
            aria-label="Clear search"
          >
            <IconX />
          </button>
        )}
      </div>

      {/* Document card */}
      <div
        className="rounded-2xl bg-white overflow-hidden"
        style={{ border: "1px solid #E8EAF0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
      >
        {filtered.length === 0 ? (
          search ? (
            <div className="p-14 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(134,17,47,0.07)" }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#86112F" strokeWidth={1.5}>
                  <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p className="text-[13.5px] font-semibold mb-1" style={{ color: "#202938" }}>No documents found</p>
              <p className="text-[12.5px]" style={{ color: "#788397" }}>
                No results for &ldquo;{search}&rdquo;. Try a different keyword.
              </p>
            </div>
          ) : (
            emptyNode
          )
        ) : (
          <div className="divide-y divide-[#F5F6F8]">
            {filtered.map((d) => d.node)}
          </div>
        )}
      </div>

      {/* Result count when actively searching */}
      {search && filtered.length > 0 && (
        <p className="text-[12px] text-center" style={{ color: "#C4C9D4" }}>
          {filtered.length} of {total} document{total !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
