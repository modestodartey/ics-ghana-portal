import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where
} from "firebase/firestore";
import type { FirebaseError } from "firebase/app";
import { firestore } from "@/lib/firebase";
import type {
  BrowserLocationSnapshot,
  LocationRecord,
  LocationRecordDocument,
  SaveLocationInput,
  TrackingMode
} from "@/types/location";

const locationRecordsCollection = collection(firestore, "locationRecords");
const LIVE_LOCATION_WINDOW_MS = 90 * 1000;
const DEFAULT_HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 15000
};
const BEST_POSITION_SAMPLE_LIMIT = 3;
const BEST_POSITION_SAMPLE_WINDOW_MS = 12000;
const DESIRED_ACCURACY_METERS = 20;

function isTrackingMode(value: unknown): value is TrackingMode {
  return value === "automatic" || value === "manual";
}

function toDate(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  return null;
}

function mapLocationRecord(id: string, data: Partial<LocationRecordDocument>): LocationRecord {
  return {
    id,
    userUid: typeof data.userUid === "string" ? data.userUid : "",
    userEmail: typeof data.userEmail === "string" ? data.userEmail : "",
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    latitude: typeof data.latitude === "number" ? data.latitude : 0,
    longitude: typeof data.longitude === "number" ? data.longitude : 0,
    accuracy: typeof data.accuracy === "number" ? data.accuracy : null,
    createdAt: toDate(data.createdAt),
    source: data.source === "web" ? "web" : "web",
    active: data.active !== false,
    sessionId: typeof data.sessionId === "string" && data.sessionId.trim() ? data.sessionId : null,
    trackingMode: isTrackingMode(data.trackingMode) ? data.trackingMode : "manual"
  };
}

function getCleanString(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function buildLocationRecordPayload(input: SaveLocationInput) {
  const userUid = getCleanString(input.userUid);
  const userEmail = getCleanString(input.userEmail).toLowerCase();
  const displayName = getCleanString(input.displayName) || userEmail;

  if (!userUid) {
    throw new Error("The current session is missing a user ID for location saving.");
  }

  if (!userEmail) {
    throw new Error("The current session is missing an email address for location saving.");
  }

  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
    throw new Error("The captured location coordinates were invalid.");
  }

  return {
    userUid,
    userEmail,
    displayName,
    latitude: input.latitude,
    longitude: input.longitude,
    accuracy: Number.isFinite(input.accuracy) ? input.accuracy : null,
    createdAt: serverTimestamp(),
    source: "web" as const,
    active: true,
    sessionId: getCleanString(input.sessionId) || null,
    trackingMode: input.trackingMode === "automatic" ? "automatic" : "manual"
  };
}

export async function saveLocationRecord(input: SaveLocationInput) {
  const payload = buildLocationRecordPayload(input);

  await addDoc(locationRecordsCollection, payload);
}

export function getFriendlyLocationSaveErrorMessage(error: unknown) {
  const fallback = "We captured your location, but could not save it right now.";
  const firebaseError = error as FirebaseError | undefined;

  if (!firebaseError || typeof firebaseError.code !== "string") {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  switch (firebaseError.code) {
    case "permission-denied":
      return "Location saving is blocked by your current Firestore permissions.";
    case "unavailable":
      return "The location service is temporarily unavailable. Please try again in a moment.";
    case "failed-precondition":
      return "Location saving needs one Firestore setup update before it can finish.";
    default:
      return firebaseError.message || fallback;
  }
}

function getGeolocationApi() {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return null;
  }

  return navigator.geolocation;
}

export async function getCurrentBrowserPosition(options?: PositionOptions) {
  const geolocation = getGeolocationApi();

  if (!geolocation) {
    throw new Error("This browser does not support location sharing.");
  }

  return new Promise<GeolocationPosition>((resolve, reject) => {
    geolocation.getCurrentPosition(resolve, reject, {
      ...DEFAULT_HIGH_ACCURACY_OPTIONS,
      ...options
    });
  });
}

function getAccuracyValue(position: GeolocationPosition | null) {
  if (!position) {
    return Number.POSITIVE_INFINITY;
  }

  return Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : Number.POSITIVE_INFINITY;
}

function getBetterPosition(
  currentBest: GeolocationPosition | null,
  candidate: GeolocationPosition
) {
  return getAccuracyValue(candidate) < getAccuracyValue(currentBest) ? candidate : currentBest;
}

export async function getBestAvailableBrowserPosition(options?: PositionOptions) {
  const geolocation = getGeolocationApi();

  if (!geolocation) {
    throw new Error("This browser does not support location sharing.");
  }

  return new Promise<GeolocationPosition>((resolve, reject) => {
    let bestPosition: GeolocationPosition | null = null;
    let sampleCount = 0;
    let watchId: number | null = null;
    let isSettled = false;

    const finish = (position: GeolocationPosition | null, error?: GeolocationPositionError | Error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;

      if (watchId !== null) {
        geolocation.clearWatch(watchId);
      }

      clearTimeout(timeoutId);

      if (position) {
        resolve(position);
        return;
      }

      reject(error ?? new Error("We could not get a browser location reading."));
    };

    const timeoutId = setTimeout(() => {
      finish(bestPosition, bestPosition ? undefined : new Error("The location request timed out before a reading was captured."));
    }, BEST_POSITION_SAMPLE_WINDOW_MS);

    watchId = geolocation.watchPosition(
      (position) => {
        sampleCount += 1;
        bestPosition = getBetterPosition(bestPosition, position);

        if (
          sampleCount >= BEST_POSITION_SAMPLE_LIMIT ||
          getAccuracyValue(bestPosition) <= DESIRED_ACCURACY_METERS
        ) {
          finish(bestPosition);
        }
      },
      (error) => {
        finish(bestPosition, error);
      },
      {
        ...DEFAULT_HIGH_ACCURACY_OPTIONS,
        ...options,
        enableHighAccuracy: true,
        maximumAge: 0
      }
    );
  });
}

export async function getCurrentBrowserLocationSnapshotIfPermitted(options?: PositionOptions) {
  if (typeof navigator === "undefined") {
    return null;
  }

  const geolocation = getGeolocationApi();

  if (!geolocation) {
    return null;
  }

  if ("permissions" in navigator && typeof navigator.permissions.query === "function") {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "geolocation" as PermissionName });

      if (permissionStatus.state !== "granted") {
        return null;
      }
    } catch {
      return null;
    }
  } else {
    return null;
  }

  const position = await getBestAvailableBrowserPosition(options);

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
    capturedAt: new Date(),
    source: "web"
  } satisfies BrowserLocationSnapshot;
}

export async function getCurrentBrowserLocationSnapshot(options?: PositionOptions) {
  const position = await getBestAvailableBrowserPosition(options);

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
    capturedAt: new Date(),
    source: "web"
  } satisfies BrowserLocationSnapshot;
}

export function subscribeToUserLocationRecords(
  userUid: string,
  onData: (records: LocationRecord[]) => void,
  onError: (message: string) => void
) {
  const locationQuery = query(
    locationRecordsCollection,
    where("userUid", "==", userUid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    locationQuery,
    (snapshot) => {
      onData(snapshot.docs.map((snapshotDocument) => mapLocationRecord(snapshotDocument.id, snapshotDocument.data())));
    },
    () => {
      onError("We could not load your saved location records right now.");
    }
  );
}

export function subscribeToAllLocationRecords(
  onData: (records: LocationRecord[]) => void,
  onError: (message: string) => void
) {
  const locationQuery = query(locationRecordsCollection, orderBy("createdAt", "desc"));

  return onSnapshot(
    locationQuery,
    (snapshot) => {
      onData(snapshot.docs.map((snapshotDocument) => mapLocationRecord(snapshotDocument.id, snapshotDocument.data())));
    },
    () => {
      onError("We could not load location records right now. Please refresh and try again.");
    }
  );
}

export async function getLatestLocationRecordForUser(userUid: string) {
  const locationQuery = query(
    locationRecordsCollection,
    where("userUid", "==", userUid),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(locationQuery);
  const latestRecord = snapshot.docs[0];

  if (!latestRecord) {
    return null;
  }

  return mapLocationRecord(latestRecord.id, latestRecord.data());
}

export function formatLocationDate(date: Date | null) {
  if (!date) {
    return "Saving...";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function getGoogleMapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}&t=k`;
}

export function isLiveLocationRecord(record: LocationRecord, now = Date.now()) {
  if (record.trackingMode !== "automatic" || !record.createdAt) {
    return false;
  }

  return now - record.createdAt.getTime() <= LIVE_LOCATION_WINDOW_MS;
}

export function formatLocationFreshness(record: LocationRecord) {
  return isLiveLocationRecord(record) ? "Live now" : "Latest saved";
}

export function isApproximateLocation(accuracy: number | null) {
  return typeof accuracy === "number" && accuracy > 100;
}

export function formatAccuracyLabel(accuracy: number | null) {
  if (accuracy === null) {
    return "Accuracy unavailable";
  }

  const roundedAccuracy = Math.max(1, Math.round(accuracy));

  return isApproximateLocation(accuracy)
    ? `Approx. ±${roundedAccuracy} m (low precision)`
    : `Approx. ±${roundedAccuracy} m`;
}
