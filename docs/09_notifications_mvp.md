# Notifications MVP

## What Was Built
The project now includes the first Firestore-backed in-app notification flow for the MVP.

Current scope:
- Admins can create notifications inside the admin portal
- Admins can view a notification history list
- Students can view notifications meant for them
- Students can mark notifications as read
- Logged-in users now receive visible in-app toast alerts when a new relevant notification arrives while the portal is open
- The portal now includes a browser notification permission flow and basic desktop alert groundwork for the web app

This is still web-first. Full background web push and mobile native push are not completed in this step.

## Firestore Notification Structure
Collection:
- `notifications`

Each notification document currently uses this simple shape:

```ts
{
  title: string,
  body: string,
  audienceType: "all_users" | "all_students" | "all_admins" | "specific_emails",
  targetEmails: string[],
  createdByUid: string,
  createdByEmail: string,
  createdAt: server timestamp,
  active: boolean,
  readBy: string[]
}
```

Notes:
- `targetEmails` is used only when `audienceType` is `specific_emails`
- `readBy` stores Firebase Auth user `uid` values for users who have marked the notification as read

## How Targeting Works
The current MVP supports four audience types:
- `all_users`
- `all_students`
- `all_admins`
- `specific_emails`

How delivery is handled in the MVP:
- Notifications are stored once in Firestore
- The student portal reads the notification list and filters what the signed-in student can see
- Role-based audiences use the signed-in user role
- Specific email audiences compare against the signed-in user email

This approach keeps the MVP simple and easy to understand, but it is not a full delivery tracking system.

## How Read and Unread Works
Read state is handled with the `readBy` array:
- When a student views the notification list, the UI checks whether the student `uid` is in `readBy`
- If the `uid` is missing, the notification is shown as unread
- When the student clicks `Mark as read`, their `uid` is added to `readBy`

This is a simple MVP approach that works well enough for in-app notifications.

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
- There is no delete, archive, or edit flow yet
- Admin history is a simple list, not a detailed reporting view
- The current implementation does not calculate an exact recipient count for broad audiences
- Firestore security rules for notifications are not managed in this repository yet
- Desktop notifications depend on browser support and user permission
- Browser sound is not relied on because autoplay and notification-sound behavior vary by browser
- Full Firebase Cloud Messaging token registration and background push delivery are not implemented yet

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
