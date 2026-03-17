import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { isSchoolEmail, normalizeEmail } from "@/lib/auth";
import type {
  NotificationAudienceOption,
  NotificationDocument,
  NotificationReadDetailDocument,
  NotificationReadDetailRecord,
  NotificationRecord,
  NotificationViewer
} from "@/types/notification";
import type { AuthUser } from "@/types/auth";

const notificationsCollection = collection(firestore, "notifications");

export const notificationAudienceOptions: NotificationAudienceOption[] = [
  { label: "All users", value: "all_users" },
  { label: "All students", value: "all_students" },
  { label: "All admins", value: "all_admins" },
  { label: "All staff", value: "all_staff" },
  { label: "Specific email(s)", value: "specific_emails" }
];

function mapReadDetail(data: Partial<NotificationReadDetailDocument>): NotificationReadDetailRecord {
  return {
    uid: typeof data.uid === "string" ? data.uid : "",
    email: typeof data.email === "string" ? data.email : "",
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    readAt: toDate(data.readAt)
  };
}

function mapNotificationDocument(id: string, data: Partial<NotificationDocument>): NotificationRecord {
  return {
    id,
    title: typeof data.title === "string" ? data.title : "",
    body: typeof data.body === "string" ? data.body : "",
    audienceType: isNotificationAudienceType(data.audienceType) ? data.audienceType : "all_users",
    targetEmails: Array.isArray(data.targetEmails) ? data.targetEmails.filter(isStringValue) : [],
    createdByUid: typeof data.createdByUid === "string" ? data.createdByUid : "",
    createdByEmail: typeof data.createdByEmail === "string" ? data.createdByEmail : "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    active: data.active !== false,
    readBy: Array.isArray(data.readBy) ? data.readBy.filter(isStringValue) : [],
    readDetails: Array.isArray(data.readDetails)
      ? data.readDetails
          .map((entry) => mapReadDetail((entry ?? {}) as Partial<NotificationReadDetailDocument>))
          .filter((entry) => entry.uid && entry.readAt)
      : [],
    emailSentCount: typeof data.emailSentCount === "number" ? data.emailSentCount : 0,
    emailFailedCount: typeof data.emailFailedCount === "number" ? data.emailFailedCount : 0,
    emailAttemptedAt: toDate(data.emailAttemptedAt)
  };
}

function isStringValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNotificationAudienceType(value: unknown): value is NotificationRecord["audienceType"] {
  return (
    value === "all_users" ||
    value === "all_students" ||
    value === "all_admins" ||
    value === "all_staff" ||
    value === "specific_emails"
  );
}

function toDate(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  return null;
}

export function formatNotificationDate(date: Date | null) {
  if (!date) {
    return "Sending...";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function formatAudienceLabel(notification: NotificationRecord) {
  switch (notification.audienceType) {
    case "all_users":
      return "All users";
    case "all_students":
      return "All students";
    case "all_admins":
      return "All admins";
    case "all_staff":
      return "All staff";
    case "specific_emails":
      return notification.targetEmails.length > 0
        ? `Specific email(s): ${notification.targetEmails.join(", ")}`
        : "Specific email(s)";
    default:
      return "Audience";
  }
}

export function parseTargetEmails(value: string) {
  const uniqueEmails = new Set(
    value
      .split(/[\n,;]+/)
      .map((email) => normalizeEmail(email))
      .filter(Boolean)
  );

  return Array.from(uniqueEmails);
}

export function validateTargetEmails(emails: string[]) {
  return emails.every((email) => isSchoolEmail(email));
}

export function canUserViewNotification(notification: NotificationRecord, user: NotificationViewer) {
  if (!notification.active) {
    return false;
  }

  switch (notification.audienceType) {
    case "all_users":
      return true;
    case "all_students":
      return user.role === "student";
    case "all_admins":
      return user.role === "admin";
    case "all_staff":
      return user.role === "staff";
    case "specific_emails":
      return notification.targetEmails.includes(normalizeEmail(user.email));
    default:
      return false;
  }
}

export function hasUserReadNotification(notification: NotificationRecord, uid: string) {
  return notification.readBy.includes(uid) || notification.readDetails.some((entry) => entry.uid === uid);
}

export function subscribeToNotifications(
  onData: (notifications: NotificationRecord[]) => void,
  onError: (message: string) => void
) {
  const notificationsQuery = query(notificationsCollection, orderBy("createdAt", "desc"));

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications = snapshot.docs.map((snapshotDocument) =>
        mapNotificationDocument(snapshotDocument.id, snapshotDocument.data() as Partial<NotificationDocument>)
      );

      onData(notifications);
    },
    () => {
      onError("We could not load notifications right now. Please refresh and try again.");
    }
  );
}

export async function markNotificationAsRead(notificationId: string, user: Pick<AuthUser, "uid" | "email" | "displayName">) {
  const notificationReference = doc(firestore, "notifications", notificationId);

  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(notificationReference);

    if (!snapshot.exists()) {
      throw new Error("This notification could not be found.");
    }

    const data = snapshot.data() as Partial<NotificationDocument>;
    const readBy = Array.isArray(data.readBy) ? data.readBy.filter(isStringValue) : [];
    const readDetails = Array.isArray(data.readDetails)
      ? data.readDetails.map((entry) => mapReadDetail((entry ?? {}) as Partial<NotificationReadDetailDocument>))
      : [];

    if (readBy.includes(user.uid) || readDetails.some((entry) => entry.uid === user.uid)) {
      return;
    }

    transaction.update(notificationReference, {
      readBy: [...readBy, user.uid],
      readDetails: [
        ...readDetails.map((entry) => ({
          uid: entry.uid,
          email: entry.email,
          displayName: entry.displayName,
          readAt: entry.readAt ?? Timestamp.now()
        })),
        {
          uid: user.uid,
          email: normalizeEmail(user.email),
          displayName: user.displayName,
          readAt: Timestamp.now()
        }
      ]
    });
  });
}

export async function deleteNotification(notificationId: string) {
  await deleteDoc(doc(firestore, "notifications", notificationId));
}

export function getNotificationViewedCount(notification: NotificationRecord) {
  return notification.readDetails.length > 0 ? notification.readDetails.length : notification.readBy.length;
}

export function formatNotificationReadDate(date: Date | null) {
  if (!date) {
    return "Read time unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
