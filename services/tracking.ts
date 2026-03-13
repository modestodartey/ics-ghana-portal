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
import type { LocationRecord, LocationRecordDocument, SaveLocationInput } from "@/types/location";

const locationRecordsCollection = collection(firestore, "locationRecords");

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
    active: data.active !== false
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
    active: true
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
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
