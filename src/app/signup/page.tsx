import { getAllUnits, buildUnitTree } from "@/lib/data/units";
import SignupForm from "./signup-form";
import { StarField } from "@/components/star-field";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const units = await getAllUnits();
  const tree = buildUnitTree(units);

  return (
    <div className="lf-root">

      {/* ── Background: same CIT-U building as login ── */}
      <div className="lf-bg" aria-hidden="true" />

      {/* ── Blinking star field ── */}
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

      {/* ── Right: signup card ── */}
      <div className="lf-right lf-right--signup">
        <div className="lf-card lf-card--signup">
          <h1 className="lf-heading">Request an account</h1>
          <p className="lf-subheading">
            After submitting, your account will be reviewed and approved by the QAO before access is granted.
          </p>
          <SignupForm tree={tree} />
        </div>
      </div>

    </div>
  );
}
