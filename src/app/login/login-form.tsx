"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { login, type LoginState } from "@/lib/actions/auth-actions";
import { useSearchParams } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { PolarisLogo } from "@/components/polaris-logo";

const initialState: LoginState = {};

function RegisteredBanner() {
  const params = useSearchParams();
  if (params?.get("registered") !== "1") return null;
  return (
    <p style={{
      fontSize: 13.5,
      color: "#1F5C52",
      background: "rgba(31,92,82,.08)",
      border: "1px solid rgba(31,92,82,.25)",
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 20,
      fontFamily: "var(--font-manrope)",
      fontWeight: 500,
    }}>
      Account created. You can log in now, but you&apos;ll need QAO approval before you can upload documents.
    </p>
  );
}

/* ── Twinkling star dots ── */
const STARS = [
  { l: "12%", t: "18%", s: 2,  c: "#F7F3EC", d: "6s",    delay: "0s"   },
  { l: "26%", t: "9%",  s: 3,  c: "#B8892B", d: "9s",    delay: ".8s"  },
  { l: "41%", t: "24%", s: 2,  c: "#F7F3EC", d: "7.5s",  delay: "1.6s" },
  { l: "58%", t: "12%", s: 2,  c: "#EADFCB", d: "11s",   delay: ".4s"  },
  { l: "73%", t: "30%", s: 3,  c: "#B8892B", d: "8s",    delay: "2.2s" },
  { l: "88%", t: "16%", s: 2,  c: "#F7F3EC", d: "10s",   delay: "1.1s" },
  { l: "8%",  t: "46%", s: 2,  c: "#EADFCB", d: "9.5s",  delay: "3s"   },
  { l: "33%", t: "58%", s: 2,  c: "#F7F3EC", d: "6.8s",  delay: "2.4s" },
  { l: "52%", t: "47%", s: 3,  c: "#B8892B", d: "12s",   delay: ".2s"  },
  { l: "67%", t: "64%", s: 2,  c: "#F7F3EC", d: "7.2s",  delay: "1.9s" },
  { l: "84%", t: "52%", s: 2,  c: "#EADFCB", d: "10.5s", delay: "2.7s" },
  { l: "18%", t: "76%", s: 3,  c: "#B8892B", d: "8.6s",  delay: ".9s"  },
  { l: "44%", t: "84%", s: 2,  c: "#F7F3EC", d: "9.2s",  delay: "3.4s" },
  { l: "62%", t: "90%", s: 2,  c: "#EADFCB", d: "6.4s",  delay: "1.4s" },
  { l: "79%", t: "79%", s: 2,  c: "#F7F3EC", d: "11.4s", delay: "2s"   },
  { l: "94%", t: "68%", s: 3,  c: "#B8892B", d: "7.8s",  delay: ".6s"  },
];

export default function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", minHeight: "100vh" }}>

      {/* ── Left panel ── */}
      <div className="pol-left-panel">

        {/* Drifting star field */}
        <div style={{ position: "absolute", inset: "-12% -12% -12% -12%", animation: "polDrift 78s linear infinite alternate" }}>
          {STARS.map((s, i) => (
            <div key={i} style={{
              position: "absolute",
              left: s.l, top: s.t,
              width: s.s, height: s.s,
              borderRadius: "50%",
              background: s.c,
              animation: `polTwinkle ${s.d} ease-in-out ${s.delay} infinite`,
            }} />
          ))}
        </div>

        {/* Spinning compass circle */}
        <div style={{ position: "absolute", left: "78%", top: "26%", width: 360, height: 360, marginLeft: -180, marginTop: -180, pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(184,137,43,.18)", animation: "polSpin 240s linear infinite" }} />
          <div style={{ position: "absolute", inset: 52, borderRadius: "50%", border: "1px solid rgba(184,137,43,.12)" }} />
          <div style={{ position: "absolute", inset: 104, borderRadius: "50%", border: "1px dashed rgba(247,243,236,.1)", animation: "polSpin 160s linear infinite reverse" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 1, height: 196, margin: "-98px 0 0 0", background: "linear-gradient(180deg,rgba(184,137,43,0),rgba(184,137,43,.5),rgba(184,137,43,0))" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 196, height: 1, margin: "0 0 0 -98px", background: "linear-gradient(90deg,rgba(184,137,43,0),rgba(184,137,43,.35),rgba(184,137,43,0))" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 14, height: 14, margin: "-7px 0 0 -7px", borderRadius: "50%", background: "#B8892B", boxShadow: "0 0 26px 6px rgba(184,137,43,.45)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 14, height: 14, margin: "-7px 0 0 -7px", borderRadius: "50%", background: "rgba(184,137,43,.6)", animation: "polPulse 6s ease-out infinite" }} />
        </div>

        {/* Shooting stars */}
        <div style={{ position: "absolute", left: "-14%", top: "26%", width: 150, height: 1.5, background: "linear-gradient(90deg,rgba(247,243,236,0),rgba(247,243,236,.85))", borderRadius: 2, transform: "rotate(19deg)", animation: "polShoot 17s ease-in 4s infinite" }} />
        <div style={{ position: "absolute", left: "-14%", top: "62%", width: 110, height: 1.5, background: "linear-gradient(90deg,rgba(184,137,43,0),rgba(232,198,110,.8))", borderRadius: 2, transform: "rotate(14deg)", animation: "polShoot 23s ease-in 12s infinite" }} />

        {/* Logo + institution */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <PolarisLogo size={52} />
          <div style={{ font: "600 13px/1 var(--font-manrope),sans-serif", color: "rgba(247,243,236,.72)" }}>
            Cebu Institute of Technology – University
          </div>
        </div>

        {/* POLARIS wordmark */}
        <div style={{ position: "relative", maxWidth: 420 }}>
          <div style={{
            font: "700 72px/.9 var(--font-poppins),sans-serif",
            letterSpacing: "-.01em",
            color: "#F7F3EC",
          }}>
            POLARIS
          </div>
          <div style={{ marginTop: 16, width: 48, height: 2, background: "linear-gradient(90deg,#B8892B,rgba(184,137,43,0))" }} />
          <p style={{ margin: "20px 0 0", font: "400 15px/1.65 var(--font-manrope),sans-serif", color: "rgba(247,243,236,.64)" }}>
            Performance and Organization Leadership Analytics, Reporting, and Institutional Stewardship
          </p>
        </div>

        {/* Bottom spacer */}
        <div />
      </div>

      {/* ── Right panel — sign-in form ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 40px", background: "#ffffff" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ font: "700 32px/1.15 var(--font-poppins),sans-serif", letterSpacing: "-.01em", color: "#1a0a10" }}>
            Sign in
          </div>
          <p style={{ margin: "10px 0 32px", font: "400 14px/1.6 var(--font-manrope),sans-serif", color: "rgba(32,26,29,.58)" }}>
            Use the CIT-U account issued to your department or office.
          </p>

          <RegisteredBanner />

          <form action={formAction}>
            <label className="pol-label">CIT-U email</label>
            <input name="email" type="email" required placeholder="name@cit.edu" className="pol-input" style={{ marginBottom: 20 }} />

            <label className="pol-label">Password</label>
            <input name="password" type="password" required placeholder="••••••••••" className="pol-input" style={{ marginBottom: 14 }} />

            {state?.error && (
              <p style={{ fontSize: 13.5, color: "#7A1330", background: "rgba(122,19,48,.07)", border: "1px solid rgba(122,19,48,.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontFamily: "var(--font-manrope)" }}>
                {state.error}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, font: "500 13px/1 var(--font-manrope),sans-serif", color: "rgba(32,26,29,.72)", cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: "#7A1330", width: 15, height: 15 }} />
                Keep me signed in
              </label>
              <span style={{ font: "600 13px/1 var(--font-manrope),sans-serif", color: "#7A1330" }}>Forgot password</span>
            </div>

            <SubmitButton pendingText="Signing in…" className="pol-btn-primary">
              Sign in
            </SubmitButton>
          </form>

          <div style={{ marginTop: 22, paddingTop: 22, borderTop: "1px solid rgba(74,14,31,.12)", font: "400 13.5px/1.6 var(--font-manrope),sans-serif", color: "rgba(32,26,29,.72)" }}>
            No account yet?{" "}
            <Link href="/signup" style={{ fontWeight: 600, color: "#7A1330" }}>Sign up</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
