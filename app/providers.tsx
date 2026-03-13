"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import { LoginModalProvider } from "@/components/auth/login-modal-provider";
import { NotificationAlertProvider } from "@/components/notifications/notification-alert-provider";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <NotificationAlertProvider>
        <LoginModalProvider>{children}</LoginModalProvider>
      </NotificationAlertProvider>
    </AuthProvider>
  );
}
