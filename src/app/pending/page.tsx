import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logout } from "@/lib/actions/auth-actions";
import { StarField } from "@/components/star-field";

export default async function PendingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status === "approved" && profile.unit_id) redirect("/dashboard");
  if (profile.status === "approved" && profile.role === "qao") redirect("/dashboard");
  if (profile.status === "approved" && profile.role === "system_admin") redirect("/admin/accounts");

  const rejected = profile.status === "rejected";

  return (
    <div className="lf-root">

      {/* ── Background: same CIT-U building as login ── */}
      <div className="lf-bg" aria-hidden="true" />

      {/* ── Animated star field overlay ── */}
      <StarField />

      {/* ── Left branding — identical to login ── */}
      <div className="lf-left">
        <div className="lf-brand">
          <img
            src="/POLARIS-logo.png"
            alt="POLARIS"
            className="lf-logo-img"
          />
          <p className="lf-classification">
            QAO Compliance &amp; Document Repository
          </p>
          <p className="lf-acronym">
            Performance and Organization Leadership Analytics,<br />
            Reporting, and Institutional Stewardship
          </p>
        </div>
      </div>

      {/* ── Right: status card ── */}
      <div className="lf-right">
        <div className="lf-card pend-card">

          {/* Animated logo */}
          <div className="pend-logo-wrap" aria-hidden="true">
            <svg viewBox="0 0 120 120" width="72" height="72" style={{ display: "block", overflow: "visible" }}>
              <ellipse
                cx="60" cy="60"
                rx="52" ry="20"
                fill="none"
                stroke="#C9A84C"
                strokeWidth="2"
                strokeLinecap="round"
                transform="rotate(-18, 60, 60)"
                opacity="0.9"
                className="pend-orbit"
              />
              <g transform="translate(100, 32)" className="pend-orbit-dot">
                <path d="M0,-7 L1.6,-1.6 L7,0 L1.6,1.6 L0,7 L-1.6,1.6 L-7,0 L-1.6,-1.6 Z" fill="#C9A84C" />
              </g>
              <polygon points="60,8 64,20 56,20" fill="#C9A84C" opacity="0.85" />
              <circle cx="60" cy="60" r="22" fill="#800D2D" />
              {/* 4-pointed compass star — matches tab favicon style */}
              <path
                d="M60,42 L63,57 L78,60 L63,63 L60,78 L57,63 L42,60 L57,57 Z"
                fill="#C9A84C"
              />
            </svg>
            {/* Pulse rings */}
            <span className="pend-pulse pend-pulse--1" />
            <span className="pend-pulse pend-pulse--2" />
          </div>

          {rejected ? (
            <>
              <h1 className="pend-title">Account Not Approved</h1>
              <p className="pend-body">
                Please contact the Quality Assurance Office for more information about your account status.
              </p>
            </>
          ) : (
            <>
              <h1 className="pend-title">Awaiting QAO Approval</h1>
              <p className="pend-body">
                You&apos;ll be able to view and submit documents for your office once the Admin confirms your account.
              </p>
            </>
          )}

          <div className="lf-divider" style={{ margin: "24px 0" }} />

          <form action={logout}>
            <button type="submit" className="lf-btn">
              Log Out
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
