export type DeviceStatus = "active" | "missing" | "found";

export type DeviceDocument = {
  ownerUid: string;
  ownerEmail: string;
  displayName: string;
  deviceName: string;
  deviceType: string;
  status: DeviceStatus;
  lastSeenAt: unknown;
  lastKnownLatitude: number | null;
  lastKnownLongitude: number | null;
  lastKnownAccuracy: number | null;
  lastKnownSource: string | null;
  createdAt: unknown;
  updatedAt: unknown;
};

export type DeviceRecord = {
  id: string;
  ownerUid: string;
  ownerEmail: string;
  displayName: string;
  deviceName: string;
  deviceType: string;
  status: DeviceStatus;
  lastSeenAt: Date | null;
  lastKnownLatitude: number | null;
  lastKnownLongitude: number | null;
  lastKnownAccuracy: number | null;
  lastKnownSource: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CreateDeviceInput = {
  deviceName: string;
  deviceType: string;
};

export type DeviceLocationSnapshot = {
  lastSeenAt: Date | null;
  lastKnownLatitude: number | null;
  lastKnownLongitude: number | null;
  lastKnownAccuracy: number | null;
  lastKnownSource: string | null;
};
