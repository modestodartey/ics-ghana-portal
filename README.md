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
This repository now includes the technical foundation for the web MVP, working authentication, Firestore-backed in-app notifications, a basic web-based location sharing flow, and a simple Find My Device Lite experience for students. Background tracking, live device finding, embedded maps, push notifications, and deeper operational features still remain to be built.

## What Has Been Scaffolded
- Core Next.js, TypeScript, and Tailwind project configuration
- App Router layout and route placeholders
- Responsive shared navigation and page shell components
- Firebase initialization file with environment variable placeholders
- Firebase Authentication sign-in with Firestore role lookup
- Protected admin and student routes with logout support
- Shared auth context, role helpers, and beginner-friendly setup documentation
- In-app notifications backed by Firestore for admin creation and student viewing
- Basic web-based location sharing for students and readable admin tracking views
- Find My Device Lite for student-owned device registration and last known location lookup

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
  createdAt: "server timestamp"
}
```

### Firestore Notification Document Shape
Each `notifications` document currently includes:

```ts
{
  title: "Morning assembly reminder",
  body: "Please report to the main hall by 8:15 AM.",
  audienceType: "all_students", // or all_users, all_admins, specific_emails
  targetEmails: [],
  createdByUid: "firebase-auth-uid",
  createdByEmail: "admin.user@icsghana.info",
  createdAt: "server timestamp",
  active: true,
  readBy: []
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
  active: true
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
1. In Firebase Authentication, create one admin user and one student user with approved `@icsghana.info` or `@gmail.com` email addresses.
2. Copy each Firebase Auth `uid`.
3. In Firestore, create a matching `users/{uid}` document for each account.
4. Set `role` to `admin` or `student`.

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

## Notifications MVP

### What Firestore Data Is Used
- `users` collection for login roles
- `notifications` collection for in-app notifications

### What Roles Can Create Or View Notifications
- `admin` users can create notifications and view the notification history list
- `student` users can view notifications meant for them and mark them as read

### What Alerting Works Now
- logged-in users receive in-app toast alerts when a new relevant notification arrives while the portal is open
- the `Notifications` quick link can show an unread badge for signed-in users
- admins receive a clear success alert after sending a notification
- users can enable browser desktop alerts from the notification area
- desktop notifications can appear when permission is granted and the web app is open in the browser

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
   - specific email(s)
5. Confirm the admin sees a success alert after sending.
6. Sign out and sign in as a student user in another browser window or tab.
7. Open the student portal and confirm the matching notifications appear in reverse chronological order.
8. While the student portal is open, send another matching notification from the admin account.
9. Confirm the student sees a visible in-app toast alert and an unread badge on the `Notifications` quick link.
10. If desktop notification permission is enabled and the student tab is in the background, confirm the browser can show a desktop notification.
11. Click `Mark as read` on a student notification and confirm the unread badge changes.
12. Return to the admin portal and confirm the notification history list shows the read count increasing.

## Tracking MVP

### What Firestore Data Is Used For Tracking
- `locationRecords` collection for saved browser-based location records

### What Roles Can Share Or View Tracking Data
- `student` users can manually share their current location and view their own latest saved record
- `admin` users can view the latest known locations and recent history in the admin portal

### Current Browser-Based Tracking Limitations
- location sharing is manual only
- no background tracking is implemented
- no live tracking or geofencing is implemented
- no map view is included in this MVP

### How To Test Location Sharing Locally
1. Sign in as a student user.
2. Open the student portal.
3. Find the `Location sharing` section.
4. Click `Share current location`.
5. Allow browser permission if prompted.
6. Confirm success feedback appears and the latest saved location updates.
7. Sign out and sign in as an admin user.
8. Open the admin portal.
9. In the `Latest known locations` section, enter an email and click `Search`.
10. Review the filtered latest known locations and recent location history sections.
11. Use `Open in Google Maps` on any visible location result to confirm it opens a new tab.
12. Use `Clear` to reset the search if needed.

## Find My Device Lite MVP

### What Firestore Data Is Used
- `devices` collection for registered student devices
- `locationRecords` collection for the latest manual location snapshot reused by Find My Device Lite

### What Students Can Do
- register one or more devices
- mark a device as missing
- mark a missing device as found and return it to active status
- review the latest saved location linked to a device
- open the latest saved location in Google Maps

### Current MVP Limitations
- the saved location is based on the student&apos;s latest manual location share
- there is no live device ping
- there is no background tracking
- there is no embedded map view in the portal

### How To Test Find My Device Lite Locally
1. Sign in as a student user.
2. Open the student portal.
3. Share your current location from the `Location sharing` section if you want a last known location saved for devices.
4. In the `Find My Device Lite` section, add a device with a name and type.
5. Confirm the success message appears and the new device shows up in your list.
6. Click `Mark as missing` and confirm the status changes.
7. Click `Mark as found`, then `Set active`, and confirm the status updates continue to work.
8. If location data is available, click `Open in Google Maps` to review the saved location in a new tab.
9. If no location is available yet, confirm the device card clearly shows `No location saved yet` instead of hiding the action area.

## What Comes Next
- Add Firestore security rules for notifications, tracking, and device data
- Decide whether the next priority is stronger audit/security work or richer admin views for notifications and tracking
- Prepare later live-tracking and device-finding improvements without adding background tracking yet
