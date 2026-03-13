export type UserRole = "admin" | "student";

export type AuthUser = {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
};

export type FirestoreUserDocument = {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: unknown;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type SignInInput = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  signIn: (input: SignInInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  clearError: () => void;
};
