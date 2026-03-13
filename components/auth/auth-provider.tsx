"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import {
  getFriendlyAuthErrorMessage,
  getMissingRoleErrorMessage,
  getSchoolEmailErrorMessage,
  isSchoolEmail,
  normalizeEmail
} from "@/lib/auth";
import { getUserProfileByUid } from "@/lib/auth/user-profile";
import type { AuthContextValue, AuthStatus, AuthUser, SignInInput } from "@/types/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function buildAppUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
  return getUserProfileByUid(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      setStatus("loading");

      try {
        const appUser = await buildAppUser(firebaseUser);
        setUser(appUser);
        setError(null);
        setStatus("authenticated");
      } catch (caughtError) {
        const message = getFriendlyAuthErrorMessage(caughtError, getMissingRoleErrorMessage());
        setUser(null);
        setError(message);
        setStatus("unauthenticated");
        await signOut(firebaseAuth);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async ({ email, password }: SignInInput) => {
    const normalizedEmail = normalizeEmail(email);

    if (!isSchoolEmail(normalizedEmail)) {
      const message = getSchoolEmailErrorMessage();
      setError(message);
      setStatus("unauthenticated");
      throw new Error(message);
    }

    setStatus("loading");
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
      const appUser = await buildAppUser(credential.user);
      setUser(appUser);
      setStatus("authenticated");
      return appUser;
    } catch (caughtError) {
      const message = getFriendlyAuthErrorMessage(caughtError);
      setUser(null);
      setError(message);
      setStatus("unauthenticated");

      if (firebaseAuth.currentUser) {
        await signOut(firebaseAuth);
      }

      throw new Error(message);
    }
  };

  const logout = async () => {
    setStatus("loading");
    setError(null);
    await signOut(firebaseAuth);
    setUser(null);
    setStatus("unauthenticated");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      error,
      signIn,
      logout,
      clearError
    }),
    [error, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
