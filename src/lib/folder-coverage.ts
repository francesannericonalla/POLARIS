import type { FolderSubmissionStat } from "@/lib/data/dashboard";

export type CoverageBranch = "all" | "academics" | "administration";

export type FolderCoverageStat = Omit<FolderSubmissionStat, "branch"> & {
  branch: CoverageBranch;
  folder_names: string[];
};

const SHARED_CATEGORY_NAMES: Record<string, string> = {
  "Faculty Evaluation": "Office / Faculty Evaluation",
  "Office Evaluation": "Office / Faculty Evaluation",
  "Research Undertaking": "Research Undertakings",
  "Research Undertakings": "Research Undertakings",
};

export function buildFolderCoverage(
  stats: FolderSubmissionStat[],
  branch: CoverageBranch
): FolderCoverageStat[] {
  const coverage = new Map<string, FolderCoverageStat>();
  for (const stat of stats) {
    if (branch !== "all" && stat.branch !== branch) continue;
    const name = branch === "all"
      ? SHARED_CATEGORY_NAMES[stat.folder_name] ?? stat.folder_name
      : stat.folder_name;
    const existing = coverage.get(name);
    if (existing) {
      existing.submitted += stat.submitted;
      existing.total += stat.total;
      if (!existing.folder_names.includes(stat.folder_name)) {
        existing.folder_names.push(stat.folder_name);
      }
    } else {
      coverage.set(name, {
        folder_name: name,
        folder_names: [stat.folder_name],
        branch,
        submitted: stat.submitted,
        total: stat.total,
      });
    }
  }
  return [...coverage.values()];
}
