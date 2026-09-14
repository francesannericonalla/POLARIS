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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const selectedCollege = tree.academics.find((c) => c.id === collegeId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (password !== confirmPassword) {
      e.preventDefault();
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordError("");
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Full Name</label>
        <input name="full_name" required className="input-field" placeholder="Juan Dela Cruz" />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">CIT-U Email</label>
        <input name="email" type="email" required className="input-field" placeholder="juan.delacruz@cit.edu" />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">ID Number</label>
        <input
          name="id_number"
          required
          className="input-field"
          placeholder="e.g. 2277"
          maxLength={9}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Confirm Password</label>
        <input
          type="password"
          required
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {passwordError && (
          <p className="text-xs text-red-500 mt-1">{passwordError}</p>
        )}
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">I am from</label>
        <select
          className="input-field"
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value as "academics" | "administration" | "");
            setCollegeId("");
          }}
          required
        >
          <option value="">Please select</option>
          <option value="academics">Academics</option>
          <option value="administration">Administration</option>
        </select>
      </div>

      {branch === "academics" && (
        <>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">College</label>
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
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Department</label>
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
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Office</label>
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

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <SubmitButton pendingText={"Creating account…"} className="btn-primary w-full mt-2">
        Create Account
      </SubmitButton>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-maroon font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
