import type { Unit } from "@/lib/data/units";

export type UnitSearchResult = {
  id: string;
  name: string;
  type: "department" | "office";
  context: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function acronym(name: string): string {
  return normalize(name).split(" ").filter((word) => !["of", "and", "the", "for"].includes(word)).map((word) => word[0]).join("");
}

export function searchUnits(units: Unit[], query: string): UnitSearchResult[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (normalize(query).length < 2) return [];
  const byId = new Map(units.map((unit) => [unit.id, unit]));
  return units.flatMap((unit): UnitSearchResult[] => {
    if (unit.type === "college") return [];
    const parent = unit.parent_id ? byId.get(unit.parent_id) : undefined;
    const context = parent?.name ?? (unit.branch === "academics" ? "Academics" : "Administration");
    const searchable = `${normalize(unit.name)} ${normalize(context)} ${acronym(unit.name)} ${parent ? acronym(parent.name) : ""}`;
    if (!terms.every((term) => searchable.includes(term))) return [];
    return [{ id: unit.id, name: unit.name, type: unit.type, context }];
  }).sort((a, b) => {
    const aStarts = normalize(a.name).startsWith(normalize(query));
    const bStarts = normalize(b.name).startsWith(normalize(query));
    return Number(bStarts) - Number(aStarts) || a.name.localeCompare(b.name);
  });
}
