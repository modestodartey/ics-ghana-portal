import { firebaseAuth } from "@/lib/firebase";
import type { AuditLogRecord } from "@/types/audit";

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

export async function listAuditLogs() {
  const response = await fetch("/api/admin/audit", {
    method: "GET",
    headers: await getAuthorizedHeaders(),
    cache: "no-store"
  });

  return readApiResponse<AuditLogRecord[]>(response);
}
