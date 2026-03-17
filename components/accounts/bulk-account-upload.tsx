"use client";

import { useMemo, useState } from "react";
import { bulkCreateManagedAccounts } from "@/services/accounts";
import { SectionCard } from "@/components/ui/section-card";
import { parseCsvText } from "@/utils/csv";
import type { BulkAccountCreateResult, BulkAccountCsvRow, ManagedAccountRole } from "@/types/accounts";

const CSV_TEMPLATE = `fullName,email,role,temporaryPassword
Jane Doe,jane.doe@icsghana.info,student,TempPass123
Kwame Mensah,kwame.mensah@icsghana.info,staff,TempPass123
Portal Admin,portal.admin@icsghana.info,admin,TempPass123`;

type BulkAccountUploadProps = {
  onImportComplete: () => Promise<void> | void;
};

type PreviewRow = {
  rowNumber: number;
  fullName: string;
  email: string;
  role: string;
  temporaryPassword: string;
  issues: string[];
};

type ValidPreviewRow = PreviewRow & {
  role: ManagedAccountRole;
};

function isValidRole(value: string): value is ManagedAccountRole {
  return value === "student" || value === "staff" || value === "admin";
}

function normalizeRole(value: string) {
  return value.trim().toLowerCase();
}

export function BulkAccountUpload({ onImportComplete }: BulkAccountUploadProps) {
  const [csvText, setCsvText] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<BulkAccountCreateResult | null>(null);

  const previewRows = useMemo<PreviewRow[]>(() => {
    if (!csvText.trim()) {
      return [];
    }

    const parsedCsv = parseCsvText(csvText);

    return parsedCsv.rows.map((row, index) => {
      const fullName = row.fullName?.trim() ?? "";
      const email = row.email?.trim().toLowerCase() ?? "";
      const role = normalizeRole(row.role ?? "");
      const temporaryPassword = row.temporaryPassword?.trim() ?? "";
      const issues: string[] = [];

      if (!fullName) {
        issues.push("Missing fullName");
      }

      if (!email) {
        issues.push("Missing email");
      }

      if (!role || !isValidRole(role)) {
        issues.push("Role must be student, staff, or admin");
      }

      if (!temporaryPassword) {
        issues.push("Missing temporaryPassword");
      } else if (temporaryPassword.length < 6) {
        issues.push("Temporary password must be at least 6 characters");
      }

      return {
        rowNumber: index + 2,
        fullName,
        email,
        role,
        temporaryPassword,
        issues
      };
    });
  }, [csvText]);

  const validRows = useMemo<BulkAccountCsvRow[]>(
    () =>
      previewRows
        .filter((row): row is ValidPreviewRow => row.issues.length === 0 && isValidRole(row.role))
        .map((row) => ({
          fullName: row.fullName,
          email: row.email,
          role: row.role,
          temporaryPassword: row.temporaryPassword
        })),
    [previewRows]
  );

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    void file.text().then((text) => {
      setCsvText(text);
      setStatusMessage(null);
      setLastResult(null);
    });
  }

  async function handleSubmit() {
    if (validRows.length === 0) {
      setStatusMessage({
        tone: "error",
        message: "Add at least one valid CSV row before importing."
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const result = await bulkCreateManagedAccounts(validRows);
      setLastResult(result);
      setStatusMessage({
        tone: "success",
        message: `Bulk import finished. ${result.created} created, ${result.skipped} skipped, ${result.failed} failed.`
      });
      await onImportComplete();
    } catch (error) {
      setStatusMessage({
        tone: "error",
        message: error instanceof Error ? error.message : "Bulk import could not be completed."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionCard
      title="Bulk CSV upload"
      description="Import multiple accounts at once with a simple CSV file and review the rows before submitting."
      className="bg-white/95"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:border-brand-500">
            Choose CSV file
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`}
            download="ics-ghana-accounts-template.csv"
            className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:border-brand-500"
          >
            Download CSV template
          </a>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">CSV content</span>
          <textarea
            value={csvText}
            onChange={(event) => {
              setCsvText(event.target.value);
              setStatusMessage(null);
              setLastResult(null);
            }}
            rows={8}
            placeholder={CSV_TEMPLATE}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-brand-500"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-brand-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Rows detected</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{previewRows.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Valid rows</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{validRows.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Rows with issues</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {previewRows.filter((row) => row.issues.length > 0).length}
            </p>
          </div>
        </div>

        {previewRows.length > 0 ? (
          <div className="rounded-[1.35rem] border border-brand-100 bg-brand-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Preview</p>
            <div className="mt-3 space-y-3">
              {previewRows.slice(0, 8).map((row) => (
                <div key={row.rowNumber} className="rounded-2xl bg-white p-3 text-sm text-slate-600">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">Row {row.rowNumber}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        row.issues.length === 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {row.issues.length === 0 ? "Ready" : "Needs attention"}
                    </span>
                  </div>
                  <p className="mt-2">{row.fullName || "No name provided"}</p>
                  <p>{row.email || "No email provided"}</p>
                  <p>{row.role || "No role provided"}</p>
                  {row.issues.length > 0 ? (
                    <p className="mt-2 text-red-700">{row.issues.join(". ")}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

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

        {lastResult ? (
          <div className="rounded-[1.35rem] border border-brand-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Bulk import results</p>
            <div className="mt-3 space-y-3">
              {lastResult.results.slice(0, 10).map((item) => (
                <div key={`${item.email}-${item.status}-${item.message}`} className="rounded-2xl bg-brand-50/60 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{item.fullName || item.email}</p>
                  <p className="mt-1">{item.email}</p>
                  <p className="mt-1">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting || validRows.length === 0}
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          {isSubmitting ? "Importing accounts..." : "Import valid rows"}
        </button>
      </div>
    </SectionCard>
  );
}
