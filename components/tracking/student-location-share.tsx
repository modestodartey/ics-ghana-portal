"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { syncMissingDevicesLocationForOwner } from "@/services/devices";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatAccuracyLabel,
  formatCoordinates,
  formatLocationDate,
  getBestAvailableBrowserPosition,
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

type SavedLocationMeta = {
  latitude: number;
  longitude: number;
  savedAtMs: number;
};

const AUTO_SAVE_INTERVAL_MS = 15 * 1000;
const AUTO_SAVE_DISTANCE_METERS = 15;

function getPermissionLabel(permissionState: LocationPermissionState) {
  switch (permissionState) {
    case "checking":
      return "Checking browser permission...";
    case "prompt":
      return "Location access is needed to keep your session location current while you are signed in.";
    case "granted":
      return "Location access is enabled for this browser.";
    case "denied":
      return "Location access has been denied in this browser.";
    case "unsupported":
      return "This browser does not support location sharing.";
    default:
      return "Location access is ready to be requested.";
  }
}

function getErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission was denied. Please allow access in your browser if you want live session tracking.";
    case error.POSITION_UNAVAILABLE:
      return "Your current location could not be determined right now. The portal will keep trying while this session stays open.";
    case error.TIMEOUT:
      return "The location request timed out. The portal will try again automatically while this session remains active.";
    default:
      return "We could not get your current location right now.";
  }
}

function createTrackingSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `tracking-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(
  previousLatitude: number,
  previousLongitude: number,
  nextLatitude: number,
  nextLongitude: number
) {
  const earthRadiusMeters = 6371000;
  const latitudeDelta = toRadians(nextLatitude - previousLatitude);
  const longitudeDelta = toRadians(nextLongitude - previousLongitude);
  const previousLatitudeRadians = toRadians(previousLatitude);
  const nextLatitudeRadians = toRadians(nextLatitude);

  const haversineValue =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(previousLatitudeRadians) *
      Math.cos(nextLatitudeRadians) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  const arc = 2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

  return earthRadiusMeters * arc;
}

function shouldSaveTrackedLocation(
  previousLocation: SavedLocationMeta | null,
  nextLatitude: number,
  nextLongitude: number,
  now: number
) {
  if (!previousLocation) {
    return true;
  }

  if (now - previousLocation.savedAtMs >= AUTO_SAVE_INTERVAL_MS) {
    return true;
  }

  return (
    calculateDistanceMeters(
      previousLocation.latitude,
      previousLocation.longitude,
      nextLatitude,
      nextLongitude
    ) >= AUTO_SAVE_DISTANCE_METERS
  );
}

export function StudentLocationShare() {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState<LocationPermissionState>("checking");
  const [records, setRecords] = useState<LocationRecord[]>([]);
  const [status, setStatus] = useState<TrackingStatus | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const trackingSessionIdRef = useRef<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSavedLocationRef = useRef<SavedLocationMeta | null>(null);

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
    let permissionStatusReference: PermissionStatus | null = null;

    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((permissionStatus) => {
        if (!isActive) {
          return;
        }

        permissionStatusReference = permissionStatus;
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

      if (permissionStatusReference) {
        permissionStatusReference.onchange = null;
      }
    };
  }, []);

  const latestRecord = useMemo(() => records[0] ?? null, [records]);

  async function persistPosition(position: GeolocationPosition) {
    if (!user) {
      return;
    }

    const now = Date.now();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy ?? null;

    if (!shouldSaveTrackedLocation(lastSavedLocationRef.current, latitude, longitude, now)) {
      return;
    }

    const sessionId = trackingSessionIdRef.current ?? createTrackingSessionId();
    trackingSessionIdRef.current = sessionId;

    await saveLocationRecord({
      userUid: user.uid,
      userEmail: user.email,
      displayName: user.displayName,
      latitude,
      longitude,
      accuracy,
      sessionId,
      trackingMode: "automatic"
    });

    await syncMissingDevicesLocationForOwner(user.uid, {
      lastSeenAt: new Date(now),
      lastKnownLatitude: latitude,
      lastKnownLongitude: longitude,
      lastKnownAccuracy: accuracy,
      lastKnownSource: "web"
    }).catch((error) => {
      console.error("ICS Ghana Portal: missing device location sync failed.", error);
    });

    lastSavedLocationRef.current = {
      latitude,
      longitude,
      savedAtMs: now
    };
  }

  async function handleRequestLocationAccess() {
    if (!user) {
      setStatus({ message: "You must be signed in to enable location tracking.", tone: "error" });
      return;
    }

    setIsRequestingPermission(true);
    setStatus({ message: "Requesting browser permission and your current location...", tone: "neutral" });

    try {
      const position = await getBestAvailableBrowserPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      await persistPosition(position);
      setPermissionState("granted");
      setStatus({
        message: "Location access enabled. Live session tracking is now active while you stay signed in.",
        tone: "success"
      });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const geolocationError = error as GeolocationPositionError;

        if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
          setPermissionState("denied");
        }

        setStatus({ message: getErrorMessage(geolocationError), tone: "error" });
      } else {
        setStatus({ message: getFriendlyLocationSaveErrorMessage(error), tone: "error" });
      }
    } finally {
      setIsRequestingPermission(false);
    }
  }

  useEffect(() => {
    if (!user || permissionState !== "granted" || typeof navigator === "undefined" || !("geolocation" in navigator)) {
      if (watchIdRef.current !== null && typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (permissionState !== "granted") {
        setIsTrackingActive(false);
      }

      return;
    }

    trackingSessionIdRef.current = trackingSessionIdRef.current ?? createTrackingSessionId();
    setIsTrackingActive(true);

    void getBestAvailableBrowserPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    })
      .then((position) => persistPosition(position))
      .then(() => {
        setStatus((currentStatus) =>
          currentStatus?.tone === "error"
            ? currentStatus
            : {
                message: "Live session tracking is active while this portal session remains open.",
                tone: "success"
              }
        );
      })
      .catch((error) => {
        if (error && typeof error === "object" && "code" in error) {
          const geolocationError = error as GeolocationPositionError;

          if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
            setPermissionState("denied");
            setIsTrackingActive(false);
          }

          setStatus({ message: getErrorMessage(geolocationError), tone: "error" });
          return;
        }

        setStatus({ message: getFriendlyLocationSaveErrorMessage(error), tone: "error" });
      });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        void persistPosition(position).catch((error) => {
          console.error("ICS Ghana Portal: automatic location save failed.", error);
          setStatus({ message: getFriendlyLocationSaveErrorMessage(error), tone: "error" });
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState("denied");
        }

        setIsTrackingActive(false);
        setStatus({ message: getErrorMessage(error), tone: "error" });
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );

    watchIdRef.current = watchId;

    return () => {
      navigator.geolocation.clearWatch(watchId);
      watchIdRef.current = null;
    };
  }, [permissionState, user]);

  return (
    <SectionCard
      title="Live location access"
      description="Enable location once to keep your current session location updated automatically while you remain signed in."
      className="bg-white/95"
    >
      <div className="space-y-4">
        <div className="rounded-[1.6rem] border border-brand-100 bg-brand-50/70 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Permission status</p>
              <p className="text-sm leading-7 text-slate-600">{getPermissionLabel(permissionState)}</p>
            </div>

            {permissionState === "prompt" || permissionState === "unknown" ? (
              <button
                type="button"
                onClick={handleRequestLocationAccess}
                disabled={isRequestingPermission}
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
              >
                {isRequestingPermission ? "Requesting access..." : "Allow location access"}
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Session tracking</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isTrackingActive && permissionState === "granted"
                  ? "Active now. The portal is saving live session updates automatically."
                  : permissionState === "denied"
                    ? "Blocked until browser location access is allowed."
                    : permissionState === "granted"
                      ? "Preparing automatic tracking for this session."
                      : "Waiting for location permission before automatic tracking can begin."}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Student note</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You do not need to keep clicking separate share buttons after permission is granted.
              </p>
            </div>
          </div>
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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-brand-100 bg-white p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Latest saved location</p>
            {latestRecord ? (
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Coordinates: {formatCoordinates(latestRecord.latitude, latestRecord.longitude)}</p>
                <p>Accuracy: {formatAccuracyLabel(latestRecord.accuracy)}</p>
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
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Your session history will appear here after location access is granted and tracking begins.
              </p>
            ) : null}
            <div className="mt-3 space-y-3">
              {records.slice(0, 3).map((record) => (
                <div key={record.id} className="rounded-2xl bg-brand-50/60 p-3 text-sm text-slate-600">
                  <p>{formatCoordinates(record.latitude, record.longitude)}</p>
                  <p className="mt-1">Accuracy: {formatAccuracyLabel(record.accuracy)}</p>
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
