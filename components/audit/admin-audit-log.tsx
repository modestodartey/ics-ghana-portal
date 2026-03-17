"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { listAuditLogs } from "@/services/audit";
import type { AuditAction, AuditLogRecord } from "@/types/audit";

const AUDIT_PAGE_SIZE = 10;

function formatAuditDate(value: string | null) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatAuditAction(value: AuditAction) {
  switch (value) {
    case "account_created":
      return "Account created";
    case "account_status_updated":
      return "Account updated";
    case "accounts_bulk_created":
      return "Bulk import";
    case "notification_created":
      return "Notification created";
    case "notification_updated":
      return "Notification updated";
    case "notification_deleted":
      return "Notification deleted";
    default:
      return "Portal activity";
  }
}

export function AdminAuditLog() {
  const [records, setRecords] = useState<AuditLogRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void listAuditLogs()
      .then((nextRecords) => {
        setRecords(nextRecords);
        setError(null);
        setIsLoading(false);
      })
      .catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : "Audit records could not be loaded.");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, actionFilter]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return records.filter((record) => {
      const matchesAction = actionFilter === "all" ? true : record.action === actionFilter;
      const matchesSearch = normalizedSearch
        ? record.actorEmail.toLowerCase().includes(normalizedSearch) ||
          record.targetLabel.toLowerCase().includes(normalizedSearch) ||
          record.summary.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesAction && matchesSearch;
    });
  }, [actionFilter, records, searchValue]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / AUDIT_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const visibleRecords = filteredRecords.slice((safeCurrentPage - 1) * AUDIT_PAGE_SIZE, safeCurrentPage * AUDIT_PAGE_SIZE);

  return (
    <SectionCard
      title="Audit log"
      description="Recent admin actions are recorded here to support accountability and later reporting."
      className="bg-white/95"
    >
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Search audit log</span>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by admin, target, or summary"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Action filter</span>
          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value as AuditAction | "all")}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
          >
            <option value="all">All actions</option>
            <option value="account_created">Account created</option>
            <option value="account_status_updated">Account updated</option>
            <option value="accounts_bulk_created">Bulk import</option>
            <option value="notification_created">Notification created</option>
            <option value="notification_updated">Notification updated</option>
            <option value="notification_deleted">Notification deleted</option>
          </select>
        </label>
      </div>

      {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading audit records...</p> : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && visibleRecords.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
          No audit records match the current filters.
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        {visibleRecords.map((record) => (
          <article key={record.id} className="rounded-[1.35rem] border border-brand-100 bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl text-slate-900">{formatAuditAction(record.action)}</h3>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                    {record.targetType}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{record.summary}</p>
              </div>
              <p className="text-sm text-slate-500">{formatAuditDate(record.createdAt)}</p>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
              <p>Admin: {record.actorEmail}</p>
              <p>Target: {record.targetLabel}</p>
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
    </SectionCard>
  );
}
