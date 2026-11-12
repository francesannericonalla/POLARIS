"use client";

import { useState, useEffect, useRef, useId } from "react";
import { Search, FileText, Building2, GraduationCap, X } from "lucide-react";
import Link from "next/link";
import type { UnitSearchResult } from "@/lib/search-units";
import type { GlobalSearchResult } from "@/lib/data/documents";

type Scope = "all" | "offices" | "documents";
type Results = { units: UnitSearchResult[]; results: GlobalSearchResult[] };
const EMPTY: Results = { units: [], results: [] };
const PREVIEW_LIMIT = 4;

export function GlobalSearchBar() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Results>(EMPTY);
  const [scope, setScope] = useState<Scope>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  useEffect(() => {
    const controller = new AbortController();
    setData(EMPTY);
    setError(null);
    if (query.trim().length < 2) {
      setLoading(false);
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Search failed");
        const json: Results = await res.json();
        if (!controller.signal.aborted) setData(json);
      } catch {
        if (!controller.signal.aborted) setError("Search is unavailable. Please try typing again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function clear() {
    setQuery(""); setData(EMPTY); setScope("all");
    inputRef.current?.focus();
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { inputRef.current?.focus(); setOpen(false); return; }
    if (!open || !["ArrowDown", "ArrowUp"].includes(e.key)) return;
    const links = Array.from(containerRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-search-result]") ?? []);
    if (!links.length) return;
    e.preventDefault();
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    const direction = e.key === "ArrowDown" ? 1 : -1;
    const next = current < 0 ? (direction === 1 ? 0 : links.length - 1) : (current + direction + links.length) % links.length;
    links[next].focus();
  }

  const units = scope === "all" ? data.units.slice(0, PREVIEW_LIMIT) : data.units;
  const documents = scope === "all" ? data.results.slice(0, PREVIEW_LIMIT) : data.results;
  const showUnits = scope !== "documents" && units.length > 0;
  const showDocuments = scope !== "offices" && documents.length > 0;
  const tabs: { value: Scope; label: string; count: number }[] = [
    { value: "all", label: "All", count: data.units.length + data.results.length },
    { value: "offices", label: "Offices", count: data.units.length },
    { value: "documents", label: "Documents", count: data.results.length },
  ];
  const linkClass = "flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-[var(--ou-row-hover)] focus-visible:outline-none focus-visible:bg-[var(--ou-pill-bg)]";
  const sectionClass = "px-4 py-2 text-[11px] font-semibold uppercase tracking-wider";
  const headingStyle = { color: "var(--ou-heading)" };
  const mutedStyle = { color: "var(--ou-muted)" };
  const subtextStyle = { color: "var(--ou-subtext)" };
  const accentStyle = { color: "var(--ou-accent)" };
  const dividerStyle = { borderColor: "var(--ou-divider)" };

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all" style={{ background: "var(--ou-input-bg)", borderColor: open ? "var(--ou-accent)" : "var(--ou-input-border)" }}>
        <Search size={14} className="shrink-0" style={mutedStyle} />
        <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => query.trim().length >= 2 && setOpen(true)} placeholder="Search Polaris..." aria-label="Search offices, departments, and documents" aria-expanded={open} aria-controls={open ? panelId : undefined} autoComplete="off" className="flex-1 text-[13px] bg-transparent outline-none min-w-0 placeholder-[color:var(--ou-muted)]" style={headingStyle} />
        {loading && <span aria-label="Searching" className="shrink-0 w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--ou-card-border)", borderTopColor: "var(--ou-accent)" }} />}
        {query && <button type="button" onClick={clear} aria-label="Clear search" className="shrink-0 hover:opacity-70"><X size={13} style={mutedStyle} /></button>}
      </div>
      {open && (
        <div id={panelId} role="region" aria-label="Search results" className="absolute left-0 top-full mt-2 rounded-xl border shadow-xl z-50 overflow-hidden" style={{ width: "min(420px, calc(100vw - 32px))", background: "var(--ou-card-bg)", borderColor: "var(--ou-card-border)" }}>
          <div className="flex gap-1 p-2 border-b" style={dividerStyle}>
            {tabs.map((tab) => <button key={tab.value} type="button" onClick={() => setScope(tab.value)} aria-pressed={scope === tab.value} className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors" style={{ background: scope === tab.value ? "var(--ou-pill-bg)" : "transparent", color: scope === tab.value ? "var(--ou-accent)" : "var(--ou-subtext)" }}>{tab.label}{!loading && !error && <span className="ml-1 text-[10px] opacity-70">{tab.count}</span>}</button>)}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "min(460px, 55vh)" }} aria-busy={loading}>
            {loading ? <p role="status" className="px-4 py-6 text-sm" style={mutedStyle}>Searching offices and documents...</p>
              : error ? <p role="alert" className="px-4 py-6 text-sm text-red-500">{error}</p>
              : !showUnits && !showDocuments ? <p role="status" className="px-4 py-6 text-sm" style={mutedStyle}>No {scope === "all" ? "results" : scope === "offices" ? "offices or departments" : "documents"} found for &ldquo;{query}&rdquo;.</p>
              : <>
                {showUnits && <section aria-label="Offices and departments">
                  <h3 className={sectionClass} style={{ ...mutedStyle, background: "var(--ou-toggle-bg)" }}>Offices &amp; Departments</h3>
                  {units.map((unit) => {
                    const Icon = unit.type === "department" ? GraduationCap : Building2;
                    return <Link key={unit.id} data-search-result href={`/dashboard/office/${unit.id}`} onClick={clear} className={linkClass} style={dividerStyle}>
                      <Icon size={16} className="shrink-0 mt-0.5" style={accentStyle} />
                      <div className="min-w-0"><p className="text-[13px] font-semibold" style={headingStyle}>{unit.name}</p><p className="text-xs mt-0.5" style={subtextStyle}>{unit.context}</p></div>
                    </Link>;
                  })}
                  {scope === "all" && data.units.length > PREVIEW_LIMIT && <button type="button" onClick={() => setScope("offices")} className="px-4 py-2.5 text-xs font-semibold w-full text-left" style={accentStyle}>View all {data.units.length} offices &amp; departments</button>}
                </section>}
                {showDocuments && <section aria-label="Documents">
                  <h3 className={sectionClass} style={{ ...mutedStyle, background: "var(--ou-toggle-bg)" }}>Documents</h3>
                  {documents.map((doc) => <Link key={doc.id} data-search-result href={`/repository/${doc.unit_id}/${doc.folder_id}?sy=${encodeURIComponent(doc.school_year)}&sem=${encodeURIComponent(doc.semester)}`} onClick={clear} className={linkClass} style={dividerStyle}>
                    <FileText size={16} className="shrink-0 mt-0.5" style={accentStyle} />
                    <div className="min-w-0"><p className="text-[13px] font-semibold" style={headingStyle}>{doc.title}</p><p className="text-[11px] mt-0.5 break-words" style={subtextStyle}>{doc.file_name}</p><p className="text-xs mt-1" style={subtextStyle}>{doc.unit_name} &middot; {doc.folder_name}</p><p className="text-[11px] mt-0.5" style={mutedStyle}>SY {doc.school_year} &middot; {doc.semester === "N/A" ? "Full Year" : `${doc.semester} semester`}</p></div>
                  </Link>)}
                  {scope === "all" && data.results.length > PREVIEW_LIMIT && <button type="button" onClick={() => setScope("documents")} className="px-4 py-2.5 text-xs font-semibold w-full text-left" style={accentStyle}>View all document results</button>}
                  {scope === "documents" && data.results.length === 30 && <p className="px-4 py-2 text-xs" style={mutedStyle}>Showing the latest 30 matches. Refine your search to find more.</p>}
                </section>}
              </>}
          </div>
          <p className="px-4 py-2 text-[10px] border-t" style={{ ...mutedStyle, ...dividerStyle }}>Search by office, department, document title, or filename.</p>
        </div>
      )}
    </div>
  );
}
