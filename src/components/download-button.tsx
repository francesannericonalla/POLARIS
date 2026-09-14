"use client";

import { useState } from "react";
import { getSignedDownloadUrl } from "@/lib/actions/document-actions";

export function DownloadButton({ storagePath }: { storagePath: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const url = await getSignedDownloadUrl(storagePath);
    setLoading(false);
    if (url) window.open(url, "_blank");
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-medium text-maroon hover:text-maroon-dark disabled:opacity-50 transition-colors"
    >
      {loading ? "Preparing..." : "Download"}
    </button>
  );
}
