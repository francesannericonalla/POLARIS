"use client";

import { useState, useEffect, useCallback } from "react";
import { getSignedDownloadUrl } from "@/lib/actions/document-actions";

function isPreviewable(mimeType: string) {
  return mimeType === "application/pdf" || mimeType.startsWith("image/");
}

function PreviewModal({
  url,
  mimeType,
  title,
  onClose,
}: {
  url: string;
  mimeType: string;
  title: string;
  onClose: () => void;
}) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "min(900px, 95vw)", height: "min(85vh, 900px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 shrink-0">
          <span className="font-semibold text-sm text-gray-800 truncate flex-1" title={title}>{title}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Close preview"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-50">
          {mimeType === "application/pdf" ? (
            <iframe src={url} className="w-full h-full border-0" title={title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={title} className="max-w-full max-h-full object-contain rounded-lg shadow" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DocumentPreviewButton({
  storagePath,
  mimeType,
  title,
  className,
}: {
  storagePath: string;
  mimeType: string;
  title: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isPreviewable(mimeType)) return null;

  async function handleClick() {
    setLoading(true);
    const url = await getSignedDownloadUrl(storagePath);
    setLoading(false);
    if (url) setPreviewUrl(url);
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className ?? "inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-maroon border border-gray-200 hover:border-maroon/30 rounded-lg px-3 py-1.5 transition-colors hover:bg-maroon/[0.03] disabled:opacity-40"}
      >
        {loading ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
        Preview
      </button>
      {previewUrl && (
        <PreviewModal
          url={previewUrl}
          mimeType={mimeType}
          title={title}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </>
  );
}
