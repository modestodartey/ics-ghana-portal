"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { DASHBOARD_ROUTES, getSchoolEmailErrorMessage, isSchoolEmail } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const { signIn, user, status, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace(DASHBOARD_ROUTES[user.role]);
    }
  }, [router, user]);

  const isSubmitting = status === "loading";
  const errorMessage = formError ?? authError;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError("Please enter your email and password.");
      return;
    }

    if (!isSchoolEmail(email)) {
      setFormError(getSchoolEmailErrorMessage());
      return;
    }

    try {
      const appUser = await signIn({ email, password });
      router.replace(DASHBOARD_ROUTES[appUser.role]);
    } catch (caughtError) {
      setFormError(caughtError instanceof Error ? caughtError.message : "We could not sign you in right now.");
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="modest.dartey@icsghana.info"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-brand-500"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-brand-500"
        />
      </label>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <p className="text-sm leading-6 text-slate-500">Sign in with your approved portal email address.</p>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-xs leading-6 text-slate-500">Use your approved email address to continue to the portal.</p>
      </div>
    </form>
  );
}
