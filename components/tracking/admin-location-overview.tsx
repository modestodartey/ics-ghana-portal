"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatAccuracyLabel,
  formatCoordinates,
  formatLocationDate,
  formatLocationFreshness,
  getGoogleMapsUrl,
  isLiveLocationRecord,
  subscribeToAllLocationRecords
} from "@/services/tracking";
import type { LocationRecord } from "@/types/location";

const HISTORY_PAGE_SIZE = 10;

type AdminLocationOverviewProps = {
  variant?: "dashboard" | "page";
  latestLimit?: number;
};

export function AdminLocationOverview({
  variant = "page",
  latestLimit = 4
}: AdminLocationOverviewProps) {
  const [records, setRecords] = useState<LocationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearchValue, setAppliedSearchValue] = useState("");
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);

  const isDashboard = variant === "dashboard";

  useEffect(() => {
    const unsubscribe = subscribeToAllLocationRecords(
      (nextRecords) => {
        setRecords(nextRecords);
        setError(null);
        setIsLoading(false);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    setCurrentHistoryPage(1);
  }, [appliedSearchValue]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = appliedSearchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return records;
    }

    return records.filter(
      (record) =>
        record.userEmail.toLowerCase().includes(normalizedSearch) ||
        record.displayName.toLowerCase().includes(normalizedSearch)
    );
  }, [appliedSearchValue, records]);

  const latestRecords = useMemo(() => {
    const latestByUser = new Map<string, LocationRecord>();

    for (const record of filteredRecords) {
      if (!latestByUser.has(record.userUid)) {
        latestByUser.set(record.userUid, record);
      }
    }

    return Array.from(latestByUser.values());
  }, [filteredRecords]);

  const liveLatestRecords = useMemo(
    () => latestRecords.filter((record) => isLiveLocationRecord(record)),
    [latestRecords]
  );

  const latestPreviewRecords = latestRecords.slice(0, latestLimit);
  const historyPageCount = Math.max(1, Math.ceil(filteredRecords.length / HISTORY_PAGE_SIZE));
  const safeHistoryPage = Math.min(currentHistoryPage, historyPageCount);
  const pagedHistoryRecords = filteredRecords.slice(
    (safeHistoryPage - 1) * HISTORY_PAGE_SIZE,
    safeHistoryPage * HISTORY_PAGE_SIZE
  );

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearchValue(searchValue);
  }

  function handleClearSearch() {
    setSearchValue("");
    setAppliedSearchValue("");
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title={isDashboard ? "Tracking preview" : "Tracking history"}
        description={
          isDashboard
            ? "A short view of the latest saved locations keeps the dashboard useful without turning it into a long history page."
            : "Search, review, and follow saved location history from this dedicated tracking page."
        }
        className="bg-white/95"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm leading-6 text-slate-500">
            {latestRecords.length} latest saved location{latestRecords.length === 1 ? "" : "s"}
          </div>
          <Link
            href="/admin/tracking"
            className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500"
          >
            {isDashboard ? "View all tracking history" : "Return to dashboard"}
          </Link>
        </div>

        {!isDashboard ? (
          <form className="mt-4 flex flex-col gap-3 md:flex-row md:items-end" onSubmit={handleSearchSubmit}>
            <label className="block flex-1 space-y-2">
              <span className="text-sm font-medium text-slate-700">Search by student</span>
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by student name or email"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
              />
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
              >
                Search
              </button>
              {(searchValue || appliedSearchValue) ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:border-brand-500"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        {appliedSearchValue && !isDashboard ? (
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Showing results for <span className="font-semibold text-slate-700">{appliedSearchValue}</span>.
          </p>
        ) : null}

        {!isLoading && !error ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-brand-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Active live sessions</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {liveLatestRecords.length} session{liveLatestRecords.length === 1 ? "" : "s"} currently appear live.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Latest saved records</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The most recent saved location for each user stays visible even after live updates stop.
              </p>
            </div>
          </div>
        ) : null}

        {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading saved locations...</p> : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && latestPreviewRecords.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
            {appliedSearchValue
              ? "No location records were found for that search yet."
              : "No saved locations are available yet."}
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {latestPreviewRecords.map((record) => (
            <article key={record.id} className="rounded-[1.35rem] border border-brand-100 bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl text-slate-900">{record.displayName || record.userEmail}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                    isLiveLocationRecord(record)
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {formatLocationFreshness(record)}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Email: {record.userEmail}</p>
                <p>Saved: {formatLocationDate(record.createdAt)}</p>
                <p>Accuracy: {formatAccuracyLabel(record.accuracy)}</p>
              </div>
              <div className="mt-4">
                <a
                  href={getGoogleMapsUrl(record.latitude, record.longitude)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:border-brand-500"
                >
                  Open in Google Maps
                </a>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      {!isDashboard ? (
        <SectionCard
          title="Recent location history"
          description="Review recent saved records in reverse chronological order."
          className="bg-white/95"
        >
          {pagedHistoryRecords.length === 0 && !isLoading && !error ? (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
              {appliedSearchValue
                ? "No recent location history was found for that search."
                : "No recent location history is available yet."}
            </div>
          ) : null}

          <div className="space-y-4">
            {pagedHistoryRecords.map((record) => (
              <article key={record.id} className="rounded-[1.35rem] border border-brand-100 bg-white p-4 shadow-soft">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-display text-xl text-slate-900">{record.displayName || record.userEmail}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{record.userEmail}</p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                    {isLiveLocationRecord(record) ? "Live session" : "Saved record"}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                  <p>Coordinates: {formatCoordinates(record.latitude, record.longitude)}</p>
                  <p>Accuracy: {formatAccuracyLabel(record.accuracy)}</p>
                  <p>Saved: {formatLocationDate(record.createdAt)}</p>
                  <p>Status: {isLiveLocationRecord(record) ? "Live now" : "Saved"}</p>
                </div>
                <div className="mt-4">
                  <a
                    href={getGoogleMapsUrl(record.latitude, record.longitude)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:border-brand-500"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </article>
            ))}
          </div>

          {historyPageCount > 1 ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {safeHistoryPage} of {historyPageCount}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentHistoryPage((page) => Math.max(1, page - 1))}
                  disabled={safeHistoryPage === 1}
                  className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500 disabled:cursor-not-allowed disabled:text-brand-300"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentHistoryPage((page) => Math.min(historyPageCount, page + 1))}
                  disabled={safeHistoryPage === historyPageCount}
                  className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500 disabled:cursor-not-allowed disabled:text-brand-300"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </SectionCard>
      ) : null}
    </div>
  );
}
