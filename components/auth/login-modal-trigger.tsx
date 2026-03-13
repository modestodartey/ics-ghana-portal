"use client";

import { cn } from "@/utils/cn";
import { useLoginModal } from "@/components/auth/login-modal-provider";

type LoginModalTriggerProps = {
  label?: string;
  className?: string;
};

export function LoginModalTrigger({
  label = "Login",
  className
}: LoginModalTriggerProps) {
  const { openModal } = useLoginModal();

  return (
    <button type="button" onClick={openModal} className={cn(className)}>
      {label}
    </button>
  );
}
