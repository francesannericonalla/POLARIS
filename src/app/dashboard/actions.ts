"use server";

import { getPendingOfficesForFolder, type PendingOffice } from "@/lib/data/dashboard";

export async function fetchPendingOffices(
  folderName: string,
  branch: "academics" | "administration",
  schoolYear: string
): Promise<PendingOffice[]> {
  return getPendingOfficesForFolder(folderName, branch, schoolYear);
}
