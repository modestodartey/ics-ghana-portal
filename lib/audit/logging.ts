import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import type { AuditAction, AuditTargetType } from "@/types/audit";

type WriteAuditLogInput = {
  action: AuditAction;
  actorUid: string;
  actorEmail: string;
  targetType: AuditTargetType;
  targetId: string;
  targetLabel: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: WriteAuditLogInput) {
  await getFirebaseAdminFirestore().collection("auditLogs").add({
    action: input.action,
    actorUid: input.actorUid,
    actorEmail: input.actorEmail,
    targetType: input.targetType,
    targetId: input.targetId,
    targetLabel: input.targetLabel,
    summary: input.summary,
    createdAt: FieldValue.serverTimestamp(),
    metadata: input.metadata ?? {}
  });
}
