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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="font-bold text-maroon-dark mb-1">
              {replacesId ? "Upload New Version" : "Upload Document"}
            </h3>
            {replacesTitle && <p className="text-xs text-gray-500 mb-4">Replacing: {replacesTitle}</p>}

            <form ref={formRef} action={formAction} className="space-y-3 mt-4">
              <input type="hidden" name="folder_id" value={folderId} />
              {replacesId && <input type="hidden" name="replaces_id" value={replacesId} />}

              <div>
                <label className="text-xs text-gray-600 block mb-1">Document Title</label>
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
                  <label className="text-xs text-gray-600 block mb-1">School Year</label>
                  <select name="school_year" required className="input-field" defaultValue="">
                    <option value="" disabled>
                      Select
                    </option>
                    {suggestedYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Semester</label>
                  <select name="semester" required className="input-field" defaultValue="">
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 block mb-1">File (PDF, Word, Excel, JPG, PNG — max 50MB)</label>
                <input
                  name="file"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="input-field"
                />
              </div>

              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <SubmitButton pendingText={"Uploading\u2026"} className="btn-primary flex-1">
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
