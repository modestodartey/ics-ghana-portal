"use client";

import { LoginModalTrigger } from "@/components/auth/login-modal-trigger";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/components/auth/auth-provider";

export function HeaderAuthControls() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return <p className="text-sm font-medium text-slate-500">Checking session...</p>;
  }

  if (!user) {
    return (
      <LoginModalTrigger
        label="Portal Sign In"
        className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="rounded-2xl border border-brand-100 bg-white px-4 py-2 text-right shadow-soft">
        <p className="text-sm font-semibold text-slate-900">{user.displayName}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-brand-700">{user.role}</p>
      </div>
      <LogoutButton compact />
    </div>
  );
}
