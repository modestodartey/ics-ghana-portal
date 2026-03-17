# INNOTECH PROJECT

## Project Description
INNOTECH PROJECT is a school-focused web application planned to support student notifications first and student/device tracking in later phases. The platform is intended to work well on both phones and laptops from the beginning, while keeping the architecture ready for future mobile app and smartwatch notification support.

## Project Objective
The objective of this project is to provide a clear, scalable foundation for a school communication and tracking system that improves how administrators and students receive important updates and, in later phases, supports responsible location-aware tracking capabilities.

## Main Modules
- Authentication
- Student Management
- Notifications
- Tracking
- Dashboard

## Target Platforms
- Web first
- Future mobile applications
- Future smartwatch notifications

## Development Approach
- Notifications first
- Tracking second

## Chosen Stack
- Next.js with TypeScript
- Tailwind CSS
- App Router
- Firebase Authentication
- Cloud Firestore

## Setup Overview
- The repository now includes a minimal Next.js application scaffold for the phase 1 MVP foundation.
- Tailwind CSS is configured for responsive styling.
- Firebase setup files are prepared with environment variable placeholders only.
- The initial route structure includes a functional login page plus protected admin and student dashboard routes.

## Current Planning Deliverables
- `README.md` - project summary, goals, modules, and planning-stage status
- `docs/01_project_overview.md` - project background, purpose, users, scope, and future direction
- `docs/02_requirements_specification.md` - software requirements, MVP role focus, notification requirements, non-functional requirements, and future tracking scope
- `docs/03_mvp_scope.md` - phase 1, phase 2, and future expansion boundaries
- `docs/04_system_design.md` - recommended architecture, module responsibilities, and future-ready system direction
- `docs/05_data_model.md` - early entity definitions and relationships for the planned system
- `docs/06_pages_and_user_flows.md` - planned pages, primary user journeys, and responsive UX direction
- `docs/07_technical_decisions.md` - selected implementation stack, rationale, alternatives, and deployment direction
- `docs/08_authentication_setup.md` - current Firebase Authentication and Firestore role setup for the MVP
- `docs/09_notifications_mvp.md` - Firestore-backed in-app notification flow for admins and students
- `docs/10_tracking_mvp.md` - basic web-based location sharing and admin tracking view for the MVP
- `docs/11_find_my_device_lite.md` - student device registration, missing/found flow, and last known location lookup for the MVP
- `docs/12_accounts_management.md` - secure admin-only account creation, account listing, and active-status management
- `docs/13_email_notifications_setup.md` - SMTP-based email delivery setup for portal notifications
- `AGENTS.md` - repository instructions for future planning and coding work

## Initial Project Structure
- `docs/` - planning and requirements documentation
- `app/` - Next.js App Router pages and layouts
- `components/` - reusable layout and UI building blocks
- `lib/` - Firebase setup and auth-related helpers
- `services/` - future business logic and integrations
- `types/` - shared TypeScript types
- `utils/` - shared helper utilities
- `public/` - static assets
- `src/` - reserved for future use if the structure changes later

## Current Status
This repository now includes the technical foundation for the web MVP, working authentication, Firestore-backed in-app notifications, automatic browser-session location tracking, a simple Find My Device experience for students, staff role support, and admin-only accounts management. Background tracking beyond the active browser session, live device finding, embedded maps, push notifications, and deeper operational features still remain to be built.

## Admin Portal Structure
The admin experience now uses a compact dashboard plus dedicated workflow pages:
- `/admin` keeps a short summary dashboard with quick stats and preview sections
- `/admin/notifications` holds the full notifications workflow and history
- `/admin/tracking` holds the full tracking history view
- `/admin/accounts` holds account creation and account management
- `/admin/devices` holds the device overview for registered and missing devices
- `/admin/audit` holds the audit log foundation for important admin actions

This keeps the dashboard practical even when record counts grow.

## What Has Been Scaffolded
- Core Next.js, TypeScript, and Tailwind project configuration
- App Router layout and route placeholders
- Responsive shared navigation and page shell components
- Firebase initialization file with environment variable placeholders
- Firebase Authentication sign-in with Firestore role lookup
- Protected admin and student routes with logout support
- Shared auth context, role helpers, and beginner-friendly setup documentation
- In-app notifications backed by Firestore for admin creation and student viewing
- Staff-aware notifications with creator-managed edit/delete controls and email delivery support
- Automatic browser-session location tracking for students and readable admin live/latest tracking views
- Find My Device for student-owned device registration and last known location lookup
- Secure admin-only account creation and account status management using the Firebase Admin SDK
- Bulk CSV account import with preview, validation, and result summaries
- A lightweight audit log foundation for account and notification actions

## Authentication Setup

### Install Dependencies
```bash
npm install
```

### Set Up `.env.local`
Create a `.env.local` file in the project root and add:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="ICS Ghana Portal <no-reply@example.com>"
```

### Enable Firebase Auth And Firestore
1. In Firebase Authentication, enable `Email/Password`.
2. In Firestore, create the `users` collection.
3. Use each Firebase Auth user `uid` as the matching Firestore document ID.

### Firestore User Document Shape
Each `users` document should include:

```ts
{
  uid: "firebase-auth-uid",
  email: "modest.dartey@icsghana.info",
  role: "student", // or "admin"
  displayName: "Modest Dartey",
  createdAt: "server timestamp",
  isActive: true
}
```

### Firestore Notification Document Shape
Each `notifications` document currently includes:

```ts
{
  title: "Morning assembly reminder",
  body: "Please report to the main hall by 8:15 AM.",
  audienceType: "all_students", // or all_users, all_admins, all_staff, specific_emails
  targetEmails: [],
  createdByUid: "firebase-auth-uid",
  createdByEmail: "admin.user@icsghana.info",
  createdAt: "server timestamp",
  updatedAt: "server timestamp",
  active: true,
  readBy: [],
  readDetails: [],
  emailSentCount: 0,
  emailFailedCount: 0,
  emailAttemptedAt: "server timestamp or null"
}
```

### Firestore Tracking Document Shape
Each `locationRecords` document currently includes:

```ts
{
  userUid: "firebase-auth-uid",
  userEmail: "student.name@icsghana.info",
  displayName: "Student Name",
  latitude: 5.60372,
  longitude: -0.187,
  accuracy: 25,
  createdAt: "server timestamp",
  source: "web",
  active: true,
  sessionId: "browser-session-id-or-null",
  trackingMode: "automatic" // or manual for older records
}
```

### Firestore Device Document Shape
Each `devices` document currently includes:

```ts
{
  ownerUid: "firebase-auth-uid",
  ownerEmail: "student.name@icsghana.info",
  displayName: "Student Name",
  deviceName: "Student iPad",
  deviceType: "Tablet",
  status: "active", // or missing, found
  lastSeenAt: "timestamp or null",
  lastKnownLatitude: 5.60372,
  lastKnownLongitude: -0.187,
  lastKnownAccuracy: 25,
  lastKnownSource: "web",
  createdAt: "server timestamp",
  updatedAt: "server timestamp"
}
```

### Create Test Users
1. Create the first active admin account in Firebase Authentication and Firestore manually so someone can sign in to the portal for the first time.
2. After that first admin signs in, use the admin accounts page to create additional student or admin accounts from inside the portal.
3. If you prefer to seed users manually, create matching `users/{uid}` records in Firestore and include `isActive: true`.

### Allowed Login Email Domains
The current login form allows only email addresses ending in:
- `@icsghana.info`
- `@gmail.com`

Examples:
- `modest.dartey@icsghana.info`
- `student.name@icsghana.info`
- `ics.portal.testing@gmail.com`

### Run The Project Locally
```bash
npm run dev
```

Then open:
- `http://localhost:3000/login`

## Accounts Management

### What Roles Are Supported
- `admin`
- `student`
- `staff`

### How To Create Accounts From The Portal
1. Sign in with an active admin account.
2. Open the admin dashboard.
3. Open `/admin/accounts`.
4. Enter the full name, email, role (`student`, `staff`, or `admin`), and temporary password.
5. Submit the form to create the Firebase Authentication user and the matching Firestore `users` record.

### Bulk CSV Upload
The accounts page also supports a bulk CSV import flow.

Supported columns:
- `fullName`
- `email`
- `role`
- `temporaryPassword`

Current flow:
1. open `/admin/accounts`
2. choose a CSV file or paste CSV content into the bulk upload form
3. review the preview and any row issues
4. click `Import valid rows`
5. review the created, skipped, and failed summary after the import finishes

### How Account Records Are Stored
- Firebase Authentication stores the sign-in credentials and disabled status.
- Firestore `users/{uid}` stores:
  - `uid`
  - `email`
  - `displayName`
  - `role`
  - `createdAt`
  - `isActive`

### Current Limitations
- the first admin account must be created outside the portal
- account editing beyond active status is not included yet
- password reset and invitation flows are not included yet
- account deletion is not included yet
- duplicate rows in bulk imports are skipped rather than merged

### How To Test Accounts Management Locally
1. Add the Firebase Admin SDK environment variables to `.env.local`.
2. Make sure one active admin account exists in Firebase Authentication and in Firestore `users`.
3. Run `npm run dev`.
4. Sign in as that admin user.
5. Open `/admin/accounts`.
6. Create a student or admin account with a temporary password.
7. Confirm the new account appears in the list with the correct role and active status.
8. Use the search field and role filter to find the account.
9. Disable the account and confirm it changes to `Disabled`.
10. Reactivate the account and confirm the status returns to `Active`.

## Notifications MVP

### What Firestore Data Is Used
- `users` collection for login roles
- `notifications` collection for in-app notifications

### What Roles Can Create Or View Notifications
- `admin` users can create notifications, inspect read details, edit eligible notifications they created, and delete notifications they created
- `student` users can view notifications meant for them and mark them as read
- `staff` users can view notifications meant for them and mark them as read

### What Alerting Works Now
- logged-in users receive in-app toast alerts when a new relevant notification arrives while the portal is open
- the `Notifications` quick link can show an unread badge for signed-in users
- admins receive a clear success alert after sending a notification
- users can enable browser desktop alerts from the notification area
- desktop notifications can appear when permission is granted and the web app is open in the browser

### Notification Read Details And Management
- each notification now shows how many users have viewed it
- the `Details` action reveals the names and exact read times for recorded viewers
- the notification creator can edit a notification before it has been viewed by anyone
- the notification creator can delete a notification after a confirmation prompt
- notification sending can also trigger server-side email delivery when SMTP is configured
- the admin dashboard shows only a short notification preview, while the full list lives on `/admin/notifications`
- the full notifications page now supports search plus audience, status, and date filters

### Email Delivery Setup
- notification emails now use server-side SMTP delivery with `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`
- if SMTP is missing or rejected by the server, the notification is still saved in-app and the admin sees a clear delivery message
- see `docs/13_email_notifications_setup.md` for the full setup and testing flow

### Current Browser Alert Limitations
- desktop notifications depend on browser support and user permission
- some browsers block or limit notification sounds, so sound is not relied on
- full Firebase Cloud Messaging background web push is not completed in this MVP step

### How To Test Notifications Locally
1. Sign in as an admin user.
2. Open the admin portal.
3. In the notification area, click `Enable desktop alerts` if you want to test browser notification permission.
4. Create a notification using one of the supported audience types:
   - all users
   - all students
   - all admins
   - all staff
   - specific email(s)
5. Confirm the admin sees a clear delivery result after sending:
   - success if email sends correctly
   - a clear portal message if SMTP is missing or fails
6. Open `Details` on the notification and confirm the initial viewed count is zero.
7. Sign out and sign in as a student or staff user in another browser window or tab.
8. Open the matching portal and confirm the notification appears in reverse chronological order.
9. Click `Mark as read`.
10. Return to the admin portal and confirm the notification history now shows an increased viewed count and a read-details entry with the viewer name and time.
11. If nobody has viewed a notification yet, click `Edit`, save changes, and confirm the update succeeds.
12. Delete a notification you created and confirm the portal asks for confirmation before removing it.
13. To test locally, use a real SMTP account in `.env.local` and send to a real inbox.
14. To test on Vercel, add the same `SMTP_*` variables in the Vercel project settings, redeploy, and send a notification from the deployed admin portal.

## Tracking MVP

### What Firestore Data Is Used For Tracking
- `locationRecords` collection for saved browser-based location records

### What Roles Can Share Or View Tracking Data
- `student` users can grant browser permission and then have their location tracked automatically while the portal session stays active
- `admin` users can view the latest known locations, recent history, and live-looking session updates in the admin portal

### Current Browser-Based Tracking Limitations
- browser permission is still required before any tracking begins
- tracking runs only while the student stays logged in and the browser session remains active
- no background tracking or geofencing is implemented
- no map view is included in this MVP

### Accuracy And Maps
- the portal requests high-accuracy browser geolocation with `enableHighAccuracy: true`, `maximumAge: 0`, and a bounded timeout
- the initial capture can compare a few readings and keep the best available one before saving
- saved records keep the returned accuracy value even when the location is approximate
- the UI now shows accuracy in a concise format such as `Approx. ±18 m`
- Google Maps links now open in satellite view in a new tab
- the admin dashboard shows only a short latest-location preview, while the full history lives on `/admin/tracking`
- the full tracking page now supports search by student name or email plus pagination for longer histories

### How To Test Location Sharing Locally
1. Sign in as a student user.
2. Open the student portal.
3. Confirm the location access card is one of the first important sections shown on the page.
4. Click `Allow location access`.
5. Allow browser permission if prompted.
6. Confirm the portal saves an initial location and shows that live session tracking is active.
7. Confirm the saved location shows an accuracy label such as `Approx. ±18 m`.
8. If your device can improve the reading, wait briefly and confirm newer saved records can show better accuracy.
9. Keep the student portal open and, if possible, move slightly or wait for additional browser location updates.
10. Sign out and sign in as an admin user in another window or browser profile.
11. Open the admin portal.
12. Confirm the matching student appears in `Latest known locations` with a `Live now` badge while recent automatic updates are arriving.
13. Confirm the admin view also shows the saved accuracy value honestly, even when it is approximate.
14. Use the search box and `Search` button to filter by the student&apos;s email.
15. Use `Open in Google Maps` on any visible location result to confirm it opens a new tab in satellite view.
16. Close the student session or log out and confirm the admin still sees the latest saved location even after the live badge naturally drops away.

## Find My Device MVP

### What Firestore Data Is Used
- `devices` collection for registered student devices
- `locationRecords` collection for the latest available portal location snapshot reused by Find My Device

### What Students Can Do
- register one or more devices
- mark a device as missing
- mark a missing device as found and return it to active status
- review the latest saved location linked to a device
- see whether a device appears live right now or is showing only its last known location
- open the latest saved location in Google Maps

### Admin Device Overview
- the admin dashboard now shows only a short devices preview
- `/admin/devices` holds the full read-only devices overview
- the page supports search, status filtering, and pagination
- missing-device counts are included in the admin summary

### Current MVP Limitations
- the saved location is based on the student&apos;s latest available portal location, not on a device-specific live signal
- there is no live device ping
- there is no background tracking
- there is no embedded map view in the portal

### How To Test Find My Device Locally
1. Sign in as a student user.
2. Open the student portal.
3. Allow location access in the student portal if you want the freshest available location linked during device registration.
4. In the `Find My Device` section, add a device with a name and type.
5. Confirm the success message tells you whether the device was linked to your current location, your latest saved location, or no location yet.
6. Confirm the new device appears in your list with status, last seen time, and location state.
7. Click `Mark as missing` and confirm the status changes to `Missing`.
8. Keep the student portal open with location access enabled and confirm the missing device begins showing fresh `Live now` updates while the session stays active.
9. Click `Mark as found`, then `Set active`, and confirm the status updates continue to work.
10. If location data is available, click `Open in Google Maps` to review the saved location in a new tab.
11. If no location is available yet, confirm the device card clearly shows `No location saved yet`.

### Missing-Device Tracking Limits
- `Live now` means the device card is showing a very recent location from the student&apos;s active browser session
- `Last known` means the device is showing the latest saved snapshot, but no very recent session update has arrived
- updates stop when the student logs out, closes the active session, or browser location access is no longer available
- this does not provide background device tracking beyond the active browser session

## Audit Log Foundation

### What Is Tracked
- account created
- account status updated
- accounts bulk created
- notification created
- notification updated
- notification deleted

### Where To Review It
- use `/admin/audit` to review the current audit log list
- the admin dashboard now links to the full audit page

### Current Audit Limitations
- the audit page is a lightweight list, not a reporting dashboard yet
- the current foundation focuses on accounts and notifications only

## How To Test The New Admin Structure Locally
1. Sign in as an admin user.
2. Open `/admin` and confirm the dashboard stays short with preview sections only.
3. Open `/admin/notifications`, `/admin/tracking`, `/admin/accounts`, `/admin/devices`, and `/admin/audit`.
4. Confirm the dedicated pages hold the full lists, filters, and paging controls.
5. On `/admin/accounts`, test both single-account creation and the CSV bulk import preview flow.

## What Comes Next
- Add Firestore security rules for notifications, tracking, and device data
- Decide whether the next priority is stronger audit/security work or richer admin views for notifications and tracking
- Prepare later live-tracking and device-finding improvements without adding background tracking yet
