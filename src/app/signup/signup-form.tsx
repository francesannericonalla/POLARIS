"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";

type College = { id: string; name: string; departments: { id: string; name: string }[] };
type Office  = { id: string; name: string };
type Tree    = { academics: College[]; administration: Office[] };

const initialState: SignupState = {};

export default function SignupForm({ tree }: { tree: Tree }) {
  const [state, formAction] = useFormState(signup, initialState);
  const [branch, setBranch]             = useState<"academics" | "administration">("academics");
  const [collegeId, setCollegeId]       = useState("");
  const [unitId, setUnitId]             = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirm]   = useState("");
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

      {/* ── Personal info — 2 column grid ── */}
      <div className="sf-grid">

        <div className="sf-col-full">
          <label htmlFor="sf-name" className="lf-label">Full name</label>
          <input
            id="sf-name"
            name="full_name"
            required
            placeholder="Maria Louise Abella"
            className="lf-input"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="sf-email" className="lf-label">CIT-U email</label>
          <input
            id="sf-email"
            name="email"
            type="email"
            required
            placeholder="m.abella@cit.edu"
            className="lf-input"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="sf-id" className="lf-label">ID number</label>
          <input
            id="sf-id"
            name="id_number"
            required
            placeholder="214512088"
            maxLength={9}
            inputMode="numeric"
            pattern="\d*"
            className="lf-input"
          />
        </div>

        <div>
          <label htmlFor="sf-pw" className="lf-label">Password</label>
          <input
            id="sf-pw"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="lf-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="sf-pw2" className="lf-label">Confirm password</label>
          <input
            id="sf-pw2"
            type="password"
            required
            placeholder="Repeat password"
            className="lf-input"
            value={confirmPassword}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {passwordError && (
            <p className="sf-field-error">{passwordError}</p>
          )}
        </div>

      </div>

      {/* ── Unit picker ── */}
      <div className="sf-unit-card">

        <div className="sf-unit-header">
          <span className="sf-unit-title">Your unit</span>
          <span className="sf-unit-hint">Pick a branch, then find your unit.</span>
        </div>

        <div className="sf-unit-body">

          {/* Branch toggle */}
          <div className="sf-toggle-row">
            <button
              type="button"
              className={`sf-toggle-btn${acad ? " sf-toggle-btn--active" : ""}`}
              onClick={() => { setBranch("academics"); setCollegeId(""); setUnitId(""); }}
            >
              <span className="sf-toggle-label">Academics</span>
              <span className="sf-toggle-sub">College, then department</span>
            </button>
            <button
              type="button"
              className={`sf-toggle-btn${!acad ? " sf-toggle-btn--active" : ""}`}
              onClick={() => { setBranch("administration"); setCollegeId(""); setUnitId(""); }}
            >
              <span className="sf-toggle-label">Administration</span>
              <span className="sf-toggle-sub">Office</span>
            </button>
          </div>

          {/* Academics: college → department */}
          {acad && (
            <>
              <label className="lf-label">College</label>
              <select
                className="lf-input sf-select"
                value={collegeId}
                onChange={(e) => { setCollegeId(e.target.value); setUnitId(""); }}
                required
              >
                <option value="">Select your college</option>
                {tree.academics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {selectedCollege && (
                <>
                  <label className="lf-label" style={{ marginTop: 10 }}>Department</label>
                  <select
                    name="unit_id"
                    className="lf-input sf-select"
                    required
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                  >
                    <option value="">Select your department</option>
                    {selectedCollege.departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </>
              )}
            </>
          )}

          {/* Administration: office */}
          {!acad && (
            <>
              <label className="lf-label">Office</label>
              <select
                name="unit_id"
                className="lf-input sf-select"
                required
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
              >
                <option value="">Select your office</option>
                {tree.administration.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </>
          )}

          {/* Selection confirmation */}
          {unitId && (
            <div className="sf-selected-banner">
              Selected:{" "}
              <strong>
                {acad
                  ? selectedCollege?.departments.find((d) => d.id === unitId)?.name
                  : tree.administration.find((o) => o.id === unitId)?.name ?? "—"}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      {state?.error && (
        <p className="lf-banner lf-banner--error" style={{ marginTop: 16 }}>{state.error}</p>
      )}

      {/* ── Submit + sign in link ── */}
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
