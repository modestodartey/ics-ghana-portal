# Find My Device Lite MVP

## What Was Built
The portal now includes a simple Find My Device Lite feature for students.

Current scope:
- students can register one or more devices
- students can mark a device as missing
- students can mark a missing device as found and then return it to active status
- students can review the latest saved location linked to a device
- students can open the latest known location in Google Maps
- admins can search location records by email and open saved results in Google Maps

This is a lightweight MVP. It is not live tracking and it does not run in the background.

## Firestore Device Structure
Collection:
- `devices`

Each device document currently uses this shape:

```ts
{
  ownerUid: string,
  ownerEmail: string,
  displayName: string,
  deviceName: string,
  deviceType: string,
  status: "active" | "missing" | "found",
  lastSeenAt: timestamp | null,
  lastKnownLatitude: number | null,
  lastKnownLongitude: number | null,
  lastKnownAccuracy: number | null,
  lastKnownSource: string | null,
  createdAt: server timestamp,
  updatedAt: server timestamp
}
```

This keeps the MVP easy to read and easy to maintain.

## How Device Status Works
Each registered device has a simple status:
- `active` for normal use
- `missing` when the student cannot find the device
- `found` after the device is recovered

Students can move between these states directly from the student portal.

## How Last Known Location Works
Find My Device Lite reuses the student&apos;s latest manually shared location from the existing tracking feature.

Current behavior:
1. the student shares their current location from the tracking section
2. the student adds a device or changes its status
3. the app saves a snapshot of the latest available location into the device record

This means the stored location is a simple account-level snapshot, not a true device-specific live location.

If the latest location lookup is unavailable, the device can still be registered and its location fields simply remain empty until a later location share or status update.

## How Google Maps Links Work
If a device has saved latitude and longitude values, the portal creates a Google Maps link in this format:

```txt
https://www.google.com/maps?q=latitude,longitude
```

The link opens in a new tab so the student can review the last known point quickly.

## Current Limitations
- device location is based on the student&apos;s latest manual location share
- there is no background tracking
- there is no live device ping or live device status
- there is no embedded map in the portal
- admins do not manage devices in this MVP step
- admin email search is still a simple Firestore-backed filter, not a full people directory

## What Would Be Needed Later
For stronger device finding:
- device-specific location reporting
- real live updates
- background or scheduled tracking where appropriate
- stronger device ownership and audit controls
- mobile app support
- smartwatch and wearable integration where useful
