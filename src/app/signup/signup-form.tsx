"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";

type College = { id: string; name: string; departments: { id: string; name: string }[] };
type Office = { id: string; name: string };
type Tree = { academics: College[]; administration: Office[] };

const initialState: SignupState = {};

export default function SignupForm({ tree }: { tree: Tree }) {
  const [state, formAction] = useFormState(signup, initialState);
  const [branch, setBranch] = useState<"academics" | "administration" | "">("");
  const [collegeId, setCollegeId] = useState("");

  const selectedCollege = tree.academics.find((c) => c.id === collegeId);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-sm text-gray-700 block mb-1">Full Name</label>
        <input name="full_name" required className="input-field" placeholder="Juan Dela Cruz" />
      </div>

      <div>
        <label className="text-sm text-gray-700 block mb-1">CIT-U Email</label>
        <input name="email" type="email" required className="input-field" placeholder="juan.delacruz@cit.edu" />
      </div>

      <div>
        <label className="text-sm text-gray-700 block mb-1">Password</label>
        <input name="password" type="password" required minLength={8} className="input-field" />
        <p className="text-xs text-gray-400 mt-1">At least 8 characters.</p>
      </div>

      <div>
        <label className="text-sm text-gray-700 block mb-1">I am from</label>
        <select
          className="input-field"
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value as "academics" | "administration" | "");
            setCollegeId("");
          }}
          required
        >
          <option value="">Select Academics or Administration</option>
          <option value="academics">Academics</option>
          <option value="administration">Administration</option>
        </select>
      </div>

      {branch === "academics" && (
        <>
          <div>
            <label className="text-sm text-gray-700 block mb-1">College</label>
            <select className="input-field" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} required>
              <option value="">Select your college</option>
              {tree.academics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCollege && (
            <div>
              <label className="text-sm text-gray-700 block mb-1">Department</label>
              <select name="unit_id" className="input-field" required defaultValue="">
                <option value="">Select your department</option>
                {selectedCollege.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {branch === "administration" && (
        <div>
          <label className="text-sm text-gray-700 block mb-1">Office</label>
          <select name="unit_id" className="input-field" required defaultValue="">
            <option value="">Select your office</option>
            {tree.administration.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton pendingText={"Creating account\u2026"} className="btn-primary w-full">
        Create Account
      </SubmitButton>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-maroon font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
