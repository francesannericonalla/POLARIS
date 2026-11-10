"use server";

import { getAllOfficesForFolder, type PendingOffice } from "@/lib/data/dashboard";

export async function fetchAllOfficesForFolder(
  folderName: string,
  branch: "academics" | "administration",
  schoolYear: string
): Promise<PendingOffice[]> {
  return getAllOfficesForFolder(folderName, branch, schoolYear);
}
