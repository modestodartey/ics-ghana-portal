"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useNotificationAlerts } from "@/components/notifications/notification-alert-provider";
import { SectionCard } from "@/components/ui/section-card";
import { getSchoolEmailErrorMessage } from "@/lib/auth";
import {
  createNotification,
  notificationAudienceOptions,
  parseTargetEmails,
  validateTargetEmails
} from "@/services/notifications";
import type { NotificationFormState } from "@/types/notification";

const initialFormState: NotificationFormState = {
  title: "",
  body: "",
  audienceType: "all_users",
  targetEmailsText: ""
};

export function AdminNotificationComposer() {
  const { user } = useAuth();
  const { pushToast } = useNotificationAlerts();
  const [formState, setFormState] = useState<NotificationFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateField<Key extends keyof NotificationFormState>(field: Key, value: NotificationFormState[Key]) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("You must be signed in as an admin to send notifications.");
      return;
    }

    setError(null);
    setSuccess(null);

    if (!formState.title.trim() || !formState.body.trim()) {
      setError("Please enter both a notification title and message.");
      return;
    }

    const targetEmails =
      formState.audienceType === "specific_emails" ? parseTargetEmails(formState.targetEmailsText) : [];

    if (formState.audienceType === "specific_emails" && targetEmails.length === 0) {
      setError("Please enter at least one email address for the specific email audience.");
      return;
    }

    if (formState.audienceType === "specific_emails" && !validateTargetEmails(targetEmails)) {
      setError(getSchoolEmailErrorMessage());
      return;
    }

    setIsSubmitting(true);

    try {
      await createNotification(
        {
          title: formState.title,
          body: formState.body,
          audienceType: formState.audienceType,
          targetEmails
        },
        user
      );

      setFormState(initialFormState);
      setSuccess("Notification sent successfully.");
      pushToast({
        title: "Notification sent",
        message: "Your notification was sent successfully.",
        tone: "success"
      });
    } catch {
      setError("We could not send the notification right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionCard
      title="Create notification"
      description="Send an in-app notification to all users, a role group, or specific approved email addresses."
      className="bg-white/95"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            type="text"
            value={formState.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Morning assembly reminder"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Message</span>
          <textarea
            value={formState.body}
            onChange={(event) => updateField("body", event.target.value)}
            placeholder="Please report to the main hall by 8:15 AM."
            rows={5}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Audience type</span>
          <select
            value={formState.audienceType}
            onChange={(event) => updateField("audienceType", event.target.value as NotificationFormState["audienceType"])}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
          >
            {notificationAudienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {formState.audienceType === "specific_emails" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Specific emails</span>
            <textarea
              value={formState.targetEmailsText}
              onChange={(event) => updateField("targetEmailsText", event.target.value)}
              placeholder={"student.one@icsghana.info,\nadmin.user@icsghana.info"}
              rows={4}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
            <p className="text-xs leading-6 text-slate-500">
              Separate multiple email addresses with commas, semicolons, or new lines.
            </p>
          </label>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-700">
            {success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          {isSubmitting ? "Sending notification..." : "Send notification"}
        </button>
      </form>
    </SectionCard>
  );
}
