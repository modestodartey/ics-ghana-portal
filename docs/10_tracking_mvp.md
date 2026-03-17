# Tracking MVP

## What Was Built
The project now includes a web-based tracking MVP with automatic session tracking.

Current scope:
- Students see a location-permission gate near the top of the student portal
- Students can grant or deny browser location permission
- After permission is granted, the portal starts tracking automatically for the active logged-in browser session
- The app captures an initial location and continues to save live session updates with `watchPosition`
- Students can see their latest saved location and a short recent history
- Admins can view the latest known locations and recent location history in a simple readable list view
- Admins can distinguish live session updates from older latest-saved records
- Admins can search the tracking page by student name or email
- Admins can page through longer tracking history without turning the dashboard into a long list
- Google Maps links now open using satellite view when location data is available
- Accuracy values are stored and shown so approximate locations are easier to understand
- Missing devices can reuse active student session updates to refresh their latest known device location

This remains browser-session tracking only. It does not run in the background after the session ends.

## Firestore Tracking Structure
Collection:
- `locationRecords`

Each location record currently uses this simple shape:

```ts
{
  userUid: string,
  userEmail: string,
  displayName: string,
  latitude: number,
  longitude: number,
  accuracy: number | null,
  createdAt: server timestamp,
  source: "web",
  active: true,
  sessionId: string | null,
  trackingMode: "manual" | "automatic"
}
```

This structure keeps the MVP easy to understand and easy to query.

## How Permission Handling Works
The student portal checks browser location support and, when possible, checks browser permission state.

Current behavior:
- if supported, the UI shows whether permission is granted, denied, or still waiting for the browser prompt
- if permission has not been granted yet, the location gate is the main first-step experience in the student portal
- when the student clicks `Allow location access`, the browser Geolocation API requests access
- if permission is denied or location is unavailable, a clear message is shown
- if permission is already granted, automatic tracking begins without extra manual share buttons

## How Current-Location Sharing Works
Location sharing is now automatic for the active browser session after permission is granted:
1. The student signs in
2. The student sees the location access gate at the top of the student portal
3. The student grants browser permission
4. The portal captures an initial current location
5. The portal starts `watchPosition` and saves additional session updates while the student stays logged in and the browser session remains active

The app writes session-based live updates only while the portal is open and the browser allows geolocation updates.

## Limitations Of Web-Based Tracking
- Browser location depends on device support and browser permission settings
- Accuracy varies by device and network conditions
- Browsers may be less reliable than dedicated mobile apps for location use cases
- The current MVP supports live browser-session updates, but not true background tracking
- Live status on the admin side is inferred from recent automatic updates, not from a separate persistent heartbeat service
- There is no map view in this MVP

## Accuracy Handling
The portal requests high-accuracy browser geolocation where practical.

Current behavior:
- if the browser returns an accuracy value, that value is saved with the location record
- the portal now requests high-accuracy readings with `enableHighAccuracy: true`, `maximumAge: 0`, and a bounded timeout
- the initial location capture can compare a few readings and keep the best available accuracy before saving
- the student and admin views show that accuracy in a concise format such as `Approx. ±18 m`
- if the accuracy is broad, the UI makes it clear that the saved location is approximate
- if no accuracy value is available, the location is still saved and shown

## Admin Page Structure
The admin experience is now split into two levels:
- `/admin` keeps a short tracking preview for the latest saved records
- `/admin/tracking` holds the full search, pagination, and recent-history view

This keeps the dashboard compact even when many location records exist.

## Privacy Considerations
- Students are not tracked until browser permission is granted
- Automatic tracking begins only after the student allows browser location access
- The implementation is browser-based and session-based, not background-based
- Admin views are protected behind admin authentication and role checks
- Firestore security rules for location data should be strengthened later

## What Would Be Needed Later
For stronger tracking:
- background tracking support
- mobile app support
- smartwatch support
- true device-specific live finding instead of account-level session reuse

For richer location features:
- maps and pins
- geofencing
- delivered and processed tracking events
- stronger audit logging
- Firestore security rules specific to location data
