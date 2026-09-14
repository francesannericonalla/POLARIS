"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { login, type LoginState } from "@/lib/actions/auth-actions";
import { useSearchParams } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { PolarisLogo } from "@/components/polaris-logo";

const initialState: LoginState = {};

function RegisteredBanner() {
  const params = useSearchParams();
  if (params?.get("registered") !== "1") return null;
  return (
    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
      Account created. You can log in now, but you&apos;ll need QAO approval before you can upload documents.
    </p>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-maroon-dark relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-gold" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-gold translate-x-16 translate-y-16" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full border border-gold" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo + wordmark above card */}
        <div className="flex flex-col items-center mb-8">
          <PolarisLogo size={52} />
          <h1 className="text-2xl font-bold text-gold tracking-widest uppercase mt-3">POLARIS</h1>
          <p className="text-white/50 text-xs tracking-wide mt-1">CIT-U Quality Assurance Office</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Sign in to your account</h2>

          <RegisteredBanner />

          <form action={formAction} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">CIT-U Email</label>
              <input name="email" type="email" required className="input-field" placeholder="juan.delacruz@cit.edu" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Password</label>
              <input name="password" type="password" required className="input-field" />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
            )}

            <SubmitButton pendingText={"Signing in\u2026"} className="btn-primary w-full mt-2">
              Sign In
            </SubmitButton>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            No account yet?{" "}
            <Link href="/signup" className="text-maroon font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

