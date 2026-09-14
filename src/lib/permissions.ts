import "server-only";
import type { Profile } from "@/lib/auth";

// QAO can see every unit's repository and dashboard. Office users can
// only see their own unit. System Administrator manages accounts, not
// document contents, so it is deliberately NOT included here.
export function canAccessUnitRepository(profile: Profile, unitId: string): boolean {
  if (profile.status !== "approved") return false;
  if (profile.role === "qao") return true;
  if (profile.role === "office_user") return profile.unit_id === unitId;
  return false;
}

// Anyone approved can upload to a folder inside a unit they can access.
export function canUploadToUnit(profile: Profile, unitId: string): boolean {
  return canAccessUnitRepository(profile, unitId);
}

// Archiving a file: QAO can archive/restore anything. An office user
// can only archive their own unit's files, and only ones they can see
// (never a hard delete -- see documents.ts, this only ever flips a flag).
export function canArchiveDocument(profile: Profile, documentUnitId: string): boolean {
  return canAccessUnitRepository(profile, documentUnitId);
}

export function isQao(profile: Profile): boolean {
  return profile.role === "qao";
}

export function isSystemAdmin(profile: Profile): boolean {
  return profile.role === "system_admin";
}
