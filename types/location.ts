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
};

export type SaveLocationInput = {
  userUid: string;
  userEmail: string;
  displayName?: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type LocationPermissionState =
  | "checking"
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported"
  | "unknown";
