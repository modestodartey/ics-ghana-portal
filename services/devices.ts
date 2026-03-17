import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import type { FirebaseError } from "firebase/app";
import { firestore } from "@/lib/firebase";
import {
  getCurrentBrowserLocationSnapshot,
  getGoogleMapsUrl,
  getLatestLocationRecordForUser,
  isLiveLocationRecord
} from "@/services/tracking";
import type { AuthUser } from "@/types/auth";
import type { CreateDeviceInput, DeviceDocument, DeviceLocationSnapshot, DeviceRecord, DeviceStatus } from "@/types/device";

const devicesCollection = collection(firestore, "devices");

function toDate(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function isDeviceStatus(value: unknown): value is DeviceStatus {
  return value === "active" || value === "missing" || value === "found";
}

function mapDeviceDocument(id: string, data: Partial<DeviceDocument>): DeviceRecord {
  return {
    id,
    ownerUid: typeof data.ownerUid === "string" ? data.ownerUid : "",
    ownerEmail: typeof data.ownerEmail === "string" ? data.ownerEmail : "",
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    deviceName: typeof data.deviceName === "string" ? data.deviceName : "",
    deviceType: typeof data.deviceType === "string" ? data.deviceType : "",
    status: isDeviceStatus(data.status) ? data.status : "active",
    lastSeenAt: toDate(data.lastSeenAt),
    lastKnownLatitude: typeof data.lastKnownLatitude === "number" ? data.lastKnownLatitude : null,
    lastKnownLongitude: typeof data.lastKnownLongitude === "number" ? data.lastKnownLongitude : null,
    lastKnownAccuracy: typeof data.lastKnownAccuracy === "number" ? data.lastKnownAccuracy : null,
    lastKnownSource: typeof data.lastKnownSource === "string" ? data.lastKnownSource : null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt)
  };
}

function getEmptyLocationSnapshot(): DeviceLocationSnapshot {
  return {
    lastSeenAt: null,
    lastKnownLatitude: null,
    lastKnownLongitude: null,
    lastKnownAccuracy: null,
    lastKnownSource: null
  };
}

function getCleanString(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function mapLocationSnapshotFromRecord(record: Awaited<ReturnType<typeof getLatestLocationRecordForUser>>) {
  if (!record) {
    return null;
  }

  return {
    lastSeenAt: record.createdAt,
    lastKnownLatitude: record.latitude,
    lastKnownLongitude: record.longitude,
    lastKnownAccuracy: record.accuracy,
    lastKnownSource: record.source
  } satisfies DeviceLocationSnapshot;
}

function mapLocationSnapshotFromBrowserSnapshot(
  snapshot: Awaited<ReturnType<typeof getCurrentBrowserLocationSnapshot>>
) {
  return {
    lastSeenAt: snapshot.capturedAt,
    lastKnownLatitude: snapshot.latitude,
    lastKnownLongitude: snapshot.longitude,
    lastKnownAccuracy: snapshot.accuracy,
    lastKnownSource: snapshot.source
  } satisfies DeviceLocationSnapshot;
}

export async function getLatestSavedDeviceLocationSnapshotForUser(userUid: string) {
  try {
    const latestLocationRecord = await getLatestLocationRecordForUser(userUid);
    return mapLocationSnapshotFromRecord(latestLocationRecord);
  } catch (error) {
    console.error("ICS Ghana Portal: latest device location lookup failed.", error);
    return null;
  }
}

export async function resolveDeviceLocationSnapshotForUser(userUid: string) {
  try {
    const browserSnapshot = await getCurrentBrowserLocationSnapshot({
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    });

    return {
      snapshot: mapLocationSnapshotFromBrowserSnapshot(browserSnapshot),
      mode: "fresh" as const
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.info("ICS Ghana Portal: fresh device location capture was unavailable.", error);
    }
  }

  const latestSavedSnapshot = await getLatestSavedDeviceLocationSnapshotForUser(userUid);

  if (latestSavedSnapshot) {
    return {
      snapshot: latestSavedSnapshot,
      mode: "latest_saved" as const
    };
  }

  return {
    snapshot: null,
    mode: "none" as const
  };
}

async function getLocationSnapshotForUser(userUid: string) {
  return (await getLatestSavedDeviceLocationSnapshotForUser(userUid)) ?? null;
}

function sortDevices(devices: DeviceRecord[]) {
  return [...devices].sort((left, right) => {
    const leftTime = left.updatedAt?.getTime() ?? left.createdAt?.getTime() ?? 0;
    const rightTime = right.updatedAt?.getTime() ?? right.createdAt?.getTime() ?? 0;

    return rightTime - leftTime;
  });
}

export async function createDevice(
  input: CreateDeviceInput,
  user: AuthUser,
  preferredLocationSnapshot?: DeviceLocationSnapshot | null,
  preferredLocationMode: "fresh" | "latest_saved" | "none" = preferredLocationSnapshot ? "fresh" : "none"
) {
  const locationSnapshot =
    preferredLocationSnapshot ?? (await getLocationSnapshotForUser(user.uid)) ?? getEmptyLocationSnapshot();
  const ownerUid = getCleanString(user.uid);
  const ownerEmail = getCleanString(user.email).toLowerCase();
  const displayName = getCleanString(user.displayName) || ownerEmail;

  await addDoc(devicesCollection, {
    ownerUid,
    ownerEmail,
    displayName,
    deviceName: input.deviceName.trim(),
    deviceType: input.deviceType.trim(),
    status: "active",
    ...locationSnapshot,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return {
    linkedLocation: locationSnapshot.lastKnownLatitude !== null && locationSnapshot.lastKnownLongitude !== null,
    linkedLocationMode:
      locationSnapshot.lastKnownLatitude !== null && locationSnapshot.lastKnownLongitude !== null
        ? preferredLocationMode === "none"
          ? "latest_saved"
          : preferredLocationMode
        : "none"
  };
}

export function getFriendlyDeviceErrorMessage(error: unknown) {
  const fallback = "We could not register this device right now. Please try again.";
  const firebaseError = error as FirebaseError | undefined;

  if (!firebaseError || typeof firebaseError.code !== "string") {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  switch (firebaseError.code) {
    case "permission-denied":
      return "Device registration is blocked by your current Firestore permissions.";
    case "failed-precondition":
      return "Device registration needs one small Firestore index or setup update before it can finish.";
    case "unavailable":
      return "The device service is temporarily unavailable. Please try again in a moment.";
    default:
      return firebaseError.message || fallback;
  }
}

export function subscribeToUserDevices(
  userUid: string,
  onData: (devices: DeviceRecord[]) => void,
  onError: (message: string) => void
) {
  const devicesQuery = query(devicesCollection, where("ownerUid", "==", userUid));

  return onSnapshot(
    devicesQuery,
    (snapshot) => {
      const devices = snapshot.docs.map((snapshotDocument) =>
        mapDeviceDocument(snapshotDocument.id, snapshotDocument.data() as Partial<DeviceDocument>)
      );

      onData(sortDevices(devices));
    },
    () => {
      onError("We could not load your registered devices right now.");
    }
  );
}

export function subscribeToAllDevices(
  onData: (devices: DeviceRecord[]) => void,
  onError: (message: string) => void
) {
  const devicesQuery = query(devicesCollection, orderBy("updatedAt", "desc"));

  return onSnapshot(
    devicesQuery,
    (snapshot) => {
      const devices = snapshot.docs.map((snapshotDocument) =>
        mapDeviceDocument(snapshotDocument.id, snapshotDocument.data() as Partial<DeviceDocument>)
      );

      onData(sortDevices(devices));
    },
    () => {
      onError("We could not load devices right now.");
    }
  );
}

export async function updateDeviceStatus(deviceId: string, ownerUid: string, status: DeviceStatus) {
  const locationSnapshot = await getLocationSnapshotForUser(ownerUid);
  const updatePayload: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp()
  };

  if (locationSnapshot) {
    updatePayload.lastSeenAt = locationSnapshot.lastSeenAt;
    updatePayload.lastKnownLatitude = locationSnapshot.lastKnownLatitude;
    updatePayload.lastKnownLongitude = locationSnapshot.lastKnownLongitude;
    updatePayload.lastKnownAccuracy = locationSnapshot.lastKnownAccuracy;
    updatePayload.lastKnownSource = locationSnapshot.lastKnownSource;
  }

  await updateDoc(doc(firestore, "devices", deviceId), updatePayload);
}

export async function syncMissingDevicesLocationForOwner(
  ownerUid: string,
  locationSnapshot: DeviceLocationSnapshot
) {
  const devicesSnapshot = await getDocs(query(devicesCollection, where("ownerUid", "==", ownerUid)));
  const missingDevices = devicesSnapshot.docs.filter((snapshotDocument) => {
    const data = snapshotDocument.data() as Partial<DeviceDocument>;
    return data.status === "missing";
  });

  if (missingDevices.length === 0) {
    return 0;
  }

  await Promise.all(
    missingDevices.map((snapshotDocument) =>
      updateDoc(doc(firestore, "devices", snapshotDocument.id), {
        ...locationSnapshot,
        updatedAt: serverTimestamp()
      })
    )
  );

  return missingDevices.length;
}

export function formatDeviceDate(date: Date | null) {
  if (!date) {
    return "No saved time yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function formatDeviceStatus(status: DeviceStatus) {
  switch (status) {
    case "missing":
      return "Missing";
    case "found":
      return "Found";
    default:
      return "Active";
  }
}

export function getDeviceStatusTone(status: DeviceStatus) {
  switch (status) {
    case "missing":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "found":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    default:
      return "border-brand-200 bg-brand-50 text-brand-700";
  }
}

export function hasSavedDeviceLocation(device: DeviceRecord) {
  return typeof device.lastKnownLatitude === "number" && typeof device.lastKnownLongitude === "number";
}

export function getGoogleMapsLocationUrl(device: DeviceRecord) {
  if (!hasSavedDeviceLocation(device)) {
    return null;
  }

  return getGoogleMapsUrl(device.lastKnownLatitude!, device.lastKnownLongitude!);
}

export function isDeviceLocationLive(device: DeviceRecord) {
  if (!device.lastSeenAt || !hasSavedDeviceLocation(device)) {
    return false;
  }

  return isLiveLocationRecord(
    {
      id: device.id,
      userUid: device.ownerUid,
      userEmail: device.ownerEmail,
      displayName: device.displayName,
      latitude: device.lastKnownLatitude!,
      longitude: device.lastKnownLongitude!,
      accuracy: device.lastKnownAccuracy,
      createdAt: device.lastSeenAt,
      source: "web",
      active: true,
      sessionId: null,
      trackingMode: "automatic"
    },
    Date.now()
  );
}

export function getDeviceLocationStateLabel(device: DeviceRecord) {
  if (!hasSavedDeviceLocation(device)) {
    return "No location saved yet";
  }

  return isDeviceLocationLive(device) ? "Live now" : "Last known";
}
