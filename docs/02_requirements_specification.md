# Software Requirements Specification

## 1. Introduction
This document defines the initial software requirements for INNOTECH PROJECT. The system is planned as a school web application that begins with notification features and later expands into student and device tracking capabilities. The goal of this specification is to align future development around a simple, clear, and scalable foundation.

## 2. System Objectives
- Provide secure login and logout for authorized users
- Support role-based access for administrators and students in phase 1
- Deliver and receive school notifications efficiently
- Provide dashboard views appropriate to administrators and students
- Maintain notification history and activity records for visibility and accountability
- Keep tracking capabilities outside the phase 1 MVP while preparing the architecture for future adoption
- Preserve a backend and architecture that can later support mobile and smartwatch clients

## 3. User Roles

### 3.1 Administrator
- Manage users and student records
- Send notifications to individuals or groups
- View dashboards, notification history, and audit records
- Monitor system activity and audit trails

### 3.2 Student
- Log in securely
- Receive notifications
- View personal dashboard information
- In future phases, grant location permissions where applicable

### 3.3 Staff User
- Staff user support is optional and not part of phase 1 MVP.
- Staff access may be introduced in a later phase if school policy and use cases require it.

## 4. Functional Requirements

### 4.1 Authentication
- The system shall allow users to log in with authorized credentials.
- The system shall allow users to log out securely.
- The system shall maintain authenticated sessions according to approved security rules.

### 4.2 Role-Based Access
- The system shall restrict features and data based on user role.
- The phase 1 MVP shall support administrator and student roles.
- The system shall ensure administrators can access management and oversight features.
- The system shall ensure students can access only their own relevant views, notifications, and records.
- Staff-specific permissions, if introduced later, shall be handled as a future extension.

### 4.3 Admin Dashboard
- The system shall provide an administrator dashboard.
- The administrator dashboard shall display high-level operational information such as notifications, students, and recent activity.
- The administrator dashboard shall provide access to notification creation, notification history, and audit review.

### 4.4 Student Dashboard
- The system shall provide a student dashboard.
- The student dashboard shall display recent notifications, read and unread status, and personal account information appropriate to the student role.

### 4.5 Notification Sending
- Authorized administrators shall be able to create and send notifications.
- Each notification shall include a message title.
- Each notification shall include a message body.
- Each notification shall include a target audience.
- Each notification shall record the user who created it.
- Each notification shall record the date and time it was created.
- Notifications shall support targeting an individual student, a defined student group, or all students.

### 4.6 Notification Receiving
- Students shall be able to receive notifications in the web application.
- Each delivered notification shall support read and unread status per recipient.
- The system shall show received notifications in a student-friendly view on phones and laptops.
- The system design shall allow future notification delivery through mobile apps and smartwatches.

### 4.7 Notification History
- The system shall maintain a history of sent notifications.
- The system shall maintain recipient-level delivery and read status for notifications.
- Authorized administrators shall be able to review notification history by date, creator, and target audience.
- Students shall be able to review their own received notification history.

### 4.8 Delivery and Log Status
- The system shall record delivery or processing status for each notification recipient.
- Delivery or processing status shall indicate whether a notification is pending, delivered, failed, or otherwise not completed.
- The system shall record the latest status update time for each recipient delivery record.

### 4.9 Logs and Audit Trail
- The system shall record important user and system actions in logs.
- The system shall maintain an audit trail for login attempts, login success, logout, notification creation, notification updates, notification sending, and notification read events where appropriate.
- Audit records shall include the acting user, action type, timestamp, and relevant target record reference.
- Audit logs shall be viewable only by authorized administrative users.

### 4.10 Location Permission Handling
- Location permission handling is not part of phase 1 MVP.
- In a future tracking phase, the system shall request and manage location permission status from supported clients.
- The system shall record whether location access was granted, denied, or unavailable where applicable.

### 4.11 Current Location Capture
- Current location capture is not part of phase 1 MVP.
- In a future tracking phase, the system shall be able to capture current location data from authorized and supported devices.

### 4.12 Latest Known Location
- Latest known location is not part of phase 1 MVP.
- In a future tracking phase, the system shall store and display the latest known location for authorized tracking targets.

### 4.13 Tracking History
- Tracking history is not part of phase 1 MVP.
- In a future tracking phase, the system shall maintain a history of tracking data according to policy and privacy rules.

## 5. Non-Functional Requirements

### 5.1 Usability
- The interface shall be simple and clear for both technical and non-technical users.
- Navigation shall remain consistent across major sections of the application.

### 5.2 Responsiveness
- The application shall work well on phones and laptops.
- Layouts and interactions shall adapt to common screen sizes without losing important functionality.

### 5.3 Security
- Authentication and authorization shall be enforced for all protected features.
- Sensitive user, student, and future tracking data shall be protected in transit and at rest where applicable.
- Audit logs shall support accountability and incident review.

### 5.4 Performance
- Core user actions such as login, dashboard loading, and notification viewing shall respond within acceptable time under expected school usage.
- The platform shall remain stable during moderate spikes in notification activity.

### 5.5 Maintainability
- The codebase shall be modular, readable, and organized for future expansion.
- Documentation shall be kept clear enough to support onboarding and long-term maintenance.

### 5.6 Scalability
- The architecture shall support growth in users, notifications, and future tracking workloads.
- Backend services shall be designed with future mobile and wearable clients in mind.

### 5.7 Privacy
- The system shall minimize unnecessary collection of personal or location data.
- Tracking-related features shall be implemented only with clear authorization, visibility, and policy controls.

## 6. Use Cases

### 6.1 User Login
An administrator or student enters valid credentials and gains access to the appropriate dashboard.

### 6.2 User Logout
A logged-in user ends the session securely from the application interface.

### 6.3 Send Notification
An authorized administrator creates a notification with title, body, and target audience, then sends it to a selected student, group, or all students.

### 6.4 Receive Notification
A student logs in and views new or previous notifications on the dashboard, including read and unread status.

### 6.5 Review Notification History
An administrator reviews records of previously sent notifications and recipient delivery status, while a student reviews personal received notification history.

### 6.6 Manage Access by Role
The system determines which screens, actions, and data a user can access based on administrator or student role.

### 6.7 View Logs and Audit Trail
An administrator reviews system activity such as login attempts, login success, notification creation, notification sending, and notification read events.

### 6.8 Grant or Deny Location Permission
In a future phase, a student or device user responds to a location permission request on a supported client.

### 6.9 View Latest Known Location
In a future phase, an authorized administrator views the most recent available location for a tracked student or device.

### 6.10 Review Tracking History
In a future phase, an authorized administrator reviews stored tracking history according to policy and access rules.

## 7. Constraints and Risks
- The project should avoid unnecessary packages and complexity during the early stages.
- The phase 1 MVP should remain focused on administrators and students only.
- Adding staff workflows too early may expand scope before the core notification workflow is stable.
- Tracking features introduce privacy, legal, and policy considerations that must be handled carefully.
- Mobile and smartwatch support will depend on future client applications and notification integrations.
- Requirements may evolve as school operational needs become clearer.
- Poor early architectural decisions could make later tracking and multi-platform support harder to implement.

## 8. Assumptions
- The system will begin as a web-first application.
- Administrators and students will be the only required phase 1 roles.
- Staff-specific workflows are deferred unless later requirements make them necessary.
- Notifications are the first delivery priority and provide the highest immediate value.
- Future tracking features will require explicit permissions and policy approval.
- The backend should eventually serve web, mobile, and smartwatch clients from a shared core architecture.

## 9. Future Requirements
- Staff user workflows and permissions if required by the school
- Push notification support for mobile applications
- Smartwatch-friendly notification delivery
- Live or near-real-time tracking capabilities
- Device registration and device status management
- Advanced reporting and analytics
- More granular role and permission management
- Integration with external school systems where appropriate
