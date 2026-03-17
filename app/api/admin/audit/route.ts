import { NextResponse } from "next/server";
import { getFirebaseAdminFirestore, getHttpErrorStatus, verifyAdminRouteRequest } from "@/lib/firebase-admin";
import type { AuditLogDocument, AuditLogRecord } from "@/types/audit";

function toIsoString(value: unknown) {
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return null;
}

function mapAuditLogRecord(id: string, data: Partial<AuditLogDocument>): AuditLogRecord {
  return {
    id,
    action: typeof data.action === "string" ? data.action as AuditLogRecord["action"] : "notification_created",
    actorUid: typeof data.actorUid === "string" ? data.actorUid : "",
    actorEmail: typeof data.actorEmail === "string" ? data.actorEmail : "",
    targetType: typeof data.targetType === "string" ? data.targetType as AuditLogRecord["targetType"] : "notification",
    targetId: typeof data.targetId === "string" ? data.targetId : "",
    targetLabel: typeof data.targetLabel === "string" ? data.targetLabel : "",
    summary: typeof data.summary === "string" ? data.summary : "",
    createdAt: toIsoString(data.createdAt),
    metadata: typeof data.metadata === "object" && data.metadata !== null ? data.metadata : null
  };
}

function getFriendlyAuditErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Audit log records could not be loaded.";
}

export async function GET(request: Request) {
  try {
    await verifyAdminRouteRequest(request);

    const snapshot = await getFirebaseAdminFirestore()
      .collection("auditLogs")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const records = snapshot.docs.map((documentSnapshot) =>
      mapAuditLogRecord(documentSnapshot.id, documentSnapshot.data() as Partial<AuditLogDocument>)
    );

    return NextResponse.json({ data: records });
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyAuditErrorMessage(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}
