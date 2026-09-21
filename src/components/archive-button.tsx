"use client";

import { useState } from "react";
import { archiveDocument, restoreDocument } from "@/lib/actions/document-actions";

export function ArchiveButton({ documentId, archived }: { documentId: string; archived: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      if (archived) {
        await restoreDocument(documentId);
      } else {
        await archiveDocument(documentId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <button
        onClick={handleClick}
        disabled={pending}
        className={`inline-flex items-center justify-center text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors border disabled:opacity-40 ${
          archived
            ? "text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
            : "text-gray-400 border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
        }`}
      >
        {pending ? "…" : archived ? "Restore" : "Archive"}
      </button>
      {error && <span className="text-[10px] text-red-500 text-right max-w-[120px]">{error}</span>}
    </span>
  );
}
