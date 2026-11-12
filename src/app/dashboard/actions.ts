"use server";

import { getCurrentProfile } from "@/lib/auth";
import { getAllOfficesForFolder, type PendingOffice } from "@/lib/data/dashboard";

export async function fetchAllOfficesForFolder(
  folderName: string[],
  branch: "all" | "academics" | "administration",
  schoolYear: string
): Promise<PendingOffice[]> {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved" || profile.role !== "qao") {
    throw new Error("Not authorized.");
  }
  return getAllOfficesForFolder(folderName, branch, schoolYear);
}
