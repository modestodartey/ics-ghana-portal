import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { isSchoolEmail, normalizeEmail } from "@/lib/auth";
import type {
  CreateNotificationInput,
  NotificationAudienceOption,
  NotificationDocument,
  NotificationRecord,
  NotificationViewer
} from "@/types/notification";
import type { AuthUser } from "@/types/auth";

const notificationsCollection = collection(firestore, "notifications");

export const notificationAudienceOptions: NotificationAudienceOption[] = [
  { label: "All users", value: "all_users" },
  { label: "All students", value: "all_students" },
  { label: "All admins", value: "all_admins" },
  { label: "Specific email(s)", value: "specific_emails" }
];

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
    active: data.active !== false,
    readBy: Array.isArray(data.readBy) ? data.readBy.filter(isStringValue) : []
  };
}

function isStringValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNotificationAudienceType(value: unknown): value is NotificationRecord["audienceType"] {
  return value === "all_users" || value === "all_students" || value === "all_admins" || value === "specific_emails";
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
    case "specific_emails":
      return notification.targetEmails.includes(normalizeEmail(user.email));
    default:
      return false;
  }
}

export function hasUserReadNotification(notification: NotificationRecord, uid: string) {
  return notification.readBy.includes(uid);
}

export async function createNotification(input: CreateNotificationInput, user: AuthUser) {
  await addDoc(notificationsCollection, {
    title: input.title.trim(),
    body: input.body.trim(),
    audienceType: input.audienceType,
    targetEmails: input.targetEmails.map((email) => normalizeEmail(email)),
    createdByUid: user.uid,
    createdByEmail: user.email,
    createdAt: serverTimestamp(),
    active: true,
    readBy: []
  });
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

export async function markNotificationAsRead(notificationId: string, uid: string) {
  await updateDoc(doc(firestore, "notifications", notificationId), {
    readBy: arrayUnion(uid)
  });
}
