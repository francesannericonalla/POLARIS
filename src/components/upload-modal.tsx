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

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      formRef.current?.reset();
    }
  }, [state]);

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
              <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
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
                    <option value="N/A">Full Year (N/A)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">File</label>
                <input
                  name="file"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, JPG, PNG — max 50MB</p>
              </div>

              {state?.error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
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
