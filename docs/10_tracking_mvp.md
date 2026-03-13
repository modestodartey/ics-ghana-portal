# Tracking MVP

## What Was Built
The project now includes a basic web-based tracking MVP.

Current scope:
- Students can manually share their current location from the student portal
- The browser Geolocation API is used only when the student deliberately clicks the share button
- Students can see simple permission and capture feedback
- Students can see their latest saved location and a short recent history
- Admins can view the latest known locations and recent location history in a simple readable list view

This is not live tracking and it does not run in the background.

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
  active: true
}
```

This structure keeps the MVP easy to understand and easy to query.

## How Permission Handling Works
The student portal checks browser location support and, when possible, checks browser permission state.

Current behavior:
- if supported, the UI shows whether permission is granted, denied, or still waiting for the browser prompt
- when the student clicks `Share current location`, the browser Geolocation API requests access if needed
- if permission is denied or location is unavailable, a clear message is shown

## How Current-Location Sharing Works
Location sharing is manual only:
1. The student signs in
2. The student opens the location sharing section
3. The student clicks `Share current location`
4. The browser returns the current coordinates if available
5. The app saves one new location record in Firestore

There is no automatic repeated tracking in this MVP.

## Limitations Of Web-Based Tracking
- Browser location depends on device support and browser permission settings
- Accuracy varies by device and network conditions
- Browsers may be less reliable than dedicated mobile apps for location use cases
- The current MVP saves one record at a time only when the student clicks the button
- There is no real-time location stream
- There is no map view in this MVP

## Privacy Considerations
- Students are not tracked automatically
- Location is shared only after a deliberate user action
- The implementation is browser-based and session-based, not background-based
- Admin views are protected behind admin authentication and role checks
- Firestore security rules for location data should be strengthened later

## What Would Be Needed Later
For stronger tracking:
- recurring or live location updates
- background tracking support
- mobile app support
- smartwatch support

For richer location features:
- maps and pins
- geofencing
- delivered and processed tracking events
- stronger audit logging
- Firestore security rules specific to location data
