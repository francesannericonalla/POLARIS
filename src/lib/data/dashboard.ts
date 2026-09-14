import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllUnits, type Unit } from "@/lib/data/units";

export type UnitSummary = Unit & {
  activeDocumentCount: number;
  lastUpdate: string | null;
};

// Basic, decision-free dashboard data: how many active documents each
// unit has, and when it last received one. No Complete/Pending status
// and no computed KPI scores -- those are intentionally not built yet,
// pending the checklist/data-source decisions in the proposal doc.
export async function getUnitSummaries(branch?: "academics" | "administration"): Promise<UnitSummary[]> {
  const admin = createAdminClient();
  const allUnits = await getAllUnits();
  const units = branch ? allUnits.filter((u) => u.branch === branch) : allUnits;
  const leafUnits = units.filter((u) => u.type !== "college"); // colleges are just groupings, not repositories

  const { data: docs, error } = await admin
    .from("documents")
    .select("unit_id, created_at")
    .eq("is_latest", true)
    .eq("archived", false);
  if (error) throw error;

  const byUnit = new Map<string, { count: number; last: string | null }>();
  for (const d of docs as { unit_id: string; created_at: string }[]) {
    const entry = byUnit.get(d.unit_id) ?? { count: 0, last: null };
    entry.count += 1;
    if (!entry.last || d.created_at > entry.last) entry.last = d.created_at;
    byUnit.set(d.unit_id, entry);
  }

  return leafUnits.map((u) => ({
    ...u,
    activeDocumentCount: byUnit.get(u.id)?.count ?? 0,
    lastUpdate: byUnit.get(u.id)?.last ?? null,
  }));
}
