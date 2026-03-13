"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatCoordinates,
  formatLocationDate,
  getFriendlyLocationSaveErrorMessage,
  saveLocationRecord,
  subscribeToUserLocationRecords
} from "@/services/tracking";
import type { LocationPermissionState, LocationRecord } from "@/types/location";

type TrackingStatusTone = "neutral" | "success" | "error";

type TrackingStatus = {
  message: string;
  tone: TrackingStatusTone;
};

function getPermissionLabel(permissionState: LocationPermissionState) {
  switch (permissionState) {
    case "checking":
      return "Checking browser permission...";
    case "prompt":
      return "Your browser will ask for permission when you choose to share.";
    case "granted":
      return "Location permission is already available.";
    case "denied":
      return "Location permission was denied in the browser.";
    case "unsupported":
      return "This browser does not support location sharing.";
    default:
      return "Permission status is not available yet.";
  }
}

function getErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission was denied. Please allow location access if you want to share your current location.";
    case error.POSITION_UNAVAILABLE:
      return "Your current location could not be determined right now. Please try again.";
    case error.TIMEOUT:
      return "The location request timed out. Please try again.";
    default:
      return "We could not get your current location right now.";
  }
}

export function StudentLocationShare() {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState<LocationPermissionState>("checking");
  const [records, setRecords] = useState<LocationRecord[]>([]);
  const [status, setStatus] = useState<TrackingStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeToUserLocationRecords(
      user.uid,
      (nextRecords) => {
        setRecords(nextRecords);
        setIsLoadingHistory(false);
      },
      (message) => {
        setStatus({ message, tone: "error" });
        setIsLoadingHistory(false);
      }
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setPermissionState("unsupported");
      return;
    }

    if (!("permissions" in navigator) || typeof navigator.permissions.query !== "function") {
      setPermissionState("unknown");
      return;
    }

    let isActive = true;

    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((permissionStatus) => {
        if (!isActive) {
          return;
        }

        setPermissionState(permissionStatus.state as LocationPermissionState);

        permissionStatus.onchange = () => {
          setPermissionState(permissionStatus.state as LocationPermissionState);
        };
      })
      .catch(() => {
        if (isActive) {
          setPermissionState("unknown");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const latestRecord = useMemo(() => records[0] ?? null, [records]);

  function handleShareLocation() {
    if (!user) {
      setStatus({ message: "You must be signed in to share your location.", tone: "error" });
      return;
    }

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setPermissionState("unsupported");
      setStatus({ message: "This browser does not support location sharing.", tone: "error" });
      return;
    }

    setIsSaving(true);
    setStatus({ message: "Requesting permission and current location...", tone: "neutral" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await saveLocationRecord({
            userUid: user.uid,
            userEmail: user.email,
            displayName: user.displayName,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? null
          });

          setPermissionState("granted");
          setStatus({ message: "Location captured and saved successfully.", tone: "success" });
        } catch (error) {
          console.error("ICS Ghana Portal: location save failed.", {
            error,
            userUid: user.uid,
            userEmail: user.email,
            displayName: user.displayName,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? null
          });

          setStatus({ message: getFriendlyLocationSaveErrorMessage(error), tone: "error" });
        } finally {
          setIsSaving(false);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState("denied");
        }

        setStatus({ message: getErrorMessage(error), tone: "error" });
        setIsSaving(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  return (
    <SectionCard
      title="Location sharing"
      description="Share your current location manually when needed. This MVP does not track continuously or in the background."
      className="bg-white/95"
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-brand-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Permission status</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{getPermissionLabel(permissionState)}</p>
        </div>

        {status ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              status.tone === "success"
                ? "border border-brand-200 bg-brand-50 text-brand-700"
                : status.tone === "error"
                  ? "border border-red-200 bg-red-50 text-red-700"
                  : "border border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleShareLocation}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          {isSaving ? "Saving current location..." : "Share current location"}
        </button>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-brand-100 bg-white p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Latest saved location</p>
            {latestRecord ? (
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Coordinates: {formatCoordinates(latestRecord.latitude, latestRecord.longitude)}</p>
                <p>Accuracy: {latestRecord.accuracy ? `${Math.round(latestRecord.accuracy)} meters` : "Unavailable"}</p>
                <p>Saved: {formatLocationDate(latestRecord.createdAt)}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-500">No location has been saved yet.</p>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-brand-100 bg-white p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Recent history</p>
            {isLoadingHistory ? <p className="mt-3 text-sm text-slate-500">Loading your saved history...</p> : null}
            {!isLoadingHistory && records.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-500">Your recent location history will appear here after you share a location.</p>
            ) : null}
            <div className="mt-3 space-y-3">
              {records.slice(0, 3).map((record) => (
                <div key={record.id} className="rounded-2xl bg-brand-50/60 p-3 text-sm text-slate-600">
                  <p>{formatCoordinates(record.latitude, record.longitude)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-700">
                    {formatLocationDate(record.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
