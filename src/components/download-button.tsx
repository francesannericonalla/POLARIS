"use client";

import { useState } from "react";
import { getSignedDownloadUrl } from "@/lib/actions/document-actions";

export function DownloadButton({ storagePath, compact = false }: { storagePath: string; compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const url = await getSignedDownloadUrl(storagePath);
    setLoading(false);
    if (url) window.open(url, "_blank");
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs font-medium text-maroon hover:text-maroon-dark disabled:opacity-50 transition-colors px-2 py-1 rounded hover:bg-maroon/5"
        title="Download this version"
      >
        {loading ? "…" : "Download"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-medium text-maroon hover:text-maroon-dark disabled:opacity-50 transition-colors px-2 py-1.5 rounded hover:bg-maroon/5"
    >
      {loading ? "Preparing..." : "Download"}
    </button>
  );
}
