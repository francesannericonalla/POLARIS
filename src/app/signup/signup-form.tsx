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

const FIELD: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  fontSize: 14,
  fontFamily: "var(--font-manrope)",
  background: "#fafafa",
  border: "1px solid rgba(74,14,31,.18)",
  borderRadius: 7,
  color: "#201A1D",
  outline: "none",
};

const LABEL: React.CSSProperties = {
  display: "block",
  font: "600 12px/1 var(--font-manrope),sans-serif",
  color: "#4A0E1F",
  marginBottom: 6,
};

export default function SignupForm({ tree }: { tree: Tree }) {
  const [state, formAction] = useFormState(signup, initialState);
  const [branch, setBranch]             = useState<"academics" | "administration" | "">("academics");
  const [collegeId, setCollegeId]       = useState("");
  const [unitId, setUnitId]             = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirm]   = useState("");
  const [passwordError, setPasswordErr] = useState("");

  const selectedCollege = tree.academics.find((c) => c.id === collegeId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (password !== confirmPassword) {
      e.preventDefault();
      setPasswordErr("Passwords do not match.");
      return;
    }
    setPasswordErr("");
  }

  const acad = branch === "academics";

  return (
    <form action={formAction} onSubmit={handleSubmit}>

      {/* ── Personal info grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>

        <div style={{ gridColumn: "1/-1" }}>
          <label style={LABEL}>Full name</label>
          <input name="full_name" required placeholder="Maria Louise Abella" style={FIELD} />
        </div>

        <div>
          <label style={LABEL}>CIT-U email</label>
          <input name="email" type="email" required placeholder="m.abella@cit.edu" style={FIELD} />
        </div>

        <div>
          <label style={LABEL}>ID number</label>
          <input name="id_number" required placeholder="21-4512-088" maxLength={9} style={FIELD} />
        </div>

        <div>
          <label style={LABEL}>Password</label>
          <input
            name="password" type="password" required minLength={8}
            placeholder="At least 8 characters"
            style={FIELD}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label style={LABEL}>Confirm password</label>
          <input
            type="password" required
            placeholder="Repeat password"
            style={FIELD}
            value={confirmPassword}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {passwordError && (
            <p style={{ marginTop: 6, fontSize: 12.5, color: "#7A1330", fontFamily: "var(--font-manrope)" }}>{passwordError}</p>
          )}
        </div>
      </div>

      {/* ── Unit picker card ── */}
      <div style={{ marginTop: 20, border: "1px solid rgba(74,14,31,.14)", borderRadius: 10, background: "#fafafa", overflow: "hidden" }}>

        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(74,14,31,.09)" }}>
          <div style={{ font: "600 13.5px/1.2 var(--font-manrope),sans-serif", color: "#201A1D" }}>Your unit</div>
          <div style={{ marginTop: 3, font: "400 12.5px/1.5 var(--font-manrope),sans-serif", color: "rgba(32,26,29,.55)" }}>
            Pick a branch, then find your unit. This determines which folders you can upload to.
          </div>
        </div>

        <div style={{ padding: "14px 18px" }}>

          {/* Branch toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => { setBranch("academics"); setCollegeId(""); setUnitId(""); }}
              style={{
                flex: 1, textAlign: "left", cursor: "pointer", padding: "11px 14px",
                borderRadius: 8,
                border: `1.5px solid ${acad ? "#7A1330" : "rgba(74,14,31,.16)"}`,
                background: acad ? "rgba(122,19,48,.06)" : "#ffffff",
              }}
            >
              <div style={{ font: "700 13px/1.2 var(--font-manrope),sans-serif", color: acad ? "#7A1330" : "#201A1D" }}>Academics</div>
              <div style={{ marginTop: 3, font: "400 12px/1.4 var(--font-manrope),sans-serif", color: acad ? "rgba(122,19,48,.65)" : "rgba(32,26,29,.55)" }}>College, then department</div>
            </button>
            <button
              type="button"
              onClick={() => { setBranch("administration"); setCollegeId(""); setUnitId(""); }}
              style={{
                flex: 1, textAlign: "left", cursor: "pointer", padding: "11px 14px",
                borderRadius: 8,
                border: `1.5px solid ${!acad ? "#7A1330" : "rgba(74,14,31,.16)"}`,
                background: !acad ? "rgba(122,19,48,.06)" : "#ffffff",
              }}
            >
              <div style={{ font: "700 13px/1.2 var(--font-manrope),sans-serif", color: !acad ? "#7A1330" : "#201A1D" }}>Administration</div>
              <div style={{ marginTop: 3, font: "400 12px/1.4 var(--font-manrope),sans-serif", color: !acad ? "rgba(122,19,48,.65)" : "rgba(32,26,29,.55)" }}>Office</div>
            </button>
          </div>

          {/* Academics: college → department */}
          {branch === "academics" && (
            <>
              <label style={{ ...LABEL, marginTop: 2 }}>College</label>
              <select
                style={{ ...FIELD, marginBottom: 10 }}
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
                  <label style={LABEL}>Department</label>
                  <select
                    name="unit_id" style={FIELD} required
                    value={unitId} onChange={(e) => setUnitId(e.target.value)}
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
          {branch === "administration" && (
            <>
              <label style={LABEL}>Office</label>
              <select
                name="unit_id"
                style={FIELD}
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

          {/* Summary banner — only shown once a unit is actually selected */}
          {unitId && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 7, background: "rgba(31,92,82,.07)", font: "500 12.5px/1.45 var(--font-manrope),sans-serif", color: "#1F5C52" }}>
              {`Selected: ${branch === "academics"
                ? selectedCollege?.departments.find(d => d.id === unitId)?.name
                : tree.administration.find(o => o.id === unitId)?.name ?? "—"}`}
            </div>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {state?.error && (
        <p style={{ marginTop: 18, fontSize: 13.5, color: "#7A1330", background: "rgba(122,19,48,.07)", border: "1px solid rgba(122,19,48,.2)", borderRadius: 8, padding: "10px 14px", fontFamily: "var(--font-manrope)" }}>
          {state.error}
        </p>
      )}

      {/* ── Submit ── */}
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <SubmitButton pendingText="Submitting…" className="pol-btn-primary" style={{ width: "auto", padding: "14px 28px" }}>
          Submit request
        </SubmitButton>
        <p style={{ margin: 0, font: "400 13px/1.5 var(--font-manrope),sans-serif", color: "rgba(32,26,29,.6)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ fontWeight: 600, color: "#7A1330" }}>Sign in</Link>
        </p>
      </div>

      
    </form>
  );
}
