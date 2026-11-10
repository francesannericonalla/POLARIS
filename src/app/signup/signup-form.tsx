"use client";

import { useFormState } from "react-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signup, type SignupState } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";

type College = { id: string; name: string; departments: { id: string; name: string }[] };
type Office  = { id: string; name: string };
type Tree    = { academics: College[]; administration: Office[] };

const initialState: SignupState = {};

/* ── Custom dropdown rendered via portal so it's never clipped ── */
function CustomSelect({
  name,
  options,
  value,
  onChange,
  placeholder,
}: {
  name?: string;
  options: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0, maxHeight: 200 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.id === value);

  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const maxH = 200;
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const openUpward = spaceBelow < 120 && spaceAbove > spaceBelow;
    const actualH = Math.min(maxH, openUpward ? spaceAbove - 8 : spaceBelow - 8);
    setDropPos({
      top: openUpward ? r.top - actualH : r.bottom + 4,
      left: r.left,
      width: r.width,
      maxHeight: actualH,
    });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const list = (
    <ul
      className="sf-portal-list"
      style={{ top: dropPos.top, left: dropPos.left, width: dropPos.width, maxHeight: dropPos.maxHeight }}
    >
      {options.map((o) => (
        <li
          key={o.id}
          className={`sf-portal-option${o.id === value ? " sf-portal-option--selected" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onChange(o.id);
            setOpen(false);
          }}
        >
          {o.name}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="sf-custom-select">
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        ref={triggerRef}
        className={`sf-custom-trigger lf-input${open ? " sf-custom-trigger--open" : ""}`}
        onClick={() => open ? setOpen(false) : openDropdown()}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "" : "sf-custom-placeholder"}>
          {selected ? selected.name : placeholder}
        </span>
        <svg
          className={`sf-custom-chevron${open ? " sf-custom-chevron--up" : ""}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && typeof document !== "undefined" && createPortal(list, document.body)}
    </div>
  );
}

export default function SignupForm({ tree }: { tree: Tree }) {
  const [state, formAction] = useFormState(signup, initialState);
  const [branch, setBranch]           = useState<"academics" | "administration">("academics");
  const [collegeId, setCollegeId]     = useState("");
  const [unitId, setUnitId]           = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [passwordError, setPasswordErr] = useState("");

  const selectedCollege = tree.academics.find((c) => c.id === collegeId);
  const acad = branch === "academics";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (password !== confirmPassword) {
      e.preventDefault();
      setPasswordErr("Passwords do not match.");
      return;
    }
    setPasswordErr("");
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>

      <div className="sf-grid">
        <div className="sf-col-full">
          <label htmlFor="sf-name" className="lf-label">Full name</label>
          <input id="sf-name" name="full_name" required placeholder="Maria Louise Abella" className="lf-input" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="sf-email" className="lf-label">CIT-U email</label>
          <input id="sf-email" name="email" type="email" required placeholder="m.abella@cit.edu" className="lf-input" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="sf-id" className="lf-label">ID number</label>
          <input id="sf-id" name="id_number" required placeholder="214512088" maxLength={9} inputMode="numeric" pattern="\d*" className="lf-input" />
        </div>
        <div>
          <label htmlFor="sf-pw" className="lf-label">Password</label>
          <input id="sf-pw" name="password" type="password" required minLength={8} placeholder="At least 8 characters" className="lf-input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="sf-pw2" className="lf-label">Confirm password</label>
          <input id="sf-pw2" type="password" required placeholder="Repeat password" className="lf-input" value={confirmPassword} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          {passwordError && <p className="sf-field-error">{passwordError}</p>}
        </div>
      </div>

      {/* ── Unit picker ── */}
      <div className="sf-unit-card">
        <div className="sf-unit-header">
          <span className="sf-unit-title">Your unit</span>
          <span className="sf-unit-hint">Pick a branch, then find your unit.</span>
        </div>
        <div className="sf-unit-body">

          <div className="sf-toggle-row">
            <button type="button" className={`sf-toggle-btn${acad ? " sf-toggle-btn--active" : ""}`} onClick={() => { setBranch("academics"); setCollegeId(""); setUnitId(""); }}>
              <span className="sf-toggle-label">Academics</span>
              <span className="sf-toggle-sub">College, then department</span>
            </button>
            <button type="button" className={`sf-toggle-btn${!acad ? " sf-toggle-btn--active" : ""}`} onClick={() => { setBranch("administration"); setCollegeId(""); setUnitId(""); }}>
              <span className="sf-toggle-label">Administration</span>
              <span className="sf-toggle-sub">Office</span>
            </button>
          </div>

          {acad && (
            <>
              <label className="lf-label">College</label>
              <CustomSelect
                options={tree.academics}
                value={collegeId}
                onChange={(id) => { setCollegeId(id); setUnitId(""); }}
                placeholder="Select your college"
              />
              {selectedCollege && (
                <>
                  <label className="lf-label" style={{ marginTop: 10 }}>Department</label>
                  <CustomSelect
                    name="unit_id"
                    options={selectedCollege.departments}
                    value={unitId}
                    onChange={setUnitId}
                    placeholder="Select your department"
                  />
                </>
              )}
            </>
          )}

          {!acad && (
            <>
              <label className="lf-label">Office</label>
              <CustomSelect
                name="unit_id"
                options={tree.administration}
                value={unitId}
                onChange={setUnitId}
                placeholder="Select your office"
              />
            </>
          )}

          {unitId && (
            <div className="sf-selected-banner">
              Selected: <strong>
                {acad
                  ? selectedCollege?.departments.find((d) => d.id === unitId)?.name
                  : tree.administration.find((o) => o.id === unitId)?.name ?? "—"}
              </strong>
            </div>
          )}
        </div>
      </div>

      {state?.error && <p className="lf-banner lf-banner--error" style={{ marginTop: 16 }}>{state.error}</p>}

      <div className="lf-divider" style={{ marginTop: 20 }} />
      <div className="sf-footer">
        <SubmitButton pendingText="Submitting…" className="lf-btn sf-submit-btn">
          Submit request
        </SubmitButton>
        <p className="lf-footer" style={{ marginTop: 14 }}>
          Already have an account?{" "}
          <Link href="/login" className="lf-link">Sign in</Link>
        </p>
      </div>

    </form>
  );
}
