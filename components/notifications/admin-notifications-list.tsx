"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useNotificationAlerts } from "@/components/notifications/notification-alert-provider";
import { NotificationAlertSettings } from "@/components/notifications/notification-alert-settings";
import { SectionCard } from "@/components/ui/section-card";
import { getSchoolEmailErrorMessage } from "@/lib/auth";
import { deleteAdminNotification, updateAdminNotification } from "@/services/admin-notifications";
import {
  formatAudienceLabel,
  formatNotificationDate,
  formatNotificationReadDate,
  getNotificationViewedCount,
  notificationAudienceOptions,
  parseTargetEmails,
  subscribeToNotifications,
  validateTargetEmails
} from "@/services/notifications";
import type { NotificationAudienceType, NotificationFormState, NotificationRecord } from "@/types/notification";

const initialEditFormState: NotificationFormState = {
  title: "",
  body: "",
  audienceType: "all_users",
  targetEmailsText: ""
};

const FULL_PAGE_SIZE = 8;

type AdminNotificationsListProps = {
  variant?: "dashboard" | "page";
  limit?: number;
};

type NotificationStatusFilter = "all" | "active" | "viewed" | "not_viewed";
type NotificationDateFilter = "all" | "last_7_days" | "last_30_days";

function truncateText(value: string, maxLength: number) {
  const cleanedValue = value.trim().replace(/\s+/g, " ");

  if (cleanedValue.length <= maxLength) {
    return cleanedValue;
  }

  return `${cleanedValue.slice(0, maxLength).trimEnd()}...`;
}

function normalizeDisplayText(value: string) {
  const cleanedValue = value.trim().replace(/\s+/g, " ");

  if (!cleanedValue) {
    return "";
  }

  const correctedValue = cleanedValue.replace(/\banouncement\b/gi, "announcement");
  const isAllUppercase = correctedValue === correctedValue.toUpperCase() && /[A-Z]/.test(correctedValue);

  if (!isAllUppercase) {
    return correctedValue;
  }

  return correctedValue.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

function matchesDateFilter(notification: NotificationRecord, dateFilter: NotificationDateFilter) {
  if (dateFilter === "all" || !notification.createdAt) {
    return true;
  }

  const ageMs = Date.now() - notification.createdAt.getTime();
  const thresholdMs = dateFilter === "last_7_days" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

  return ageMs <= thresholdMs;
}

export function AdminNotificationsList({
  variant = "page",
  limit = 4
}: AdminNotificationsListProps) {
  const { user } = useAuth();
  const { pushToast } = useNotificationAlerts();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [detailsNotificationId, setDetailsNotificationId] = useState<string | null>(null);
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState<NotificationFormState>(initialEditFormState);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [audienceFilter, setAudienceFilter] = useState<NotificationAudienceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<NotificationStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<NotificationDateFilter>("all");

  const isDashboard = variant === "dashboard";

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, audienceFilter, statusFilter, dateFilter]);

  function updateEditField<Key extends keyof NotificationFormState>(
    field: Key,
    value: NotificationFormState[Key]
  ) {
    setEditFormState((currentState) => ({
      ...currentState,
      [field]: value
    }));
  }

  function handleStartEditing(notification: NotificationRecord) {
    setEditingNotificationId(notification.id);
    setDetailsNotificationId(notification.id);
    setStatusMessage(null);
    setError(null);
    setEditFormState({
      title: notification.title,
      body: notification.body,
      audienceType: notification.audienceType,
      targetEmailsText: notification.targetEmails.join("\n")
    });
  }

  function handleCancelEditing() {
    setEditingNotificationId(null);
    setEditFormState(initialEditFormState);
  }

  async function handleDelete(notification: NotificationRecord) {
    if (!user || notification.createdByUid !== user.uid) {
      setError("Only the admin who created this notification can delete it.");
      return;
    }

    const shouldDelete = window.confirm(
      `Delete "${normalizeDisplayText(notification.title)}"? This will remove it from the portal for everyone.`
    );

    if (!shouldDelete) {
      return;
    }

    setPendingDeleteId(notification.id);
    setError(null);
    setStatusMessage(null);

    try {
      await deleteAdminNotification(notification.id);
      setStatusMessage("Notification deleted successfully.");
      pushToast({
        title: "Notification deleted",
        message: "The selected notification was removed successfully.",
        tone: "success"
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "We could not delete that notification right now.");
    } finally {
      setPendingDeleteId(null);
    }
  }

  async function handleSaveEdit(notification: NotificationRecord) {
    if (!user || notification.createdByUid !== user.uid) {
      setError("Only the admin who created this notification can edit it.");
      return;
    }

    if (!editFormState.title.trim() || !editFormState.body.trim()) {
      setError("Please enter both a notification title and message.");
      return;
    }

    const targetEmails =
      editFormState.audienceType === "specific_emails"
        ? parseTargetEmails(editFormState.targetEmailsText)
        : [];

    if (editFormState.audienceType === "specific_emails" && targetEmails.length === 0) {
      setError("Please enter at least one email address for the specific email audience.");
      return;
    }

    if (editFormState.audienceType === "specific_emails" && !validateTargetEmails(targetEmails)) {
      setError(getSchoolEmailErrorMessage());
      return;
    }

    setPendingEditId(notification.id);
    setError(null);
    setStatusMessage(null);

    try {
      await updateAdminNotification(notification.id, {
        title: editFormState.title,
        body: editFormState.body,
        audienceType: editFormState.audienceType,
        targetEmails
      });

      setEditingNotificationId(null);
      setEditFormState(initialEditFormState);
      setStatusMessage("Notification updated successfully.");
      pushToast({
        title: "Notification updated",
        message: "The selected notification was updated successfully.",
        tone: "success"
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "We could not update that notification right now.");
    } finally {
      setPendingEditId(null);
    }
  }

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return notifications.filter((notification) => {
      const viewedCount = getNotificationViewedCount(notification);
      const matchesAudience = audienceFilter === "all" ? true : notification.audienceType === audienceFilter;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? notification.active
            : statusFilter === "viewed"
              ? viewedCount > 0
              : viewedCount === 0;
      const matchesSearch = normalizedSearch
        ? notification.title.toLowerCase().includes(normalizedSearch) ||
          notification.body.toLowerCase().includes(normalizedSearch) ||
          notification.createdByEmail.toLowerCase().includes(normalizedSearch) ||
          formatAudienceLabel(notification).toLowerCase().includes(normalizedSearch)
        : true;

      return matchesAudience && matchesStatus && matchesSearch && matchesDateFilter(notification, dateFilter);
    });
  }, [audienceFilter, dateFilter, notifications, searchValue, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredNotifications.length / FULL_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const visibleNotifications = isDashboard
    ? filteredNotifications.slice(0, limit)
    : filteredNotifications.slice((safeCurrentPage - 1) * FULL_PAGE_SIZE, safeCurrentPage * FULL_PAGE_SIZE);

  const summary = useMemo(
    () => ({
      total: notifications.length,
      viewed: notifications.filter((notification) => getNotificationViewedCount(notification) > 0).length,
      emailIssues: notifications.filter((notification) => notification.emailFailedCount > 0).length
    }),
    [notifications]
  );

  return (
    <SectionCard
      title={isDashboard ? "Notifications preview" : "Notifications"}
      description={
        isDashboard
          ? "Recent notifications stay visible here, while the full history lives on its own admin page."
          : "Search, filter, and manage sent notifications from one dedicated admin page."
      }
      className="bg-white/95"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-6 text-slate-500">
          {isDashboard
            ? `${notifications.length} total notification${notifications.length === 1 ? "" : "s"}`
            : `${filteredNotifications.length} notification${filteredNotifications.length === 1 ? "" : "s"} found`}
        </div>
        <Link
          href="/admin/notifications"
          className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500"
        >
          {isDashboard ? "View all notifications" : "Return to dashboard"}
        </Link>
      </div>

      {!isDashboard ? (
        <>
          <div className="mt-4">
            <NotificationAlertSettings />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-brand-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{isLoading ? "—" : summary.total}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Viewed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{isLoading ? "—" : summary.viewed}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Email issues</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{isLoading ? "—" : summary.emailIssues}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_220px_220px_220px]">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Search notifications</span>
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by title, message, sender, or audience"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Audience filter</span>
              <select
                value={audienceFilter}
                onChange={(event) => setAudienceFilter(event.target.value as NotificationAudienceType | "all")}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
              >
                <option value="all">All audiences</option>
                {notificationAudienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Status filter</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as NotificationStatusFilter)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="viewed">Viewed only</option>
                <option value="not_viewed">Not viewed yet</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Date filter</span>
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value as NotificationDateFilter)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
              >
                <option value="all">All dates</option>
                <option value="last_7_days">Last 7 days</option>
                <option value="last_30_days">Last 30 days</option>
              </select>
            </label>
          </div>
        </>
      ) : null}

      {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading notifications...</p> : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-700">
          {statusMessage}
        </div>
      ) : null}

      {!isLoading && !error && visibleNotifications.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
          {isDashboard ? "No notifications have been sent yet." : "No notifications match the current filters."}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        {visibleNotifications.map((notification) => {
          const viewedCount = getNotificationViewedCount(notification);
          const canManage = Boolean(user && notification.createdByUid === user.uid);
          const isEditing = editingNotificationId === notification.id;
          const isShowingDetails = detailsNotificationId === notification.id;
          const canEdit = canManage && viewedCount === 0;

          return (
            <article key={notification.id} className="rounded-[1.35rem] border border-brand-100 bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl text-slate-900">
                      {normalizeDisplayText(notification.title)}
                    </h3>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                      {notification.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {truncateText(normalizeDisplayText(notification.body), isDashboard ? 110 : 170)}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2 xl:grid-cols-3">
                    <p>Audience: {formatAudienceLabel(notification)}</p>
                    <p>Created: {formatNotificationDate(notification.createdAt)}</p>
                    <p>Viewed: {viewedCount}</p>
                    <p>Email sent: {notification.emailSentCount}</p>
                    <p>Email failed: {notification.emailFailedCount}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setDetailsNotificationId((currentId) =>
                        currentId === notification.id ? null : notification.id
                      )
                    }
                    className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500"
                  >
                    {isShowingDetails ? "Hide details" : "Details"}
                  </button>

                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => handleStartEditing(notification)}
                      className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500"
                    >
                      Edit
                    </button>
                  ) : null}

                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(notification);
                      }}
                      disabled={pendingDeleteId === notification.id}
                      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:border-red-400 disabled:cursor-not-allowed disabled:text-red-300"
                    >
                      {pendingDeleteId === notification.id ? "Deleting..." : "Delete"}
                    </button>
                  ) : null}
                </div>
              </div>

              {canManage && !canEdit && viewedCount > 0 ? (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Editing is locked after the first recorded view so the read history stays clear.
                </p>
              ) : null}

              {isShowingDetails ? (
                <div className="mt-4 rounded-[1.35rem] border border-brand-100 bg-brand-50/40 p-4">
                  <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Full message</p>
                    <p className="mt-2 leading-7">{normalizeDisplayText(notification.body)}</p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                      Read details
                    </p>
                    {notification.readDetails.length === 0 ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {notification.readBy.length > 0
                          ? "Older view counts exist for this notification, but detailed names and timestamps were not stored before the newer read-details upgrade."
                          : "No detailed views have been recorded for this notification yet."}
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {[...notification.readDetails]
                          .sort((left, right) => {
                            const leftTime = left.readAt?.getTime() ?? 0;
                            const rightTime = right.readAt?.getTime() ?? 0;
                            return rightTime - leftTime;
                          })
                          .map((entry) => (
                            <div key={entry.uid} className="rounded-2xl bg-white p-3 text-sm text-slate-600">
                              <p className="font-semibold text-slate-900">{entry.displayName || entry.email}</p>
                              <p className="mt-1">{entry.email}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-700">
                                Viewed: {formatNotificationReadDate(entry.readAt)}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {isEditing ? (
                <div className="mt-4 rounded-[1.35rem] border border-brand-100 bg-brand-50/40 p-4">
                  <div className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Title</span>
                      <input
                        type="text"
                        value={editFormState.title}
                        onChange={(event) => updateEditField("title", event.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Message</span>
                      <textarea
                        value={editFormState.body}
                        onChange={(event) => updateEditField("body", event.target.value)}
                        rows={5}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Audience type</span>
                      <select
                        value={editFormState.audienceType}
                        onChange={(event) =>
                          updateEditField(
                            "audienceType",
                            event.target.value as NotificationFormState["audienceType"]
                          )
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                      >
                        {notificationAudienceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {editFormState.audienceType === "specific_emails" ? (
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-700">Specific emails</span>
                        <textarea
                          value={editFormState.targetEmailsText}
                          onChange={(event) => updateEditField("targetEmailsText", event.target.value)}
                          rows={4}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                        />
                      </label>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          void handleSaveEdit(notification);
                        }}
                        disabled={pendingEditId === notification.id}
                        className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
                      >
                        {pendingEditId === notification.id ? "Saving changes..." : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:border-brand-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {!isDashboard && pageCount > 1 ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {safeCurrentPage} of {pageCount}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safeCurrentPage === 1}
              className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500 disabled:cursor-not-allowed disabled:text-brand-300"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              disabled={safeCurrentPage === pageCount}
              className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500 disabled:cursor-not-allowed disabled:text-brand-300"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
