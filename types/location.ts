export type TrackingMode = "manual" | "automatic";

export type LocationRecordDocument = {
  userUid: string;
  userEmail: string;
  displayName: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  createdAt: unknown;
  source: "web";
  active: boolean;
  sessionId: string | null;
  trackingMode: TrackingMode;
};

export type LocationRecord = {
  id: string;
  userUid: string;
  userEmail: string;
  displayName: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  createdAt: Date | null;
  source: "web";
  active: boolean;
  sessionId: string | null;
  trackingMode: TrackingMode;
};

export type SaveLocationInput = {
  userUid: string;
  userEmail: string;
  displayName?: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  sessionId?: string | null;
  trackingMode?: TrackingMode;
};

export type BrowserLocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: Date;
  source: "web";
};

export type LocationPermissionState =
  | "checking"
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported"
  | "unknown";
