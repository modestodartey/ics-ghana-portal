import { firebaseAuth } from "@/lib/firebase";
import { normalizeEmail } from "@/lib/auth";
import type {
  BulkAccountCreateResult,
  BulkAccountCsvRow,
  CreateManagedAccountInput,
  ManagedAccountRecord
} from "@/types/accounts";

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

export async function listManagedAccounts() {
  const response = await fetch("/api/admin/accounts", {
    method: "GET",
    headers: await getAuthorizedHeaders(),
    cache: "no-store"
  });

  return readApiResponse<ManagedAccountRecord[]>(response);
}

export async function createManagedAccount(input: CreateManagedAccountInput) {
  const response = await fetch("/api/admin/accounts", {
    method: "POST",
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify({
      ...input,
      email: normalizeEmail(input.email)
    })
  });

  return readApiResponse<ManagedAccountRecord>(response);
}

export async function updateManagedAccountStatus(uid: string, isActive: boolean) {
  const response = await fetch(`/api/admin/accounts/${uid}`, {
    method: "PATCH",
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify({ isActive })
  });

  return readApiResponse<ManagedAccountRecord>(response);
}

export async function bulkCreateManagedAccounts(rows: BulkAccountCsvRow[]) {
  const response = await fetch("/api/admin/accounts/bulk", {
    method: "POST",
    headers: await getAuthorizedHeaders(),
    body: JSON.stringify({ rows })
  });

  return readApiResponse<BulkAccountCreateResult>(response);
}
