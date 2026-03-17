import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { writeAuditLog } from "@/lib/audit/logging";
import { isSchoolEmail, normalizeEmail } from "@/lib/auth";
import {
  getFirebaseAdminFirestore,
  getHttpErrorStatus,
  verifyAdminRouteRequest
} from "@/lib/firebase-admin";
import type { UpdateNotificationInput, NotificationAudienceType } from "@/types/notification";

type RouteError = Error & {
  status?: number;
};

function createRouteError(message: string, status = 400) {
  const error = new Error(message) as RouteError;
  error.status = status;
  return error;
}

function isNotificationAudienceType(value: unknown): value is NotificationAudienceType {
  return (
    value === "all_users" ||
    value === "all_students" ||
    value === "all_admins" ||
    value === "all_staff" ||
    value === "specific_emails"
  );
}

function parseTargetEmails(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((entry): entry is string => typeof entry === "string")
        .map((email) => normalizeEmail(email))
        .filter(Boolean)
    )
  );
}

function validateNotificationInput(input: Partial<UpdateNotificationInput>) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  const audienceType = isNotificationAudienceType(input.audienceType) ? input.audienceType : null;
  const targetEmails = parseTargetEmails(input.targetEmails);

  if (!title || !body || !audienceType) {
    throw createRouteError("Please enter a title, message, and valid audience.", 400);
  }

  if (audienceType === "specific_emails" && targetEmails.length === 0) {
    throw createRouteError("Please enter at least one approved email address.", 400);
  }

  if (audienceType === "specific_emails" && !targetEmails.every((email) => isSchoolEmail(email))) {
    throw createRouteError("Please use approved portal email addresses only.", 400);
  }

  return {
    title,
    body,
    audienceType,
    targetEmails
  };
}

function getFriendlyNotificationRouteError(error: unknown) {
  return error instanceof Error ? error.message : "The notification request could not be completed.";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const routeUser = await verifyAdminRouteRequest(request);
    const { id } = await context.params;
    const body = (await request.json()) as Partial<UpdateNotificationInput>;
    const input = validateNotificationInput(body);
    const notificationReference = getFirebaseAdminFirestore().collection("notifications").doc(id);
    const snapshot = await notificationReference.get();
    const data = snapshot.data();

    if (!snapshot.exists || !data) {
      throw createRouteError("This notification could not be found.", 404);
    }

    if (data.createdByUid !== routeUser.uid) {
      throw createRouteError("Only the admin who created this notification can edit it.", 403);
    }

    const viewedCount =
      Array.isArray(data.readDetails) && data.readDetails.length > 0
        ? data.readDetails.length
        : Array.isArray(data.readBy)
          ? data.readBy.length
          : 0;

    if (viewedCount > 0) {
      throw createRouteError("Notifications that have already been viewed can no longer be edited.", 400);
    }

    await notificationReference.set(
      {
        title: input.title,
        body: input.body,
        audienceType: input.audienceType,
        targetEmails: input.targetEmails,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    await writeAuditLog({
      action: "notification_updated",
      actorUid: routeUser.uid,
      actorEmail: routeUser.email,
      targetType: "notification",
      targetId: id,
      targetLabel: input.title,
      summary: `Updated notification "${input.title}".`,
      metadata: {
        audienceType: input.audienceType
      }
    });

    return NextResponse.json({ data: { notificationId: id } });
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyNotificationRouteError(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const routeUser = await verifyAdminRouteRequest(request);
    const { id } = await context.params;
    const notificationReference = getFirebaseAdminFirestore().collection("notifications").doc(id);
    const snapshot = await notificationReference.get();
    const data = snapshot.data();

    if (!snapshot.exists || !data) {
      throw createRouteError("This notification could not be found.", 404);
    }

    if (data.createdByUid !== routeUser.uid) {
      throw createRouteError("Only the admin who created this notification can delete it.", 403);
    }

    await notificationReference.delete();

    await writeAuditLog({
      action: "notification_deleted",
      actorUid: routeUser.uid,
      actorEmail: routeUser.email,
      targetType: "notification",
      targetId: id,
      targetLabel: typeof data.title === "string" ? data.title : "Notification",
      summary: `Deleted notification "${typeof data.title === "string" ? data.title : "Notification"}".`,
      metadata: {
        audienceType: data.audienceType ?? null
      }
    });

    return NextResponse.json({ data: { notificationId: id } });
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyNotificationRouteError(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}
