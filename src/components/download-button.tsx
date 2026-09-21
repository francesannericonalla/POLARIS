"use client";

import { useState } from "react";
import { getSignedDownloadUrl } from "@/lib/actions/document-actions";

export function DownloadButton({ storagePath, compact = false }: { storagePath: string; compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(false);
    const url = await getSignedDownloadUrl(storagePath);
    setLoading(false);
    if (url) {
      window.open(url, "_blank");
    } else {
      setError(true);
    }
  }

  if (compact) {
    return (
      <span className="inline-flex flex-col items-end gap-0.5">
        <button
          onClick={handleClick}
          disabled={loading}
          className="text-xs font-semibold text-maroon hover:text-maroon-dark disabled:opacity-40 transition-colors px-2 py-1 rounded-md hover:bg-maroon/[0.05]"
          title="Download this version"
        >
          {loading ? "…" : "Download"}
        </button>
        {error && <span className="text-[10px] text-red-500 pr-2">Could not prepare download.</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center text-xs font-semibold text-maroon border border-maroon/25 hover:bg-maroon hover:text-white hover:border-maroon rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Preparing
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </span>
        )}
      </button>
      {error && <span className="text-[10px] text-red-500">Could not prepare download. Try again.</span>}
    </span>
  );
}
