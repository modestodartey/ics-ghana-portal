"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BulkAccountUpload } from "@/components/accounts/bulk-account-upload";
import { SectionCard } from "@/components/ui/section-card";
import {
  createManagedAccount,
  listManagedAccounts,
  updateManagedAccountStatus
} from "@/services/accounts";
import type { CreateManagedAccountInput, ManagedAccountRecord, ManagedAccountRole } from "@/types/accounts";

const initialFormState: CreateManagedAccountInput = {
  displayName: "",
  email: "",
  role: "student",
  temporaryPassword: ""
};

const ACCOUNTS_PAGE_SIZE = 8;

type StatusMessage = {
  tone: "success" | "error";
  message: string;
};

function formatCreatedAt(value: string | null) {
  if (!value) {
    return "Just created";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function AdminAccountsManager() {
  const [accounts, setAccounts] = useState<ManagedAccountRecord[]>([]);
  const [formState, setFormState] = useState<CreateManagedAccountInput>(initialFormState);
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState<ManagedAccountRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadAccounts() {
    setIsLoading(true);

    try {
      const nextAccounts = await listManagedAccounts();
      setAccounts(nextAccounts);
    } catch (error) {
      setStatusMessage({
        tone: "error",
        message: error instanceof Error ? error.message : "We could not load accounts right now."
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, roleFilter, statusFilter]);

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesRole = roleFilter === "all" ? true : account.role === roleFilter;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? account.isActive
            : !account.isActive;
      const matchesSearch = normalizedSearch
        ? account.displayName.toLowerCase().includes(normalizedSearch) ||
          account.email.toLowerCase().includes(normalizedSearch) ||
          account.role.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [accounts, roleFilter, searchValue, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredAccounts.length / ACCOUNTS_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const visibleAccounts = filteredAccounts.slice(
    (safeCurrentPage - 1) * ACCOUNTS_PAGE_SIZE,
    safeCurrentPage * ACCOUNTS_PAGE_SIZE
  );

  const summary = useMemo(
    () => ({
      total: accounts.length,
      active: accounts.filter((account) => account.isActive).length,
      students: accounts.filter((account) => account.role === "student").length,
      staff: accounts.filter((account) => account.role === "staff").length,
      admins: accounts.filter((account) => account.role === "admin").length
    }),
    [accounts]
  );

  function updateField<Key extends keyof CreateManagedAccountInput>(field: Key, value: CreateManagedAccountInput[Key]) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);

    if (!formState.displayName.trim() || !formState.email.trim() || !formState.temporaryPassword.trim()) {
      setStatusMessage({
        tone: "error",
        message: "Please enter the full name, email, role, and temporary password."
      });
      return;
    }

    if (formState.temporaryPassword.trim().length < 6) {
      setStatusMessage({
        tone: "error",
        message: "Temporary passwords must be at least 6 characters long."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createManagedAccount(formState);
      setFormState(initialFormState);
      setStatusMessage({
        tone: "success",
        message: "Account created successfully. The new user can now sign in with the temporary password."
      });
      await loadAccounts();
    } catch (error) {
      setStatusMessage({
        tone: "error",
        message: error instanceof Error ? error.message : "We could not create this account right now."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(account: ManagedAccountRecord) {
    setPendingUid(account.uid);
    setStatusMessage(null);

    try {
      const updatedAccount = await updateManagedAccountStatus(account.uid, !account.isActive);

      setAccounts((currentAccounts) =>
        currentAccounts.map((currentAccount) =>
          currentAccount.uid === updatedAccount.uid ? updatedAccount : currentAccount
        )
      );

      setStatusMessage({
        tone: "success",
        message: updatedAccount.isActive
          ? "Account access restored successfully."
          : "Account access disabled successfully."
      });
    } catch (error) {
      setStatusMessage({
        tone: "error",
        message: error instanceof Error ? error.message : "We could not update this account right now."
      });
    } finally {
      setPendingUid(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SectionCard title="Total accounts" description="All portal user records currently stored." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{isLoading ? "—" : summary.total}</p>
        </SectionCard>
        <SectionCard title="Active accounts" description="Users who can sign in right now." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{isLoading ? "—" : summary.active}</p>
        </SectionCard>
        <SectionCard title="Students" description="Current student records." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{isLoading ? "—" : summary.students}</p>
        </SectionCard>
        <SectionCard title="Staff" description="Current staff records." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{isLoading ? "—" : summary.staff}</p>
        </SectionCard>
        <SectionCard title="Admins" description="Current administrator records." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{isLoading ? "—" : summary.admins}</p>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Create account"
          description="Create one account at a time for students, staff, or admins."
          className="bg-white/95"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Full name</span>
              <input
                type="text"
                value={formState.displayName}
                onChange={(event) => updateField("displayName", event.target.value)}
                placeholder="Modest Dartey"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="student.name@icsghana.info"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Role</span>
                <select
                  value={formState.role}
                  onChange={(event) => updateField("role", event.target.value as ManagedAccountRole)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Temporary password</span>
                <input
                  type="text"
                  value={formState.temporaryPassword}
                  onChange={(event) => updateField("temporaryPassword", event.target.value)}
                  placeholder="TempPass123"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                />
              </label>
            </div>

            {statusMessage ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                  statusMessage.tone === "success"
                    ? "border border-brand-200 bg-brand-50 text-brand-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {statusMessage.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </SectionCard>

        <BulkAccountUpload onImportComplete={loadAccounts} />
      </section>

      <SectionCard
        title="Accounts overview"
        description="Search and filter accounts by role and status as the portal grows."
        className="bg-white/95"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Search accounts</span>
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by name, email, or role"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Role filter</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as ManagedAccountRole | "all")}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">All roles</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Status filter</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </label>
        </div>

        {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading accounts...</p> : null}

        {!isLoading && visibleAccounts.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
            No accounts match the current filters.
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          {visibleAccounts.map((account) => (
            <article key={account.uid} className="rounded-[1.35rem] border border-brand-100 bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl text-slate-900">{account.displayName}</h3>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                      {account.role}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        account.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {account.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{account.email}</p>
                  <p className="text-sm text-slate-500">Created: {formatCreatedAt(account.createdAt)}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void handleToggleActive(account);
                  }}
                  disabled={pendingUid === account.uid}
                  className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:border-brand-500 disabled:cursor-not-allowed disabled:text-brand-300"
                >
                  {pendingUid === account.uid
                    ? "Saving..."
                    : account.isActive
                      ? "Disable account"
                      : "Reactivate account"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {pageCount > 1 ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {safeCurrentPage} of {pageCount}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500 disabled:cursor-not-allowed disabled:text-brand-300"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                disabled={safeCurrentPage === pageCount}
                className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500 disabled:cursor-not-allowed disabled:text-brand-300"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5">
          <Link href="/admin" className="inline-flex text-sm font-semibold text-brand-700 hover:text-brand-900">
            Return to the admin dashboard
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
