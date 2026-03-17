import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { writeAuditLog } from "@/lib/audit/logging";
import { isSchoolEmail, normalizeEmail } from "@/lib/auth";
import {
  getFirebaseAdminFirestore,
  getHttpErrorStatus,
  verifyAdminRouteRequest
} from "@/lib/firebase-admin";
import {
  getFriendlyEmailDeliveryMessageForAdmin,
  sendNotificationEmails
} from "@/lib/email/notification-email";
import type {
  CreateNotificationInput,
  NotificationAudienceType,
  NotificationMutationResult
} from "@/types/notification";

type RouteError = Error & {
  status?: number;
};

type PortalUserRecord = {
  email: string;
  role: string;
  isActive?: boolean;
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

function validateNotificationInput(input: Partial<CreateNotificationInput>) {
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

function getAudienceLabel(audienceType: NotificationAudienceType) {
  switch (audienceType) {
    case "all_students":
      return "All students";
    case "all_admins":
      return "All admins";
    case "all_staff":
      return "All staff";
    case "specific_emails":
      return "Specific email recipients";
    default:
      return "All users";
  }
}

async function resolveRecipientEmails(audienceType: NotificationAudienceType, targetEmails: string[]) {
  if (audienceType === "specific_emails") {
    return targetEmails;
  }

  const snapshot = await getFirebaseAdminFirestore().collection("users").get();
  const users = snapshot.docs
    .map((documentSnapshot) => documentSnapshot.data() as PortalUserRecord)
    .filter((user) => typeof user.email === "string" && user.email.trim() && user.isActive !== false);

  const filteredUsers = users.filter((user) => {
    switch (audienceType) {
      case "all_students":
        return user.role === "student";
      case "all_admins":
        return user.role === "admin";
      case "all_staff":
        return user.role === "staff";
      default:
        return true;
    }
  });

  return Array.from(new Set(filteredUsers.map((user) => normalizeEmail(user.email))));
}

function getFriendlyNotificationRouteError(error: unknown) {
  return error instanceof Error ? error.message : "The notification request could not be completed.";
}

export async function POST(request: Request) {
  try {
    const routeUser = await verifyAdminRouteRequest(request);
    const body = (await request.json()) as Partial<CreateNotificationInput>;
    const input = validateNotificationInput(body);
    const notificationReference = getFirebaseAdminFirestore().collection("notifications").doc();
    const recipientEmails = await resolveRecipientEmails(input.audienceType, input.targetEmails);

    await notificationReference.set({
      title: input.title,
      body: input.body,
      audienceType: input.audienceType,
      targetEmails: input.targetEmails,
      createdByUid: routeUser.uid,
      createdByEmail: routeUser.email,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      active: true,
      readBy: [],
      readDetails: [],
      emailSentCount: 0,
      emailFailedCount: 0,
      emailAttemptedAt: null
    });

    let emailResult: NotificationMutationResult = {
      notificationId: notificationReference.id,
      emailSentCount: 0,
      emailFailedCount: 0,
      emailWarning: null
    };

    try {
      const deliveryResult = await sendNotificationEmails({
        recipients: recipientEmails,
        title: input.title,
        body: input.body,
        audienceLabel: getAudienceLabel(input.audienceType),
        createdByEmail: routeUser.email
      });

      emailResult = {
        notificationId: notificationReference.id,
        emailSentCount: deliveryResult.sentCount,
        emailFailedCount: deliveryResult.failedCount,
        emailWarning: deliveryResult.warning
      };
    } catch (error) {
      console.error("ICS Ghana Portal: notification email delivery setup failed.", {
        notificationId: notificationReference.id,
        title: input.title,
        error
      });

      emailResult = {
        notificationId: notificationReference.id,
        emailSentCount: 0,
        emailFailedCount: recipientEmails.length,
        emailWarning: getFriendlyEmailDeliveryMessageForAdmin(error)
      };
    }

    await notificationReference.set(
      {
        emailSentCount: emailResult.emailSentCount,
        emailFailedCount: emailResult.emailFailedCount,
        emailAttemptedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    await writeAuditLog({
      action: "notification_created",
      actorUid: routeUser.uid,
      actorEmail: routeUser.email,
      targetType: "notification",
      targetId: notificationReference.id,
      targetLabel: input.title,
      summary: `Created a notification for ${getAudienceLabel(input.audienceType)}.`,
      metadata: {
        audienceType: input.audienceType,
        recipientCount: recipientEmails.length,
        emailSentCount: emailResult.emailSentCount,
        emailFailedCount: emailResult.emailFailedCount
      }
    });

    return NextResponse.json({ data: emailResult });
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyNotificationRouteError(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}
