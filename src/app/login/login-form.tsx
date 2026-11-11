"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { login, type LoginState } from "@/lib/actions/auth-actions";
import { useSearchParams } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { StarField } from "@/components/star-field";

const initialState: LoginState = {};

function RegisteredBanner() {
  const params = useSearchParams();
  if (params?.get("registered") !== "1") return null;
  return (
    <p className="lf-banner lf-banner--success">
      Account created. You can log in now, but you&apos;ll need QAO approval before you can upload documents.
    </p>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PolarisWordmark() {
  return (
    <img
      src="/POLARIS-logo.png"
      alt="POLARIS"
      className="lf-logo-img"
    />
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="lf-root">

      {/* ── Background: CIT-U building fills entire page ── */}
      <div className="lf-bg" aria-hidden="true" />

      {/* ── Blinking star field ── */}
      <StarField />

      {/* ── Left branding section ── */}
      <div className="lf-left">
        <div className="lf-brand">

          {/* POLARIS wordmark */}
          <PolarisWordmark />

          {/* QAO classification */}
          <p className="lf-classification">
            QAO Compliance &amp; Document Repository
          </p>

          {/* Acronym meaning */}
          <p className="lf-acronym">
            Performance and Organization Leadership Analytics,<br />
            Reporting, and Institutional Stewardship
          </p>
        </div>
      </div>

      {/* ── Right login card section ── */}
      <div className="lf-right">
        <div className="lf-card">

          <h1 className="lf-heading">Sign in</h1>
          <p className="lf-subheading">
            Use the CIT-U account issued to your department or office.
          </p>

          <RegisteredBanner />

          <form action={formAction} noValidate>

            <div className="lf-field">
              <label htmlFor="lf-email" className="lf-label">CIT-U email</label>
              <input
                id="lf-email"
                name="email"
                type="email"
                required
                placeholder="name@cit.edu"
                className="lf-input"
                autoComplete="email"
              />
            </div>

            <div className="lf-field">
              <label htmlFor="lf-password" className="lf-label">Password</label>
              <div className="lf-input-wrap">
                <input
                  id="lf-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••"
                  className="lf-input lf-input--password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lf-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {state?.error && (
              <p className="lf-banner lf-banner--error">{state.error}</p>
            )}

            <div className="lf-row">
              <label className="lf-check-label">
                <input
                  type="checkbox"
                  name="remember"
                  className="lf-checkbox"
                />
                Keep me signed in
              </label>
              <span className="lf-forgot">Forgot password?</span>
            </div>

            <SubmitButton pendingText="Signing in…" className="lf-btn">
              Sign in
            </SubmitButton>
          </form>

          <div className="lf-divider" />
          <p className="lf-footer">
            No account yet?{" "}
            <Link href="/signup" className="lf-link">
              Request an account
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
