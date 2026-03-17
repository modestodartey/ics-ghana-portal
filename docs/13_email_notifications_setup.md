# Email Notification Setup

## What This Covers
The portal can now send email notifications when an admin creates an in-app notification.

This email delivery is:
- server-side only
- tied to the admin notification create route
- optional, based on SMTP configuration

## Required Environment Variables
Add these values on the server:

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="ICS Ghana Portal <no-reply@example.com>"
```

Notes:
- `SMTP_SECURE=true` is usually used with port `465`
- `SMTP_SECURE=false` is usually used with port `587`
- the portal still accepts the older `EMAIL_SMTP_*` values as a fallback, but `SMTP_*` is now the primary supported setup

## How It Works
Current flow:
1. an active admin sends a notification from the portal
2. the server verifies the admin token
3. the notification is saved in Firestore
4. the server resolves the recipient email list from the selected audience
5. the server verifies the SMTP transport before delivery
6. the server sends simple email messages through SMTP
7. the notification record stores basic email result counts

## Email Content
Each email currently includes:
- the notification title as the email subject
- the notification body
- the audience label
- the sender email
- a short note directing the user back to the portal

## Supported Audiences
Email delivery follows the same audience logic as in-app notifications:
- all users
- all students
- all admins
- all staff
- specific email addresses

Only active user records are included for role-based audiences.

## Failure Handling
If SMTP is not configured:
- the in-app notification is still saved
- the admin now sees a clear portal message explaining that email delivery is not configured
- the server stores failed email counts for the attempted recipients

If some recipient emails fail:
- the in-app notification still succeeds
- the server logs the delivery failure
- the notification record stores sent and failed counts
- the admin receives a clear delivery warning in the portal

If the SMTP server rejects the connection or login:
- the notification is still saved in-app
- the server logs the real error for debugging
- the admin sees the delivery failure message instead of a silent warning

## Current Limitations
- email delivery uses simple SMTP credentials, not a provider-specific template system
- retry queues are not included yet
- delivery receipts and bounce handling are not included yet
- editing a notification does not resend email
- deleting a notification does not recall previously sent email

## How To Test
Locally:
1. set the `SMTP_*` variables in `.env.local`
2. run `npm run dev`
3. sign in as an admin
4. send a notification to a real reachable recipient email
5. confirm the admin sees an explicit delivery result in the portal
6. confirm the email arrives in the inbox or spam folder

On Vercel:
1. add the same `SMTP_*` variables in the project environment settings
2. redeploy the site
3. send a test notification from the deployed admin portal
4. confirm delivery and check Vercel function logs if the server reports an SMTP issue
