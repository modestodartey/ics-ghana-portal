import type { UserRole } from "@/types/auth";

export type ManagedAccountRole = UserRole;

export type ManagedAccountRecord = {
  uid: string;
  email: string;
  displayName: string;
  role: ManagedAccountRole;
  createdAt: string | null;
  isActive: boolean;
};

export type CreateManagedAccountInput = {
  displayName: string;
  email: string;
  role: ManagedAccountRole;
  temporaryPassword: string;
};

export type BulkAccountCsvRow = {
  fullName: string;
  email: string;
  role: ManagedAccountRole;
  temporaryPassword: string;
};

export type BulkAccountResultItem = {
  email: string;
  fullName: string;
  role: ManagedAccountRole | "";
  status: "created" | "skipped" | "failed";
  message: string;
};

export type BulkAccountCreateResult = {
  created: number;
  skipped: number;
  failed: number;
  results: BulkAccountResultItem[];
};
