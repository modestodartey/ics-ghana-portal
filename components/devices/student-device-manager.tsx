"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { SectionCard } from "@/components/ui/section-card";
import {
  createDevice,
  formatDeviceDate,
  formatDeviceStatus,
  getFriendlyDeviceErrorMessage,
  getDeviceStatusTone,
  getGoogleMapsLocationUrl,
  hasSavedDeviceLocation,
  subscribeToUserDevices,
  updateDeviceStatus
} from "@/services/devices";
import { formatCoordinates } from "@/services/tracking";
import type { DeviceRecord, DeviceStatus } from "@/types/device";

type DeviceStatusMessage = {
  tone: "success" | "error";
  message: string;
};

const DEVICE_STATUS_ACTIONS: Record<DeviceStatus, { label: string; nextStatus: DeviceStatus }> = {
  active: { label: "Mark as missing", nextStatus: "missing" },
  missing: { label: "Mark as found", nextStatus: "found" },
  found: { label: "Set active", nextStatus: "active" }
};

export function StudentDeviceManager() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionDeviceId, setActionDeviceId] = useState<string | null>(null);
  const [message, setMessage] = useState<DeviceStatusMessage | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeToUserDevices(
      user.uid,
      (nextDevices) => {
        setDevices(nextDevices);
        setIsLoading(false);
      },
      (errorMessage) => {
        setMessage({ tone: "error", message: errorMessage });
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setMessage({ tone: "error", message: "Please sign in again before registering a device." });
      return;
    }

    if (!deviceName.trim() || !deviceType.trim()) {
      setMessage({ tone: "error", message: "Please enter both a device name and device type." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await createDevice(
        {
          deviceName,
          deviceType
        },
        user
      );

      setDeviceName("");
      setDeviceType("");
      setMessage({ tone: "success", message: "Your device has been registered successfully." });
    } catch (error) {
      const errorMessage = getFriendlyDeviceErrorMessage(error);
      setMessage({
        tone: "error",
        message:
          process.env.NODE_ENV === "development" ? `${errorMessage}` : errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(deviceId: string, status: DeviceStatus) {
    if (!user) {
      setMessage({ tone: "error", message: "Please sign in again before updating a device." });
      return;
    }

    setActionDeviceId(deviceId);
    setMessage(null);

    try {
      await updateDeviceStatus(deviceId, user.uid, status);
      setMessage({ tone: "success", message: "Device status updated successfully." });
    } catch (error) {
      setMessage({ tone: "error", message: getFriendlyDeviceErrorMessage(error) });
    } finally {
      setActionDeviceId(null);
    }
  }

  return (
    <SectionCard
      title="Find My Device Lite"
      description="Register your school-use devices, mark one as missing when needed, and review the latest saved location linked to your account."
      className="bg-white/95"
    >
      <div className="space-y-5">
        <form className="grid gap-4 rounded-[1.5rem] border border-brand-100 bg-brand-50/60 p-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Device name</span>
            <input
              type="text"
              value={deviceName}
              onChange={(event) => setDeviceName(event.target.value)}
              placeholder="Student iPad"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Device type</span>
            <input
              type="text"
              value={deviceType}
              onChange={(event) => setDeviceType(event.target.value)}
              placeholder="Tablet, phone, laptop"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300 md:w-auto"
            >
              {isSubmitting ? "Adding device..." : "Add device"}
            </button>
          </div>
        </form>

        {message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.tone === "success"
                ? "border border-brand-200 bg-brand-50 text-brand-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.message}
          </div>
        ) : null}

        <div className="rounded-[1.5rem] border border-brand-100 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Your registered devices</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Last known location is based on your most recent manual location share in the student portal.
              </p>
            </div>
          </div>

          {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading your devices...</p> : null}

          {!isLoading && devices.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-brand-50/70 p-4 text-sm leading-6 text-slate-600">
              No devices have been registered yet. Add a device above to start using Find My Device Lite.
            </div>
          ) : null}

          <div className="mt-4 space-y-4">
            {devices.map((device) => {
              const action = DEVICE_STATUS_ACTIONS[device.status];
              const mapsUrl = getGoogleMapsLocationUrl(device);

              return (
                <article key={device.id} className="rounded-[1.5rem] border border-brand-100 bg-brand-50/40 p-4 shadow-soft">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-xl text-slate-900">{device.deviceName}</h3>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getDeviceStatusTone(device.status)}`}
                        >
                          {formatDeviceStatus(device.status)}
                        </span>
                      </div>

                      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Device type</p>
                          <p className="mt-2">{device.deviceType}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Last seen</p>
                          <p className="mt-2">{formatDeviceDate(device.lastSeenAt)}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-3 text-sm text-slate-600">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Last known location</p>
                        {hasSavedDeviceLocation(device) ? (
                          <div className="mt-2 space-y-2">
                            <p>{formatCoordinates(device.lastKnownLatitude!, device.lastKnownLongitude!)}</p>
                            <p>
                              Accuracy:{" "}
                              {device.lastKnownAccuracy ? `${Math.round(device.lastKnownAccuracy)} meters` : "Unavailable"}
                            </p>
                            <p>Source: {device.lastKnownSource ?? "Unavailable"}</p>
                          </div>
                        ) : (
                          <p className="mt-2 leading-6">
                            No location has been linked to this device yet. Share your current location from the tracking section to improve the latest known view.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:w-[220px]">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(device.id, action.nextStatus)}
                        disabled={actionDeviceId === device.id}
                        className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
                      >
                        {actionDeviceId === device.id ? "Updating..." : action.label}
                      </button>

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
        </div>
      </div>
    </SectionCard>
  );
}
