export type AuditAction =
  | "account_created"
  | "account_status_updated"
  | "accounts_bulk_created"
  | "notification_created"
  | "notification_updated"
  | "notification_deleted";

export type AuditTargetType = "account" | "notification" | "bulk_import";

export type AuditLogDocument = {
  action: AuditAction;
  actorUid: string;
  actorEmail: string;
  targetType: AuditTargetType;
  targetId: string;
  targetLabel: string;
  summary: string;
  createdAt: unknown;
  metadata?: Record<string, unknown>;
};

export type AuditLogRecord = {
  id: string;
  action: AuditAction;
  actorUid: string;
  actorEmail: string;
  targetType: AuditTargetType;
  targetId: string;
  targetLabel: string;
  summary: string;
  createdAt: string | null;
  metadata: Record<string, unknown> | null;
};
