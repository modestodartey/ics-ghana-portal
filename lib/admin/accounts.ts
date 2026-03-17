import type { UserRecord } from "firebase-admin/auth";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { normalizeEmail, USER_ROLES } from "@/lib/auth";
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import type {
  CreateManagedAccountInput,
  ManagedAccountRecord,
  ManagedAccountRole
} from "@/types/accounts";

export function toIsoString(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return null;
}

export function isManagedAccountRole(value: unknown): value is ManagedAccountRole {
  return value === USER_ROLES.admin || value === USER_ROLES.student || value === USER_ROLES.staff;
}

export function mapAccountRecord(uid: string, data: Record<string, unknown>): ManagedAccountRecord {
  return {
    uid,
    email: typeof data.email === "string" ? data.email : "",
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    role: isManagedAccountRole(data.role) ? data.role : USER_ROLES.student,
    createdAt: toIsoString(data.createdAt),
    isActive: data.isActive !== false
  };
}

export function validateCreateAccountInput(input: Partial<CreateManagedAccountInput>) {
  const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  const temporaryPassword = typeof input.temporaryPassword === "string" ? input.temporaryPassword.trim() : "";
  const role = isManagedAccountRole(input.role) ? input.role : null;

  if (!displayName || !email || !temporaryPassword || !role) {
    throw new Error("Please enter the full name, email, role, and temporary password.");
  }

  if (temporaryPassword.length < 6) {
    throw new Error("Temporary passwords must be at least 6 characters long.");
  }

  return {
    displayName,
    email,
    temporaryPassword,
    role
  };
}

export function getFriendlyAccountErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : "";

  switch (code) {
    case "auth/email-already-exists":
      return "An account with that email already exists.";
    case "auth/invalid-password":
      return "The temporary password is not valid for Firebase Authentication.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return error instanceof Error ? error.message : "The account request could not be completed.";
  }
}

export async function createAuthUserAndRecord(
  input: ReturnType<typeof validateCreateAccountInput>
) {
  const adminAuth = getFirebaseAdminAuth();
  const adminFirestore = getFirebaseAdminFirestore();
  const authUser: UserRecord = await adminAuth.createUser({
    email: input.email,
    password: input.temporaryPassword,
    displayName: input.displayName,
    disabled: false
  });

  try {
    await adminFirestore.collection("users").doc(authUser.uid).set({
      uid: authUser.uid,
      email: input.email,
      displayName: input.displayName,
      role: input.role,
      createdAt: FieldValue.serverTimestamp(),
      isActive: true
    });
  } catch (error) {
    await adminAuth.deleteUser(authUser.uid).catch(() => undefined);
    throw error;
  }

  return {
    uid: authUser.uid,
    email: input.email,
    displayName: input.displayName,
    role: input.role,
    createdAt: null,
    isActive: true
  } satisfies ManagedAccountRecord;
}
