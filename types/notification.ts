import type { AuthUser, UserRole } from "@/types/auth";

export type NotificationAudienceType =
  | "all_users"
  | "all_students"
  | "all_admins"
  | "specific_emails";

export type NotificationDocument = {
  title: string;
  body: string;
  audienceType: NotificationAudienceType;
  targetEmails: string[];
  createdByUid: string;
  createdByEmail: string;
  createdAt: unknown;
  active: boolean;
  readBy: string[];
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
  active: boolean;
  readBy: string[];
};

export type CreateNotificationInput = {
  title: string;
  body: string;
  audienceType: NotificationAudienceType;
  targetEmails: string[];
};

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
