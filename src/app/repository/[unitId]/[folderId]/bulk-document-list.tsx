"use client";

import { useState, useTransition } from "react";
import { DownloadButton } from "@/components/download-button";
import { ArchiveButton } from "@/components/archive-button";
import { UploadModal } from "@/components/upload-modal";
import { DocumentPreviewButton } from "@/components/document-preview-button";
import { bulkArchiveDocuments, bulkRestoreDocuments, getSignedDownloadUrl } from "@/lib/actions/document-actions";
import { formatDate } from "@/lib/date-utils";
import type { DocumentRow } from "@/lib/data/documents";

function VersionPill({ version }: { version: number }) {
  if (version === 1) {
    return (
      <span className="text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
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

function VersionHistoryTable({ history }: { history: DocumentRow[] }) {
  return (
    <details className="mt-3 group" style={{ marginLeft: "52px" }}>
      <summary className="text-xs text-maroon cursor-pointer select-none inline-flex items-center gap-1.5 hover:text-maroon-dark transition-colors list-none">
        <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
        {history.length - 1} previous version{history.length - 1 !== 1 ? "s" : ""}
      </summary>
      <div className="mt-2 rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Version</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Uploaded by</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Date</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {history.map((v, i) => (
              <tr key={v.id} className={i === 0 ? "bg-maroon/[0.02]" : ""}>
                <td className="px-3 py-2">
                  <span className={`font-semibold ${i === 0 ? "text-maroon" : "text-gray-500"}`}>
                    v{v.version}
                    {i === 0 && <span className="ml-1 text-[10px] text-maroon/50 font-normal">(current)</span>}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-500">{v.uploader_name ?? "—"}</td>
                <td className="px-3 py-2 text-gray-400">{formatDate(v.created_at)}</td>
                <td className="px-3 py-2 text-right">
                  <DownloadButton storagePath={v.storage_path} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

type Props = {
  documents: DocumentRow[];
  versionHistories: Record<string, DocumentRow[]>;
  folderId: string;
  schoolYears: string[];
  canUpload: boolean;
  isArchived: boolean;
};

export function BulkDocumentList({
  documents,
  versionHistories,
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
      <div className="p-14 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-400">
          {isArchived ? "No archived documents." : "No documents yet for this filter."}
        </p>
        {!isArchived && canUpload && (
          <p className="text-xs text-gray-300 mt-1">Use the Upload button to add the first file.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-maroon/[0.04] border-b border-maroon/10">
          <span className="text-sm font-semibold text-maroon">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            {bulkError && <span className="text-xs text-red-500">{bulkError}</span>}
            <button
              onClick={handleBulkDownload}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 hover:border-maroon/30 hover:text-maroon hover:bg-maroon/[0.03] rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40"
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
                  ? "text-green-700 border-green-200 hover:bg-green-50"
                  : "text-red-600 border-red-200 hover:bg-red-50"
              }`}
            >
              {isPending ? "…" : isArchived ? "Restore All" : "Archive All"}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Select-all header */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-100 bg-gray-50/40">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="w-4 h-4 rounded border-gray-300 accent-maroon cursor-pointer"
        />
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {documents.map((doc) => {
          const history = versionHistories[doc.id] ?? [];
          const hasHistory = history.length > 1;
          const isSelected = selected.has(doc.id);

          return (
            <div
              key={doc.id}
              className={`px-5 py-4 transition-colors ${isSelected ? "bg-maroon/[0.02]" : ""} ${isArchived ? "opacity-60" : ""}`}
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
                <div className="w-9 h-9 rounded-xl bg-maroon/[0.06] text-maroon flex items-center justify-center shrink-0 mt-0.5">
                  <FileIcon mimeType={doc.mime_type} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800 text-sm leading-snug">{doc.title}</span>
                    <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                      {doc.school_year} · {doc.semester === "N/A" ? "Full Year" : `${doc.semester} sem`}
                    </span>
                    <VersionPill version={doc.version} />
                    {isArchived && (
                      <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 shrink-0">
                        Archived
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
                    <span className="truncate max-w-[200px]" title={doc.file_name}>{doc.file_name}</span>
                    <span className="text-gray-200">·</span>
                    <span>{doc.uploader_name}</span>
                    <span className="text-gray-200">·</span>
                    <span>{formatDate(doc.created_at)}</span>
                  </div>
                </div>

                {/* Per-row actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <DocumentPreviewButton
                    storagePath={doc.storage_path}
                    mimeType={doc.mime_type}
                    title={doc.title}
                  />
                  <DownloadButton storagePath={doc.storage_path} />
                  {!isArchived && canUpload && (
                    <UploadModal
                      folderId={folderId}
                      schoolYears={schoolYears}
                      replacesId={doc.id}
                      replacesTitle={doc.title}
                      triggerLabel="New Version"
                      triggerClassName="inline-flex items-center justify-center text-xs font-semibold text-gray-500 hover:text-maroon border border-gray-200 hover:border-maroon/30 rounded-lg px-3 py-1.5 transition-colors hover:bg-maroon/[0.03]"
                    />
                  )}
                  <ArchiveButton documentId={doc.id} archived={doc.archived} />
                </div>
              </div>

              {hasHistory && <VersionHistoryTable history={history} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
