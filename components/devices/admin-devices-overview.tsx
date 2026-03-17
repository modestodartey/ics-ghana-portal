"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatDeviceDate,
  getDeviceLocationStateLabel,
  formatDeviceStatus,
  getDeviceStatusTone,
  getGoogleMapsLocationUrl,
  hasSavedDeviceLocation,
  isDeviceLocationLive,
  subscribeToAllDevices
} from "@/services/devices";
import { formatAccuracyLabel } from "@/services/tracking";
import type { DeviceRecord, DeviceStatus } from "@/types/device";

const DEVICE_PAGE_SIZE = 8;

type AdminDevicesOverviewProps = {
  variant?: "dashboard" | "page";
  limit?: number;
};

const DEVICE_TYPE_ICONS: Record<string, string> = {
  laptop: "L",
  phone: "P",
  tablet: "T",
  ipad: "T",
  watch: "W"
};

function getDeviceTypeBadge(deviceType: string) {
  const normalizedDeviceType = deviceType.trim().toLowerCase();

  return DEVICE_TYPE_ICONS[normalizedDeviceType] ?? "D";
}

export function AdminDevicesOverview({
  variant = "page",
  limit = 4
}: AdminDevicesOverviewProps) {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const isDashboard = variant === "dashboard";

  useEffect(() => {
    const unsubscribe = subscribeToAllDevices(
      (nextDevices) => {
        setDevices(nextDevices);
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
    setCurrentPage(1);
  }, [searchValue, statusFilter]);

  const filteredDevices = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return devices.filter((device) => {
      const matchesStatus = statusFilter === "all" ? true : device.status === statusFilter;
      const matchesSearch = normalizedSearch
        ? device.deviceName.toLowerCase().includes(normalizedSearch) ||
          device.deviceType.toLowerCase().includes(normalizedSearch) ||
          device.ownerEmail.toLowerCase().includes(normalizedSearch) ||
          device.displayName.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [devices, searchValue, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredDevices.length / DEVICE_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const visibleDevices = isDashboard
    ? filteredDevices.slice(0, limit)
    : filteredDevices.slice((safeCurrentPage - 1) * DEVICE_PAGE_SIZE, safeCurrentPage * DEVICE_PAGE_SIZE);
  const missingCount = filteredDevices.filter((device) => device.status === "missing").length;

  return (
    <SectionCard
      title={isDashboard ? "Devices preview" : "Devices overview"}
      description={
        isDashboard
          ? "A quick view of registered devices and missing-device activity."
          : "Search registered devices, review status, and open saved locations in Google Maps."
      }
      className="bg-white/95"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-6 text-slate-500">
          {filteredDevices.length} device{filteredDevices.length === 1 ? "" : "s"}{isDashboard ? " in the portal" : " found"}
        </div>
        <Link
          href="/admin/devices"
          className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:border-brand-500"
        >
          {isDashboard ? "View all devices" : "Return to dashboard"}
        </Link>
      </div>

      {!isDashboard ? (
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Search devices</span>
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by device, owner, or email"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Status filter</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as DeviceStatus | "all")}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">All devices</option>
              <option value="active">Active</option>
              <option value="missing">Missing</option>
              <option value="found">Found</option>
            </select>
          </label>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-brand-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Missing devices</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{isLoading ? "—" : missingCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Registered devices</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{isLoading ? "—" : devices.length}</p>
        </div>
      </div>

      {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading devices...</p> : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && visibleDevices.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
          {isDashboard ? "No devices are registered yet." : "No devices match the current filters."}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        {visibleDevices.map((device) => {
          const mapsUrl = getGoogleMapsLocationUrl(device);
          const locationStateLabel = getDeviceLocationStateLabel(device);
          const isLiveNow = isDeviceLocationLive(device);

          return (
            <article key={device.id} className="rounded-[1.35rem] border border-brand-100 bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                      {getDeviceTypeBadge(device.deviceType)}
                    </span>
                    <h3 className="font-display text-xl text-slate-900">{device.deviceName}</h3>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getDeviceStatusTone(device.status)}`}>
                      {formatDeviceStatus(device.status)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        isLiveNow ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {locationStateLabel}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>Owner: {device.displayName || device.ownerEmail}</p>
                    <p>Email: {device.ownerEmail}</p>
                    <p>Type: {device.deviceType}</p>
                    <p>Last seen: {formatDeviceDate(device.lastSeenAt)}</p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {hasSavedDeviceLocation(device)
                      ? `Location accuracy: ${formatAccuracyLabel(device.lastKnownAccuracy)}`
                      : "No saved location is available for this device yet."}
                  </p>
                  {hasSavedDeviceLocation(device) ? (
                    <p className="mt-1 text-sm leading-6 text-slate-500">Location state: {locationStateLabel}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 lg:w-[220px]">
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-700 hover:border-brand-500"
                    >
                      Open in Google Maps
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
                      No location saved yet
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!isDashboard && pageCount > 1 ? (
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
