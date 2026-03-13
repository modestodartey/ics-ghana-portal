"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { useNotificationAlerts } from "@/components/notifications/notification-alert-provider";
import { cn } from "@/utils/cn";
import type { UserRole } from "@/types/auth";

type PortalQuickLinksProps = {
  className?: string;
  disabledClassName?: string;
};

type QuickLinkItem = {
  id: "notifications" | "tracking" | "find-my-device";
  label: string;
  adminHref: string | null;
  studentHref: string;
};

const QUICK_LINKS: QuickLinkItem[] = [
  {
    id: "notifications",
    label: "Notifications",
    adminHref: "/admin#notifications",
    studentHref: "/student#notifications"
  },
  {
    id: "tracking",
    label: "Tracking",
    adminHref: "/admin#tracking",
    studentHref: "/student#tracking"
  },
  {
    id: "find-my-device",
    label: "Find My Device",
    adminHref: null,
    studentHref: "/student#find-my-device"
  }
];

function getQuickLinkHref(item: QuickLinkItem, role: UserRole | null) {
  if (!role) {
    return `/#${item.id}`;
  }

  if (role === "admin") {
    return item.adminHref;
  }

  return item.studentHref;
}

export function PortalQuickLinks({ className, disabledClassName }: PortalQuickLinksProps) {
  const { user } = useAuth();
  const { unreadCount } = useNotificationAlerts();
  const role = user?.role ?? null;

  return (
    <>
      {QUICK_LINKS.map((item) => {
        const href = getQuickLinkHref(item, role);

        if (!href) {
          return (
            <span
              key={item.id}
              aria-disabled="true"
              title="Find My Device Lite is currently available in the student portal only."
              className={cn("cursor-default opacity-55", className, disabledClassName)}
            >
              {item.label}
            </span>
          );
        }

        return (
          <Link key={item.id} href={href} className={className}>
            <span className="inline-flex items-center gap-2">
              <span>{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 ? (
                <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </>
  );
}
