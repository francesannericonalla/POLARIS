import { getAllUnits, buildUnitTree } from "@/lib/data/units";
import SignupForm from "./signup-form";
import { PolarisLogo } from "@/components/polaris-logo";

export const dynamic = "force-dynamic";

const STARS = [
  { l: "16%", t: "14%", s: 2, c: "#F7F3EC", d: "8s",   delay: "0s"   },
  { l: "38%", t: "26%", s: 3, c: "#B8892B", d: "11s",  delay: "1.4s" },
  { l: "64%", t: "18%", s: 2, c: "#EADFCB", d: "9s",   delay: "2.6s" },
  { l: "84%", t: "38%", s: 2, c: "#F7F3EC", d: "7s",   delay: ".7s"  },
  { l: "22%", t: "58%", s: 2, c: "#F7F3EC", d: "10s",  delay: "3.1s" },
  { l: "52%", t: "72%", s: 3, c: "#B8892B", d: "12s",  delay: ".3s"  },
  { l: "78%", t: "84%", s: 2, c: "#EADFCB", d: "8.6s", delay: "2s"   },
  { l: "10%", t: "88%", s: 2, c: "#F7F3EC", d: "9.6s", delay: "1.1s" },
];

export default async function SignupPage() {
  const units = await getAllUnits();
  const tree = buildUnitTree(units);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,1fr) minmax(480px,2fr)", minHeight: "100vh" }}>

      {/* ── Left panel ── */}
      <div className="pol-left-panel" style={{ padding: "44px 40px", justifyContent: "flex-start", gap: 40 }}>

        {/* Star field */}
        <div style={{ position: "absolute", inset: "-14%", animation: "polDrift 94s linear infinite alternate" }}>
          {STARS.map((s, i) => (
            <div key={i} style={{
              position: "absolute", left: s.l, top: s.t,
              width: s.s, height: s.s, borderRadius: "50%",
              background: s.c, animation: `polTwinkle ${s.d} ease-in-out ${s.delay} infinite`,
            }} />
          ))}
        </div>

        {/* Logo + wordmark */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <PolarisLogo size={38} />
          <div style={{
            font: "700 36px/1 var(--font-poppins),sans-serif",
            letterSpacing: "-.01em",
            color: "#F7F3EC",
          }}>
            POLARIS
          </div>
        </div>

        {/* Steps — directly below logo */}
        <div style={{ position: "relative" }}>
          <div style={{ font: "600 18px/1.3 var(--font-manrope),sans-serif", color: "#F7F3EC", marginBottom: 24 }}>
            Request an account
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Step 1 */}
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ position: "relative", width: 26, height: 26, flexShrink: 0, borderRadius: "50%", background: "#B8892B", color: "#330916", font: "700 12px/26px var(--font-manrope),sans-serif", textAlign: "center" }}>
                1
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(184,137,43,.55)", animation: "polPulse 4.5s ease-out infinite" }} />
              </div>
              <div>
                <div style={{ font: "600 13.5px/1.3 var(--font-manrope),sans-serif", color: "#F7F3EC" }}>Identify yourself</div>
                <div style={{ font: "400 12.5px/1.5 var(--font-manrope),sans-serif", color: "rgba(247,243,236,.58)" }}>Name, CIT-U email, ID number</div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 26, height: 26, flexShrink: 0, borderRadius: "50%", border: "1.5px solid rgba(247,243,236,.35)", color: "rgba(247,243,236,.7)", font: "700 12px/23px var(--font-manrope),sans-serif", textAlign: "center" }}>2</div>
              <div>
                <div style={{ font: "600 13.5px/1.3 var(--font-manrope),sans-serif", color: "#F7F3EC" }}>Choose your unit</div>
                <div style={{ font: "400 12.5px/1.5 var(--font-manrope),sans-serif", color: "rgba(247,243,236,.58)" }}>The college, department, or office you submit for</div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 26, height: 26, flexShrink: 0, borderRadius: "50%", border: "1.5px solid rgba(247,243,236,.35)", color: "rgba(247,243,236,.7)", font: "700 12px/23px var(--font-manrope),sans-serif", textAlign: "center" }}>3</div>
              <div>
                <div style={{ font: "600 13.5px/1.3 var(--font-manrope),sans-serif", color: "#F7F3EC" }}>Wait for approval</div>
                <div style={{ font: "400 12.5px/1.5 var(--font-manrope),sans-serif", color: "rgba(247,243,236,.58)" }}>QAO reviews every request before access is granted</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Right panel — form ── */}
      <div style={{ padding: "44px 48px", background: "#ffffff", overflowY: "auto", display: "flex", alignItems: "flex-start" }}>
        <div style={{ width: "100%", maxWidth: 600 }}>
          <div style={{ font: "700 26px/1.2 var(--font-poppins),sans-serif", letterSpacing: "-.01em", color: "#1a0a10" }}>
            Sign up
          </div>
          <p style={{ margin: "8px 0 24px", font: "400 13.5px/1.6 var(--font-manrope),sans-serif", color: "rgba(32,26,29,.52)" }}>
            Accounts are tied to a single unit. If you submit for more than one office, request them separately.
          </p>
          <SignupForm tree={tree} />
        </div>
      </div>

    </div>
  );
}
