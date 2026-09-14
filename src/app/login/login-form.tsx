"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { login, type LoginState } from "@/lib/actions/auth-actions";
import { useSearchParams } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";

const initialState: LoginState = {};

function RegisteredBanner() {
  const params = useSearchParams();
  if (params?.get("registered") !== "1") return null;
  return (
    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
      Account created. You can log in now, but you&apos;ll need QAO approval before you can upload documents.
    </p>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-maroon relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute bg-maroon-dark"
            style={{
              right: `${i * 70}px`,
              top: `${-40 + i * 0}px`,
              width: "60px",
              height: `${40 + i * 70}px`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 card p-10 shadow-xl">
        <h1 className="text-4xl font-bold text-maroon text-center">POLARIS</h1>
        <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
          Performance &amp; Organization Leadership
          <br />
          Analytics, Reporting &amp; Institutional Stewardship
        </p>
        <div className="w-6 h-1 bg-gold mx-auto mt-4 mb-6" />

        <RegisteredBanner />

        <form action={formAction} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 block mb-1">CIT-U Email</label>
            <input name="email" type="email" required className="input-field" placeholder="juan.delacruz@cit.edu" />
          </div>
          <div>
            <label className="text-sm text-gray-700 block mb-1">Password</label>
            <input name="password" type="password" required className="input-field" />
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <SubmitButton pendingText={"Logging in\u2026"} className="btn-primary w-full">
            Log In
          </SubmitButton>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account yet?{" "}
          <Link href="/signup" className="text-maroon font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

