"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, X } from "lucide-react";
import Link from "next/link";

type SearchResult = {
  id: string;
  title: string;
  file_name: string;
  school_year: string;
  semester: string;
  unit_id: string;
  folder_id: string;
  unit_name: string;
  folder_name: string;
};

export function GlobalSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white transition-all"
        style={{ borderColor: open ? "#7A1330" : "#e5e7eb" }}
      >
        <Search size={14} className="shrink-0" style={{ color: "#9ca3af" }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search documents..."
          className="flex-1 text-[13px] bg-transparent outline-none text-gray-700 placeholder-gray-400 min-w-0"
        />
        {query && (
          <button onClick={clear} className="shrink-0 hover:opacity-70 transition-opacity">
            <X size={13} style={{ color: "#9ca3af" }} />
          </button>
        )}
        {loading && (
          <span className="shrink-0 w-3.5 h-3.5 border-2 border-gray-200 border-t-[#7A1330] rounded-full animate-spin" />
        )}
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border bg-white shadow-lg z-50 overflow-hidden"
          style={{ borderColor: "#e8eaed", maxHeight: 360 }}
        >
          {results.length === 0 ? (
            <p className="px-4 py-5 text-center text-[13px]" style={{ color: "#9ca3af" }}>
              No documents found for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <>
              <p className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider border-b" style={{ color: "#9ca3af", borderColor: "#f1f5f9" }}>
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
                {results.map((r) => (
                  <Link
                    key={r.id}
                    href={`/repository/${r.unit_id}/${r.folder_id}`}
                    onClick={() => { setOpen(false); setQuery(""); }}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b last:border-0"
                    style={{ borderColor: "#f8f9fa" }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(122,19,48,0.07)" }}>
                      <FileText size={13} style={{ color: "#7A1330" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: "#1e293b" }}>{r.title}</p>
                      <p className="text-[11.5px] truncate mt-0.5" style={{ color: "#64748b" }}>
                        {r.unit_name} · {r.folder_name}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
                        SY {r.school_year} · {r.semester}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
