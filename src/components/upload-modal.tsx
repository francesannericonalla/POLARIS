"use client";

import { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import { uploadDocument, type UploadState } from "@/lib/actions/document-actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: UploadState = {};

export function UploadModal({
  folderId,
  schoolYears,
  replacesId,
  replacesTitle,
  triggerLabel,
  triggerClassName,
}: {
  folderId: string;
  schoolYears: string[];
  replacesId?: string;
  replacesTitle?: string;
  triggerLabel: string;
  triggerClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(uploadDocument, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setSelectedFile(null);
      formRef.current?.reset();
    }
  }, [state]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      setSelectedFile(file);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null);
  }

  const currentYear = new Date().getFullYear();
  const suggestedYears = schoolYears.length
    ? schoolYears
    : [`${currentYear}-${currentYear + 1}`, `${currentYear - 1}-${currentYear}`];

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {replacesId ? "Upload New Version" : "Upload Document"}
                </h3>
                {replacesTitle && <p className="text-xs text-gray-400 mt-0.5">Replacing: {replacesTitle}</p>}
              </div>
              <button onClick={() => { setOpen(false); setSelectedFile(null); }} className="text-gray-300 hover:text-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form ref={formRef} action={formAction} className="space-y-3">
              <input type="hidden" name="folder_id" value={folderId} />
              {replacesId && <input type="hidden" name="replaces_id" value={replacesId} />}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Document Title</label>
                <input
                  name="title"
                  required
                  defaultValue={replacesTitle}
                  className="input-field"
                  placeholder="e.g. Q1 Accomplishment Report"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">School Year</label>
                  <select name="school_year" required className="input-field" defaultValue="">
                    <option value="" disabled>Select</option>
                    {suggestedYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Semester</label>
                  <select name="semester" required className="input-field" defaultValue="">
                    <option value="" disabled>Select</option>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              {/* Drag-and-drop file area */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">File</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 cursor-pointer transition-colors ${
                    dragOver
                      ? "border-maroon bg-maroon/5"
                      : selectedFile
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 hover:border-maroon/40 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    name="file"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  {selectedFile ? (
                    <>
                      <svg className="w-6 h-6 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium text-green-700 text-center truncate max-w-full px-2">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-green-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="w-7 h-7 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-500">
                        <span className="font-semibold text-maroon">Click to upload</span> or drag and drop
                      </span>
                      <span className="text-xs text-gray-400">PDF, Word, Excel, JPG, PNG — max 50MB</span>
                    </>
                  )}
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-xs text-gray-400 hover:text-red-500 mt-1 transition-colors"
                  >
                    Remove file
                  </button>
                )}
              </div>

              {state?.error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setOpen(false); setSelectedFile(null); }} className="btn-secondary flex-1">
                  Cancel
                </button>
                <SubmitButton pendingText="Uploading..." className="btn-primary flex-1">
                  Upload
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
