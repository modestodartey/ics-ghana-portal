"use client";

import { useEffect, useState } from "react";
import { NotificationAlertSettings } from "@/components/notifications/notification-alert-settings";
import { SectionCard } from "@/components/ui/section-card";
import { formatAudienceLabel, formatNotificationDate, subscribeToNotifications } from "@/services/notifications";
import type { NotificationRecord } from "@/types/notification";

export function AdminNotificationsList() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(
      (nextNotifications) => {
        setNotifications(nextNotifications);
        setError(null);
        setIsLoading(false);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <SectionCard
      title="Sent notifications"
      description="A simple MVP history of notifications in Firestore, shown from newest to oldest."
      className="bg-white/95"
    >
      <div className="mb-4">
        <NotificationAlertSettings />
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Loading notifications...</p> : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
          No notifications have been sent yet.
        </div>
      ) : null}

      <div className="space-y-4">
        {notifications.map((notification) => (
          <article key={notification.id} className="rounded-[1.5rem] border border-brand-100 bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-xl text-slate-900">{notification.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{notification.body}</p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                {notification.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
              <p>Audience: {formatAudienceLabel(notification)}</p>
              <p>Created by: {notification.createdByEmail || "Unknown sender"}</p>
              <p>Created: {formatNotificationDate(notification.createdAt)}</p>
              <p>Read by: {notification.readBy.length} user(s)</p>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
