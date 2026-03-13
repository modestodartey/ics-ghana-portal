import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { getMissingRoleErrorMessage, isSupportedRole, normalizeEmail } from "@/lib/auth";
import type { AuthUser, FirestoreUserDocument } from "@/types/auth";

export async function getUserProfileByUid(
  uid: string,
  fallbackEmail?: string | null,
  fallbackDisplayName?: string | null
): Promise<AuthUser> {
  const userSnapshot = await getDoc(doc(firestore, "users", uid));

  if (!userSnapshot.exists()) {
    throw new Error(getMissingRoleErrorMessage());
  }

  const data = userSnapshot.data() as Partial<FirestoreUserDocument>;

  if (!isSupportedRole(data.role)) {
    throw new Error(getMissingRoleErrorMessage());
  }

  const email =
    typeof data.email === "string" && data.email.trim()
      ? normalizeEmail(data.email)
      : normalizeEmail(fallbackEmail ?? "");

  if (!email) {
    throw new Error("This account is missing an email address in Firestore. Please ask an administrator to update the user record.");
  }

  const displayName =
    typeof data.displayName === "string" && data.displayName.trim()
      ? data.displayName.trim()
      : fallbackDisplayName?.trim() || email;

  return {
    uid,
    email,
    role: data.role,
    displayName
  };
}
