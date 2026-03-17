"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { PageShell } from "@/components/layout/page-shell";
import { SectionCard } from "@/components/ui/section-card";
import { useAuth } from "@/components/auth/auth-provider";
import { DASHBOARD_ROUTES, getRoleLabel } from "@/lib/auth";
import type { UserRole } from "@/types/auth";

type ProtectedPageProps = {
  allowedRole: UserRole;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function ProtectedPage({
  allowedRole,
  eyebrow,
  title,
  description,
  children
}: ProtectedPageProps) {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <PageShell eyebrow={eyebrow} title={title} description={description} compact>
        <SectionCard
          title="Checking access"
          description="Please wait while we confirm your login session and portal role."
        />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell eyebrow={eyebrow} title={title} description={description} compact>
        <SectionCard
          title="Redirecting to login"
          description="You need to sign in before you can continue to this portal area."
        />
      </PageShell>
    );
  }

  if (user.role !== allowedRole) {
    return (
      <PageShell eyebrow={eyebrow} title={title} description={description} compact>
        <SectionCard
          title="Access denied"
          description={`You are signed in as a ${getRoleLabel(user.role)}, so this page is not available to your account.`}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={DASHBOARD_ROUTES[user.role]}
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Go to my portal
            </Link>
            <LogoutButton />
          </div>
        </SectionCard>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow={eyebrow} title={title} description={description} compact>
      {children}
    </PageShell>
  );
}
