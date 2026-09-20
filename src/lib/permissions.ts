import "server-only";
import type { Profile } from "@/lib/auth";

// QAO can see every unit's repository and dashboard. Office users can
// only see their own unit. System Administrator manages accounts only —
// they must never access document contents.
export function canAccessUnitRepository(profile: Profile, unitId: string): boolean {
  if (profile.status !== "approved") return false;
  if (profile.role === "system_admin") return false;
  if (profile.role === "qao") return true;
  if (profile.role === "office_user") return profile.unit_id === unitId;
  return false;
}

// Only the office's own approved user can upload. QAO is read-only — they
// review submissions, not submit on behalf of offices.
export function canUploadToUnit(profile: Profile, unitId: string): boolean {
  return profile.status === "approved" && profile.role === "office_user" && profile.unit_id === unitId;
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
