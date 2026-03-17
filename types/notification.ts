import type { AuthUser, UserRole } from "@/types/auth";

export type NotificationAudienceType =
  | "all_users"
  | "all_students"
  | "all_admins"
  | "all_staff"
  | "specific_emails";

export type NotificationReadDetailDocument = {
  uid: string;
  email: string;
  displayName: string;
  readAt: unknown;
};

export type NotificationReadDetailRecord = {
  uid: string;
  email: string;
  displayName: string;
  readAt: Date | null;
};

export type NotificationDocument = {
  title: string;
  body: string;
  audienceType: NotificationAudienceType;
  targetEmails: string[];
  createdByUid: string;
  createdByEmail: string;
  createdAt: unknown;
  updatedAt?: unknown;
  active: boolean;
  readBy: string[];
  readDetails: NotificationReadDetailDocument[];
  emailSentCount?: number;
  emailFailedCount?: number;
  emailAttemptedAt?: unknown;
};

export type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  audienceType: NotificationAudienceType;
  targetEmails: string[];
  createdByUid: string;
  createdByEmail: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  active: boolean;
  readBy: string[];
  readDetails: NotificationReadDetailRecord[];
  emailSentCount: number;
  emailFailedCount: number;
  emailAttemptedAt: Date | null;
};

export type CreateNotificationInput = {
  title: string;
  body: string;
  audienceType: NotificationAudienceType;
  targetEmails: string[];
};

export type UpdateNotificationInput = CreateNotificationInput;

export type NotificationFormState = {
  title: string;
  body: string;
  audienceType: NotificationAudienceType;
  targetEmailsText: string;
};

export type NotificationAudienceOption = {
  label: string;
  value: NotificationAudienceType;
};

export type NotificationViewer = Pick<AuthUser, "uid" | "email" | "role">;

export type NotificationListState = "loading" | "ready" | "error";

export type NotificationRoleAudienceMap = Record<UserRole, NotificationAudienceType>;

export type NotificationMutationResult = {
  notificationId: string;
  emailSentCount: number;
  emailFailedCount: number;
  emailWarning: string | null;
};
