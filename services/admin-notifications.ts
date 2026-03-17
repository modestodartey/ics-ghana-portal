import { firebaseAuth } from "@/lib/firebase";
import type {
  CreateNotificationInput,
  NotificationMutationResult,
  UpdateNotificationInput
} from "@/types/notification";

async function getAuthorizedHeaders() {
  const currentUser = firebaseAuth.currentUser;

  if (!currentUser) {
    throw new Error("You must sign in again before continuing.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${await currentUser.getIdToken()}`
  };
}

async function readApiResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "The request could not be completed.");
  }

  if (!payload?.data) {
    throw new Error("The server returned an empty response.");
  }

  return payload.data;
}

export async function createAdminNotification(input: CreateNotificationInput) {
  const response = await fetch("/api/admin/notifications", {
    method: "POST",
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify(input)
  });

  return readApiResponse<NotificationMutationResult>(response);
}

export async function updateAdminNotification(notificationId: string, input: UpdateNotificationInput) {
  const response = await fetch(`/api/admin/notifications/${notificationId}`, {
    method: "PATCH",
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify(input)
  });

  return readApiResponse<{ notificationId: string }>(response);
}

export async function deleteAdminNotification(notificationId: string) {
  const response = await fetch(`/api/admin/notifications/${notificationId}`, {
    method: "DELETE",
    headers: await getAuthorizedHeaders()
  });

  return readApiResponse<{ notificationId: string }>(response);
}
