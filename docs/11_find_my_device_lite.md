# Find My Device MVP

## What Was Built
The portal now includes a simple Find My Device feature for students.

Current scope:
- students can register one or more devices
- students can mark a device as missing
- students can mark a missing device as found and then return it to active status
- students can review the latest saved location linked to a device
- students can see whether a device appears live right now or is showing only its last known location
- students can open the latest known location in Google Maps
- admins can search location records by email and open saved results in Google Maps
- admins can open a dedicated devices page to review registered devices, missing-device status, and saved location availability
- missing devices can keep updating from the student&apos;s active browser session while location permission remains granted

This is still a lightweight browser-session MVP. It does not run in the background after the active session ends.

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

## How Device Registration Links Location
Find My Device reuses the student&apos;s available portal location from the tracking feature.

Current behavior:
1. when the student clicks `Add device`, the portal first tries to capture a fresh current location
2. if a fresh current location is not available, the app falls back to the latest saved student location already in Firestore
3. the app saves that available location snapshot into the device record when the device is created
4. if no location is available yet, the device is still created and clearly shows that no location has been saved yet

This means the stored location is a simple account-level snapshot, not a true device-specific live location.

If no location is available yet, the device can still be registered and its location fields simply remain empty until a later session update is available.

## Missing Device Tracking
When a student marks a device as missing:
- the device status changes to `missing`
- the latest known location stays visible on the device card
- the card keeps showing the most recent saved time and accuracy
- if the same student browser session is active and location tracking is still running, new session location saves also refresh any missing-device records for that student

In this MVP, `live` means the missing device is showing a very recent browser-session location update. `Last known` means the device is showing the most recent saved snapshot, but no fresh session update has arrived recently.

## How Google Maps Links Work
If a device has saved latitude and longitude values, the portal creates a Google Maps link in this format:

```txt
https://www.google.com/maps?q=latitude,longitude
```

The link opens in a new tab so the student can review the last known point quickly.

## Current Limitations
- device location is based on the student&apos;s latest available portal location, not on a device-specific live signal
- there is no background tracking
- live updates work only while the student&apos;s browser session remains open and location permission stays granted
- there is no embedded map in the portal
- admins have a read-only overview rather than full device management controls
- admin location search is still a simple Firestore-backed filter, not a full people directory

## What Would Be Needed Later
For stronger device finding:
- device-specific location reporting
- real live updates
- background or scheduled tracking where appropriate
- stronger device ownership and audit controls
- mobile app support
- smartwatch and wearable integration where useful
