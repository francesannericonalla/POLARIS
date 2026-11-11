"use client";

import { useState, useTransition } from "react";
import { DownloadButton } from "@/components/download-button";
import { ArchiveButton } from "@/components/archive-button";
import { UploadModal } from "@/components/upload-modal";
import { DocumentPreviewButton } from "@/components/document-preview-button";
import { bulkArchiveDocuments, bulkRestoreDocuments, getSignedDownloadUrl, fetchVersionHistoriesForDoc } from "@/lib/actions/document-actions";
import { formatDate } from "@/lib/date-utils";
import type { DocumentRow } from "@/lib/data/documents";

function VersionPill({ version }: { version: number }) {
  if (version === 1) {
    return (
      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ color: "var(--ou-muted)", background: "var(--ou-toggle-bg)", border: "1px solid var(--ou-card-border)" }}>
        v1
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium text-maroon bg-maroon/[0.06] border border-maroon/15 px-1.5 py-0.5 rounded">
      v{version} · Updated
    </span>
  );
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf") {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M10 3v18M3 3h18v18H3z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function VersionHistoryTable({ docId, version }: { docId: string; version: number }) {
  const [history, setHistory] = useState<DocumentRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    const details = e.currentTarget;
    if (details.open && history === null && !loading) {
      setLoading(true);
      const rows = await fetchVersionHistoriesForDoc(docId);
      setHistory(rows);
      setLoading(false);
    }
  }

  return (
    <details className="mt-3 group" style={{ marginLeft: "52px" }} onToggle={handleToggle}>
      <summary className="text-xs text-maroon cursor-pointer select-none inline-flex items-center gap-1.5 hover:text-maroon-dark transition-colors list-none">
        <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
        {version - 1} previous version{version - 1 !== 1 ? "s" : ""}
      </summary>
      {loading && <p className="mt-2 text-xs ml-1" style={{ color: "var(--ou-muted)" }}>Loading…</p>}
      {history && history.length > 0 && (
        <div className="mt-2 rounded-xl overflow-hidden" style={{ border: "1px solid var(--ou-card-border)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "var(--ou-toggle-bg)", borderBottom: "1px solid var(--ou-divider)" }}>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-[10px]" style={{ color: "var(--ou-muted)" }}>Version</th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-[10px]" style={{ color: "var(--ou-muted)" }}>Uploaded by</th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-[10px]" style={{ color: "var(--ou-muted)" }}>Date</th>
                <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-[10px]" style={{ color: "var(--ou-muted)" }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {history.map((v, i) => (
                <tr key={v.id} style={{ borderBottom: i < history.length - 1 ? "1px solid var(--ou-divider)" : undefined, background: i === 0 ? "var(--ou-pill-bg)" : "transparent" }}>
                  <td className="px-3 py-2">
                    <span className="font-semibold" style={{ color: i === 0 ? "var(--ou-accent)" : "var(--ou-subtext)" }}>
                      v{v.version}
                      {i === 0 && <span className="ml-1 text-[10px] font-normal" style={{ color: "var(--ou-muted)" }}>(current)</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2" style={{ color: "var(--ou-subtext)" }}>{v.uploader_name ?? "—"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--ou-muted)" }}>{formatDate(v.created_at)}</td>
                  <td className="px-3 py-2 text-right">
                    <DownloadButton storagePath={v.storage_path} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
}

type Props = {
  documents: DocumentRow[];
  folderId: string;
  schoolYears: string[];
  canUpload: boolean;
  isArchived: boolean;
};

export function BulkDocumentList({
  documents,
  folderId,
  schoolYears,
  canUpload,
  isArchived,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [bulkError, setBulkError] = useState<string | null>(null);

  const allSelected = documents.length > 0 && selected.size === documents.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(documents.map((d) => d.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkArchive() {
    setBulkError(null);
    startTransition(async () => {
      try {
        if (isArchived) {
          await bulkRestoreDocuments([...selected]);
        } else {
          await bulkArchiveDocuments([...selected]);
        }
        setSelected(new Set());
      } catch (e) {
        setBulkError(e instanceof Error ? e.message : "Action failed.");
      }
    });
  }

  async function handleBulkDownload() {
    for (const id of selected) {
      const doc = documents.find((d) => d.id === id);
      if (!doc) continue;
      const url = await getSignedDownloadUrl(doc.storage_path);
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.file_name;
        a.target = "_blank";
        a.click();
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }

  if (documents.length === 0) {
    return (
      <div
        className="p-14 text-center rounded-2xl"
        style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)" }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--ou-toggle-bg)" }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--ou-muted)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--ou-subtext)" }}>
          {isArchived ? "No archived documents." : "No documents yet for this filter."}
        </p>
        {!isArchived && canUpload && (
          <p className="text-xs mt-1" style={{ color: "var(--ou-muted)" }}>Use the Upload button to add the first file.</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)" }}>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-5 py-2.5" style={{ background: "var(--ou-pill-bg)", borderBottom: "1px solid var(--ou-divider)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--ou-accent)" }}>{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            {bulkError && <span className="text-xs text-red-500">{bulkError}</span>}
            <button
              onClick={handleBulkDownload}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40"
              style={{ color: "var(--ou-subtext)", border: "1px solid var(--ou-card-border)", background: "var(--ou-card-bg)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All
            </button>
            <button
              onClick={handleBulkArchive}
              disabled={isPending}
              className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors border disabled:opacity-40 ${
                isArchived
                  ? "text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-900/20"
                  : "text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/20"
              }`}
            >
              {isPending ? "…" : isArchived ? "Restore All" : "Archive All"}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs px-2 py-1 transition-colors"
              style={{ color: "var(--ou-muted)" }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Select-all header */}
      <div className="flex items-center gap-3 px-5 py-2.5" style={{ borderBottom: "1px solid var(--ou-divider)", background: "var(--ou-toggle-bg)" }}>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="w-4 h-4 rounded accent-maroon cursor-pointer" style={{ borderColor: "var(--ou-card-border)" }}
        />
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--ou-muted)" }}>
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div>
        {documents.map((doc, idx) => {
          const hasHistory = doc.version > 1;
          const isSelected = selected.has(doc.id);

          return (
            <div
              key={doc.id}
              className={`px-5 py-4 transition-colors ${isArchived ? "opacity-60" : ""}`}
              style={{
                background: isSelected ? "var(--ou-pill-bg)" : "transparent",
                borderBottom: idx < documents.length - 1 ? "1px solid var(--ou-divider)" : undefined,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleOne(doc.id)}
                  className="w-4 h-4 rounded border-gray-300 accent-maroon cursor-pointer mt-1 shrink-0"
                />

                {/* File type icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--ou-pill-bg)", color: "var(--ou-accent)" }}>
                  <FileIcon mimeType={doc.mime_type} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm leading-snug" style={{ color: "var(--ou-heading)" }}>{doc.title}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md shrink-0" style={{ color: "var(--ou-subtext)", background: "var(--ou-toggle-bg)" }}>
                      {doc.school_year} · {doc.semester === "N/A" ? "Full Year" : `${doc.semester} sem`}
                    </span>
                    <VersionPill version={doc.version} />
                    {isArchived && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ color: "var(--ou-muted)", background: "var(--ou-toggle-bg)", border: "1px solid var(--ou-card-border)" }}>
                        Archived
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs flex-wrap" style={{ color: "var(--ou-muted)" }}>
                    <span className="truncate max-w-[200px]" title={doc.file_name}>{doc.file_name}</span>
                    <span style={{ color: "var(--ou-divider)", opacity: 0.5 }}>·</span>
                    <span>{doc.uploader_name}</span>
                    <span style={{ color: "var(--ou-divider)", opacity: 0.5 }}>·</span>
                    <span>{formatDate(doc.created_at)}</span>
                  </div>
                </div>

                {/* Per-row actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <DocumentPreviewButton
                    storagePath={doc.storage_path}
                    mimeType={doc.mime_type}
                    title={doc.title}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold hover:text-maroon rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-white/10 hover:border-maroon/30 hover:bg-maroon/[0.03] dark:hover:bg-maroon/10"
                  />
                  <DownloadButton storagePath={doc.storage_path} />
                  {!isArchived && canUpload && (
                    <UploadModal
                      folderId={folderId}
                      schoolYears={schoolYears}
                      replacesId={doc.id}
                      replacesTitle={doc.title}
                      triggerLabel="New Version"
                      triggerClassName="inline-flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-maroon border border-gray-200 dark:border-white/10 hover:border-maroon/30 rounded-lg px-3 py-1.5 transition-colors hover:bg-maroon/[0.03] dark:hover:bg-maroon/10"
                    />
                  )}
                  <ArchiveButton documentId={doc.id} archived={doc.archived} />
                </div>
              </div>

              {hasHistory && <VersionHistoryTable docId={doc.id} version={doc.version} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
