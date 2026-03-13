# Authentication Setup

## How Authentication Works
The current MVP authentication flow uses Firebase Authentication with Email/Password sign-in. After a user signs in successfully, the app reads the matching user document from the Firestore `users` collection to determine the user role.

Current MVP roles:
- `admin`
- `student`

Routing behavior:
- `admin` users are sent to `/admin`
- `student` users are sent to `/student`

If a Firebase Authentication user exists but the Firestore role document is missing or invalid, the login is rejected with a clear message and the session is signed out.

## Required Firebase Setup
The project currently expects:
- Firebase web app configuration in `.env.local`
- Firebase Authentication enabled with Email/Password
- Cloud Firestore enabled

Required environment variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Required Firestore User Document Shape
Collection:
- `users`

Recommended document ID:
- the Firebase Auth user `uid`

Each user document should include at minimum:
- `uid`
- `email`
- `role`
- `displayName`
- `createdAt`

Example:
```ts
{
  uid: "firebase-auth-uid",
  email: "modest.dartey@icsghana.info",
  role: "student",
  displayName: "Modest Dartey",
  createdAt: "server timestamp"
}
```

## How Role-Based Routing Works
The current implementation uses a simple client-side auth provider:
1. Firebase Auth confirms whether a user session exists.
2. If a session exists, the app loads that user’s Firestore `users` document.
3. The role from Firestore is stored in auth state.
4. Protected pages compare the signed-in role with the page requirement.

Current page protection:
- `/admin` requires `admin`
- `/student` requires `student`
- `/login` signs in and redirects based on role

If the user is signed in with the wrong role for a page, the app shows a polite access denied state and offers a route to the correct portal.

## How Allowed Email Handling Works
The login form currently allows email addresses ending in:
- `@icsghana.info`
- `@gmail.com`

Current behavior:
- the email is trimmed and lowercased
- the domain is checked before Firebase sign-in runs
- if another domain is entered, the app shows a polite error message

This rule is intentionally simple so it can be changed later if the project adds more approved domains.

## Current Limitations
- There is no registration flow yet.
- Page protection is client-side only and not full production-grade authorization.
- There is no admin user-management screen yet.
- Firestore security rules are not managed in this repository.
- The `users` document must already exist for a signed-in account to work correctly.

## What Still Needs Improvement Later
- Add a secure user creation or invitation flow
- Add stronger route protection patterns if needed
- Add Firestore security rules aligned with roles
- Add session persistence and UX refinements where helpful
- Add notification module access using the same auth and role foundation
