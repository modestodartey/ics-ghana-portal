# Pages and User Flows

## 1. Public Pages
- Login page
- Logout confirmation or session-ended page if needed
- Basic unauthorized or access denied page

## 2. Admin Pages
- Admin dashboard
- Student list page
- Student detail page
- Create notification page
- Notification history page
- Notification detail page
- Audit log page

## 3. Student Pages
- Student dashboard
- Notifications inbox page
- Notification detail page
- Account or profile page

## 4. Future Tracking Pages
- Tracking overview page
- Device registration page
- Location permission status page
- Latest known location page
- Tracking history page

These tracking pages are future-facing only and should not be part of phase 1 MVP.

## 5. Main User Flows

### 5.1 Admin Login
1. The administrator opens the login page.
2. The administrator enters valid credentials.
3. The system authenticates the user and confirms the administrator role.
4. The system redirects the administrator to the admin dashboard.

### 5.2 Student Login
1. The student opens the login page.
2. The student enters valid credentials.
3. The system authenticates the user and confirms the student role.
4. The system redirects the student to the student dashboard or notifications inbox.

### 5.3 Send Notification
1. The administrator opens the create notification page.
2. The administrator enters the message title and message body.
3. The administrator selects the target audience.
4. The system records who created the message and when it was created.
5. The system creates recipient records and stores initial delivery status.
6. The system confirms that the notification was created and sent.

### 5.4 Receive and View Notification
1. The student signs in to the web application.
2. The student sees new and previous notifications in the dashboard or inbox.
3. The student opens a notification detail view.
4. The system marks the notification as read when appropriate.
5. The student can return to the inbox and review other messages.

### 5.5 Review Notification History
1. The administrator opens the notification history page.
2. The system shows notifications with sender, target audience, created date, and delivery summary.
3. The administrator selects a notification to view recipient-level status.
4. The administrator reviews read and delivery information for each recipient.

### 5.6 Future Tracking Permission Flow
1. A future supported client requests location permission from the student.
2. The student grants or denies permission.
3. The client records the permission outcome.
4. The backend stores the permission state for later review and policy enforcement.

### 5.7 Future Location Review Flow
1. An authorized administrator opens a future tracking page.
2. The system shows the latest known location for an approved student or device.
3. The administrator opens the tracking history view if needed.
4. The system displays stored location records according to permissions and policy rules.

## 6. Responsive Design Notes
- Public, admin, and student pages should work well on both phones and laptops.
- Dashboard summaries should collapse cleanly into stacked layouts on smaller screens.
- Notification lists should remain readable and easy to tap on mobile devices.
- Key admin actions such as sending notifications should stay usable without requiring large screens.
