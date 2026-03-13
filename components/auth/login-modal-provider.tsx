"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { LoginModal } from "@/components/auth/login-modal";

type LoginModalContextValue = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const LoginModalContext = createContext<LoginModalContextValue | undefined>(undefined);

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const { user, clearError } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    clearError();
    setIsOpen(true);
  };

  const closeModal = () => {
    clearError();
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setIsOpen(false);
    }
  }, [user]);

  const value = useMemo<LoginModalContextValue>(
    () => ({
      isOpen,
      openModal,
      closeModal
    }),
    [isOpen]
  );

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal isOpen={isOpen} onClose={closeModal} />
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);

  if (!context) {
    throw new Error("useLoginModal must be used inside LoginModalProvider.");
  }

  return context;
}
