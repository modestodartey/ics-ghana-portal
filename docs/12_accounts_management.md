# Accounts Management

## What Was Built
The portal now includes an admin-only accounts management feature.

Current scope:
- admins can open a dedicated accounts page
- admins can create a new student, staff, or admin account from inside the portal
- account creation writes to Firebase Authentication and the Firestore `users` collection
- admins can view existing user records
- admins can search by name, email, or role
- admins can filter by role and active status
- admins can import multiple accounts through a CSV upload flow
- admins can disable or reactivate accounts
- the portal now records audit events for account creation, status updates, and bulk imports

## How Admin Account Creation Works
Account creation is handled through a secure server-side API route.

Current flow:
1. an authenticated admin opens the accounts page
2. the admin enters the full name, email, role, and temporary password
3. the browser sends the request with the signed-in admin&apos;s Firebase ID token
4. the server verifies that the caller is an active admin
5. the server creates the Firebase Authentication user with the Firebase Admin SDK
6. the server writes the matching Firestore `users/{uid}` document

If the Firestore write fails after the Firebase Authentication user is created, the server removes that new auth user so the two systems stay in sync.

## Firebase Auth and Firestore Relationship
The portal uses two connected records:
- Firebase Authentication stores the sign-in credentials
- Firestore `users` stores the role and app-specific account details

The current portal relies on the Firestore `users` document for role-based routing and protected page access.

## Stored Fields
Each managed account currently stores at least:
- `uid`
- `email`
- `displayName`
- `role` (`student`, `staff`, or `admin`)
- `createdAt`
- `isActive`

## Bulk CSV Upload
The accounts page now includes a bulk CSV upload foundation.

Supported columns:
- `fullName`
- `email`
- `role`
- `temporaryPassword`

Current flow:
1. an admin uploads a CSV file or pastes CSV content into the form
2. the portal parses the rows and shows a preview before submission
3. invalid rows are flagged in the preview
4. valid rows are sent to a secure admin-only bulk API route
5. the server creates Firebase Authentication users and matching Firestore user records
6. the portal returns a created, skipped, and failed summary

## Audit Logging
The accounts workflow now writes lightweight audit records for:
- single account creation
- account status changes
- bulk account imports

## Current Limitations
- the first active administrator account still needs to be created outside the portal so an admin can sign in initially
- account editing beyond active status is not included yet
- password reset flows are not included yet
- email verification is not included yet
- user deletion is not included yet
- Firebase Admin SDK environment variables must be configured on the server
- CSV imports do not edit existing accounts; duplicate rows are skipped
- bulk imports return summary feedback, not downloadable reports yet

## What Should Be Added Later
- edit existing name, email, and role fields
- password reset and invitation flows
- user deletion with audit confirmation
- richer account editing
- downloadable import reports
