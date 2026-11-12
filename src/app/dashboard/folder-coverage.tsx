import { buildFolderCoverage, type CoverageBranch } from "@/lib/folder-coverage";
import type { FolderSubmissionStat } from "@/lib/data/dashboard";
import { FolderCoverageWithDrawer } from "./folder-coverage-drawer";

export function FolderCoverage({
  stats,
  branch,
  schoolYear,
}: {
  stats: FolderSubmissionStat[];
  branch: CoverageBranch;
  schoolYear: string;
}) {
  const coverage = buildFolderCoverage(stats, branch);
  if (coverage.length === 0) {
    return <p className="text-sm text-center py-10" style={{ color: "var(--ou-muted)" }}>No data available.</p>;
  }

  return (
    <FolderCoverageWithDrawer
      key={`${branch}:${schoolYear}`}
      title=""
      subtitle=""
      stats={coverage}
      accentColor=""
      accentHex={branch === "administration" ? "#B8892B" : "#7A1330"}
      schoolYear={schoolYear}
      compact
    />
  );
}
