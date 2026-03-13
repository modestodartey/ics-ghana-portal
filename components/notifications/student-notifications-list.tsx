"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { NotificationAlertSettings } from "@/components/notifications/notification-alert-settings";
import { SectionCard } from "@/components/ui/section-card";
import {
  canUserViewNotification,
  formatAudienceLabel,
  formatNotificationDate,
  hasUserReadNotification,
  markNotificationAsRead,
  subscribeToNotifications
} from "@/services/notifications";
import type { NotificationRecord } from "@/types/notification";

export function StudentNotificationsList() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReadIds, setPendingReadIds] = useState<string[]>([]);

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

  const visibleNotifications = useMemo(() => {
    if (!user) {
      return [];
    }

    return notifications.filter((notification) => canUserViewNotification(notification, user));
  }, [notifications, user]);

  async function handleMarkAsRead(notificationId: string) {
    if (!user) {
      return;
    }

    setPendingReadIds((currentIds) => [...currentIds, notificationId]);

    try {
      await markNotificationAsRead(notificationId, user.uid);
    } catch {
      setError("We could not update the read status right now. Please try again.");
    } finally {
      setPendingReadIds((currentIds) => currentIds.filter((currentId) => currentId !== notificationId));
    }
  }

  return (
    <SectionCard
      title="In-app notifications"
      description="Notifications are shown from newest to oldest and can be marked as read inside the portal."
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

      {!isLoading && !error && visibleNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
          No notifications are available for your account yet.
        </div>
      ) : null}

      <div className="space-y-4">
        {visibleNotifications.map((notification) => {
          const isRead = user ? hasUserReadNotification(notification, user.uid) : false;
          const isPending = pendingReadIds.includes(notification.id);

          return (
            <article
              key={notification.id}
              className="rounded-[1.5rem] border border-brand-100 bg-white p-4 shadow-soft"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl text-slate-900">{notification.title}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        isRead ? "bg-slate-100 text-slate-600" : "bg-brand-50 text-brand-700"
                      }`}
                    >
                      {isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{notification.body}</p>
                </div>

                {!isRead ? (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500 disabled:cursor-not-allowed disabled:text-brand-300"
                  >
                    {isPending ? "Saving..." : "Mark as read"}
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                <p>Audience: {formatAudienceLabel(notification)}</p>
                <p>Sent by: {notification.createdByEmail || "ICS Ghana"}</p>
                <p>Created: {formatNotificationDate(notification.createdAt)}</p>
                <p>Status: {isRead ? "You have read this notification." : "New for you."}</p>
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
