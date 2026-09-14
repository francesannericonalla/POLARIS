import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Unit = {
  id: string;
  name: string;
  type: "college" | "department" | "office";
  branch: "academics" | "administration";
  parent_id: string | null;
  is_qao: boolean;
  sort_order: number;
};

// Full tree, used to render the sidebar and the signup dropdown.
export async function getAllUnits(): Promise<Unit[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("units")
    .select("id, name, type, branch, parent_id, is_qao, sort_order")
    .order("branch")
    .order("sort_order");

  if (error) throw error;
  return data as Unit[];
}

export async function getUnitById(id: string): Promise<Unit | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("units")
    .select("id, name, type, branch, parent_id, is_qao, sort_order")
    .eq("id", id)
    .single();
  return data as Unit | null;
}

// Shapes the flat unit list into the tree the sidebar/signup form need:
// Colleges with their departments nested, and offices as a flat list.
export function buildUnitTree(units: Unit[]) {
  const colleges = units.filter((u) => u.type === "college");
  const departments = units.filter((u) => u.type === "department");
  const offices = units.filter((u) => u.type === "office");

  return {
    academics: colleges
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((college) => ({
        ...college,
        departments: departments
          .filter((d) => d.parent_id === college.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      })),
    administration: offices.sort((a, b) => a.sort_order - b.sort_order),
  };
}
