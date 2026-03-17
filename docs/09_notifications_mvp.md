# Notifications MVP

## What Was Built
The project now includes the first Firestore-backed in-app notification flow for the MVP.

Current scope:
- Admins can create notifications inside the admin portal
- Admins can view a notification history list on a dedicated notifications page
- Admins can view a total read count for each notification
- Admins can open notification details to see who viewed the notification and when
- Admins can edit notifications they created before anyone has viewed them
- Admins can delete notifications they created after a confirmation prompt
- Admins can search, filter, and page through larger notification history sets
- Students can view notifications meant for them
- Staff can view notifications meant for them
- Students and staff can mark notifications as read
- Logged-in users now receive visible in-app toast alerts when a new relevant notification arrives while the portal is open
- The portal now includes a browser notification permission flow and basic desktop alert groundwork for the web app
- Notification sending now also supports server-side email delivery when SMTP is configured

This is still web-first. Full background web push and mobile native push are not completed in this step.

## Firestore Notification Structure
Collection:
- `notifications`

Each notification document currently uses this simple shape:

```ts
{
  title: string,
  body: string,
  audienceType: "all_users" | "all_students" | "all_admins" | "all_staff" | "specific_emails",
  targetEmails: string[],
  createdByUid: string,
  createdByEmail: string,
  createdAt: server timestamp,
  updatedAt: server timestamp,
  active: boolean,
  readBy: string[],
  readDetails: [
    {
      uid: string,
      email: string,
      displayName: string,
      readAt: timestamp
    }
  ],
  emailSentCount: number,
  emailFailedCount: number,
  emailAttemptedAt: timestamp | null
}
```

Notes:
- `targetEmails` is used only when `audienceType` is `specific_emails`
- `readBy` stores Firebase Auth user `uid` values for quick read checks
- `readDetails` stores per-user read timestamps for admin reporting

## How Targeting Works
The current MVP supports four audience types:
- `all_users`
- `all_students`
- `all_admins`
- `all_staff`
- `specific_emails`

How delivery is handled in the MVP:
- Notifications are stored once in Firestore
- The student portal reads the notification list and filters what the signed-in student can see
- Role-based audiences use the signed-in user role
- Specific email audiences compare against the signed-in user email

This approach keeps the MVP simple and easy to understand, but it is not a full delivery tracking system.

## How Read and Unread Works
Read state is handled with `readBy` and `readDetails`:
- When a student or staff member views the notification list, the UI checks whether their `uid` is already present
- If the `uid` is missing, the notification is shown as unread
- When the user clicks `Mark as read`, the app stores:
  - their `uid` in `readBy`
  - their `uid`, email, display name, and exact `readAt` time in `readDetails`

This keeps the data model readable while giving admins better reporting.

## How Admin Notification Management Works
Admin history now supports:
- read counts
- details view
- edit
- delete
- search and filters

Current behavior:
- `Details` reveals who has viewed the notification and the exact time each person viewed it
- `Edit` is available only to the admin who created the notification
- editing is locked once anyone has viewed the notification, so read history remains clear and understandable
- `Delete` is available only to the admin who created the notification and always asks for confirmation
- `/admin` shows only a short notifications preview
- `/admin/notifications` holds the full searchable notifications workflow

## How Email Notification Delivery Works
Notification sending now runs through a secure admin API route.

Current behavior:
1. the admin submits a notification from the portal
2. the server verifies that the caller is an active admin
3. the notification is stored in Firestore
4. the server resolves the target recipient email list
5. the server sends notification emails through the configured SMTP service
6. the portal stores simple email delivery counts on the notification record

If SMTP is not configured, the SMTP login fails, or some emails fail, the in-app notification still succeeds and the admin receives a clear delivery result message instead of a silent failure.

## What Alerting Works Now
There are now two alert layers in the web app:

### In-app alerts
- admins get a success toast after sending a notification
- logged-in users get a toast when a new relevant notification appears while the portal is open
- the `Notifications` quick link now shows an unread count badge when unread notifications exist

### Browser and desktop alerts
- users can enable browser notification permission from the notification area
- if browser permission is granted and a new relevant notification arrives while the tab is in the background, the browser can show a desktop notification
- the project now includes a `firebase-messaging-sw.js` service worker placeholder and a small Firebase Messaging readiness helper for later expansion

This is groundwork, not a full background push implementation yet.

## Current Limitations
- Notifications are filtered client-side after being loaded from Firestore
- There is no advanced delivery status beyond read/unread
- Editing is intentionally locked after the first recorded view
- Only the admin who created a notification can edit or delete it from the current UI
- There is no archive flow yet
- Admin history is easier to manage, but it is still a card-based list rather than a full reporting dashboard
- The current implementation does not calculate an exact recipient count for broad audiences
- Firestore security rules for notifications are not managed in this repository yet
- Desktop notifications depend on browser support and user permission
- Browser sound is not relied on because autoplay and notification-sound behavior vary by browser
- Full Firebase Cloud Messaging token registration and background push delivery are not implemented yet
- Email delivery depends on valid `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` values on the server

## What Would Be Needed Later
For push notifications:
- Firebase Cloud Messaging token registration
- a web push certificate and token storage
- foreground and background message handlers connected to real delivery events
- channel-specific delivery tracking
- stronger service worker handling for production push flows

For advanced in-app delivery:
- recipient records per user
- delivered/read timestamps per recipient
- richer admin analytics
- pagination and stronger Firestore query optimization
- notification status controls such as archive, disable, and expiration
