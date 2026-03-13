export const USER_ROLES = {
  admin: "admin",
  student: "student"
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PHASE_ONE_ROLES: UserRole[] = [USER_ROLES.admin, USER_ROLES.student];

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: "/admin",
  student: "/student"
};

export function isSupportedRole(role: unknown): role is UserRole {
  return role === USER_ROLES.admin || role === USER_ROLES.student;
}

export const ALLOWED_EMAIL_DOMAINS = ["icsghana.info", "gmail.com"] as const;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isSchoolEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const emailParts = normalizedEmail.split("@");

  if (emailParts.length !== 2 || !emailParts[0]) {
    return false;
  }

  return ALLOWED_EMAIL_DOMAINS.includes(emailParts[1] as (typeof ALLOWED_EMAIL_DOMAINS)[number]);
}

export function getSchoolEmailErrorMessage() {
  return "Please use an approved portal email address to sign in.";
}

export function getMissingRoleErrorMessage() {
  return "Your account signed in successfully, but no valid portal role was found. Please ask an administrator to add your user record in Firestore.";
}

export function getFriendlyAuthErrorMessage(error: unknown, fallbackMessage?: string) {
  const fallback = fallbackMessage ?? "We could not sign you in. Please check your email, password, and Firestore role setup.";
  const code =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : null;

  if (!code) {
    return error instanceof Error ? error.message : fallback;
  }

  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "The email or password is incorrect.";
    case "auth/invalid-email":
      return "Please enter a valid email address from an approved domain.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts were made. Please wait a moment and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact an administrator.";
    default:
      return fallback;
  }
}

export function getRoleLabel(role: UserRole) {
  return role === USER_ROLES.admin ? "Admin" : "Student";
}
