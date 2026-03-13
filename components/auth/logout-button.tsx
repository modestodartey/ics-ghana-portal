"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { useAuth } from "@/components/auth/auth-provider";

type LogoutButtonProps = {
  compact?: boolean;
  className?: string;
};

export function LogoutButton({ compact = false, className }: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await logout();
      router.replace("/login");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-brand-200 bg-white font-semibold text-brand-700 shadow-soft hover:border-brand-500 disabled:cursor-not-allowed disabled:text-brand-400",
        compact ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm",
        className
      )}
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
