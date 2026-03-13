"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatCoordinates,
  formatLocationDate,
  getGoogleMapsUrl,
  subscribeToAllLocationRecords
} from "@/services/tracking";
import type { LocationRecord } from "@/types/location";

export function AdminLocationOverview() {
  const [records, setRecords] = useState<LocationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [appliedSearchEmail, setAppliedSearchEmail] = useState("");

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

  const filteredRecords = useMemo(() => {
    const normalizedSearch = appliedSearchEmail.trim().toLowerCase();

    if (!normalizedSearch) {
      return records;
    }

    return records.filter((record) => record.userEmail.toLowerCase().includes(normalizedSearch));
  }, [appliedSearchEmail, records]);

  const latestRecords = useMemo(() => {
    const latestByUser = new Map<string, LocationRecord>();

    for (const record of filteredRecords) {
      if (!latestByUser.has(record.userUid)) {
        latestByUser.set(record.userUid, record);
      }
    }

    return Array.from(latestByUser.values());
  }, [filteredRecords]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearchEmail(searchEmail);
  }

  function handleClearSearch() {
    setSearchEmail("");
    setAppliedSearchEmail("");
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Latest known locations"
        description="A simple latest-location view for each student or user with saved web-based location records."
        className="bg-white/95"
      >
        <form className="flex flex-col gap-3 md:flex-row md:items-end" onSubmit={handleSearchSubmit}>
          <label className="block flex-1 space-y-2">
            <span className="text-sm font-medium text-slate-700">Search by email</span>
            <input
              type="text"
              value={searchEmail}
              onChange={(event) => setSearchEmail(event.target.value)}
              placeholder="student.name@icsghana.info"
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
            {(searchEmail || appliedSearchEmail) ? (
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

        {appliedSearchEmail ? (
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Showing results for <span className="font-semibold text-slate-700">{appliedSearchEmail}</span>.
          </p>
        ) : null}

        {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading latest locations...</p> : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && latestRecords.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
            {appliedSearchEmail
              ? "No location records were found for that email yet."
              : "No location records match the current filter yet."}
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {latestRecords.map((record) => (
            <article key={record.id} className="rounded-[1.5rem] border border-brand-100 bg-white p-4 shadow-soft">
              <h3 className="font-display text-xl text-slate-900">{record.displayName || record.userEmail}</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Email: {record.userEmail}</p>
                <p>Coordinates: {formatCoordinates(record.latitude, record.longitude)}</p>
                <p>Accuracy: {record.accuracy ? `${Math.round(record.accuracy)} meters` : "Unavailable"}</p>
                <p>Saved: {formatLocationDate(record.createdAt)}</p>
                <p>Source: {record.source}</p>
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

      <SectionCard
        title="Recent location history"
        description="Recent saved records are shown in reverse chronological order for a clear MVP admin history view."
        className="bg-white/95"
      >
        {isLoading ? <p className="text-sm text-slate-500">Loading recent history...</p> : null}

        {!isLoading && !error && filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
            {appliedSearchEmail
              ? "No recent location history was found for that email."
              : "No recent location history is available yet."}
          </div>
        ) : null}

        <div className="space-y-4">
          {filteredRecords.slice(0, 12).map((record) => (
            <article key={record.id} className="rounded-[1.5rem] border border-brand-100 bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-display text-xl text-slate-900">{record.displayName || record.userEmail}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{record.userEmail}</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                  {record.source}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                <p>Coordinates: {formatCoordinates(record.latitude, record.longitude)}</p>
                <p>Accuracy: {record.accuracy ? `${Math.round(record.accuracy)} meters` : "Unavailable"}</p>
                <p>Saved: {formatLocationDate(record.createdAt)}</p>
                <p>Status: {record.active ? "Active" : "Inactive"}</p>
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
    </div>
  );
}
