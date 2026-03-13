"use client";

import { BrandLogo } from "@/components/layout/brand-logo";
import { LoginForm } from "@/components/auth/login-form";
import { SectionCard } from "@/components/ui/section-card";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:p-6">
      <button
        type="button"
        aria-label="Close login modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative z-10 grid w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-brand-100/80 bg-white shadow-soft max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] lg:grid-cols-[0.78fr_1fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 p-5 text-white sm:p-6">
          <div className="space-y-4">
            <BrandLogo inverted className="items-start" />
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-brand-100">Login</p>
              <h2 id="login-modal-title" className="font-display text-2xl leading-tight sm:text-3xl">
                Sign in to the ICS Ghana portal
              </h2>
              <p className="text-sm leading-6 text-brand-50/90">
                Use the same secure sign-in flow to access the correct role-based portal for administrators and students.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-3.5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">Approved domains</p>
              <p className="mt-2 text-sm leading-6 text-white/90">Approved portal email accounts only</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/15 bg-white/10 p-3.5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">Role routing</p>
              <p className="mt-2 text-sm leading-6 text-white/90">
                Admins go to the admin portal, students go to the student portal.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-start px-5 py-5 sm:px-6 sm:py-6 lg:px-7">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-100 bg-white text-lg text-slate-600 shadow-soft hover:border-brand-200 hover:text-brand-700"
            aria-label="Close login modal"
          >
            ×
          </button>

          <div className="mx-auto w-full max-w-lg space-y-3 pt-10 sm:pt-8">
            <SectionCard
              title="Sign in"
              description="Enter your approved email address and password to continue."
              className="border-brand-100 bg-white p-5 sm:p-6"
            >
              <LoginForm />
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
