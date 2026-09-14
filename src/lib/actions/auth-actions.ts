"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SignupState = { error?: string };

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const unitId = String(formData.get("unit_id") || "");

  if (!email || !email.endsWith("@cit.edu")) {
    return { error: "Please use your official CIT-U email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!fullName) {
    return { error: "Please enter your full name." };
  }
  if (!unitId) {
    return { error: "Please select your college/department or office." };
  }

  const admin = createAdminClient();

  // Reject signup if the unit doesn't exist, or is the QAO unit
  // (QAO accounts are provisioned directly by QAO/MIS, not self-signup).
  const { data: unit } = await admin.from("units").select("id, is_qao, type").eq("id", unitId).single();
  if (!unit || unit.type === "college" || unit.is_qao) {
    return { error: "Please select a valid department or office, not a college." };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    return { error: createErr.message.includes("already") ? "An account with this email already exists." : createErr.message };
  }

  const { error: profileErr } = await admin.from("profiles").insert({
    id: created.user.id,
    email,
    full_name: fullName,
    role: "office_user",
    status: "pending",
    unit_id: unitId,
  });

  if (profileErr) {
    return { error: "Account created but profile setup failed. Please contact QAO." };
  }

  redirect("/login?registered=1");
}

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
