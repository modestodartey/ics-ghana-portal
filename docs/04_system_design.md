# System Design

## 1. Development Direction
The recommended direction for INNOTECH PROJECT is a web-first responsive application. Phase 1 should prioritize a smooth browser experience for phones and laptops while keeping the backend and module boundaries ready for future mobile applications and smartwatch notification support.

## 2. Recommended Architecture Pattern
The recommended architecture for the early product is a modular monolith with a clear API layer. This is the most practical choice for phase 1 because it keeps development simple, reduces deployment overhead, and still allows the system to grow into separate services later if usage or complexity increases.

Recommendation:
- Use a single deployable backend for the MVP.
- Organize the codebase into clear modules such as auth, users, students, notifications, audit, and future tracking.
- Treat the frontend as a separate client layer that consumes stable backend APIs.
- Design APIs so future mobile and smartwatch clients can reuse the same backend capabilities.

## 3. Frontend Responsibilities
The frontend should be responsible for:
- Rendering responsive user interfaces for phones and laptops
- Handling login and logout flows
- Displaying role-based dashboards
- Allowing administrators to create and review notifications
- Allowing students to receive and read notifications
- Showing notification history views
- Handling client-side state for page interactions
- Preparing for future permission prompts and notification states on additional clients

## 4. Backend Responsibilities
The backend should be responsible for:
- Authentication and session management
- Authorization and role enforcement
- User and student profile management
- Notification creation, storage, delivery tracking, and retrieval
- Audit logging of important events
- API endpoints for web and future mobile clients
- Future device registration and location record handling

## 5. Notification Module Overview
The notification module is the first major business module and should be the center of phase 1.

The notification module should support:
- Creating notifications with title, body, target audience, created by, and created at
- Sending notifications to one student, a selected group, or all students
- Recording recipient-level delivery or processing status
- Recording recipient-level read and unread status
- Showing notification history for administrators
- Showing received notifications for students

Practical recommendation:
Start with in-app notifications through the web interface. Design the module so push delivery channels can be added later without changing the core notification data model.

## 6. Tracking Module Overview for Future Phase
Tracking should not be part of phase 1 MVP. It should remain a future module with planned interfaces and data structures only.

The future tracking module may support:
- Device registration
- Location permission status handling
- Current location capture
- Latest known location display
- Tracking history review
- Tracking-related audit events

Practical recommendation:
Keep tracking data and workflows separate from the core notification workflow so privacy-sensitive features can be introduced carefully and with stronger policy controls.

## 7. Auth and Role Model
Phase 1 should support two required roles:
- Administrator
- Student

Role behavior:
- Administrators can manage students, create notifications, review notification history, and view audit records.
- Students can log in, view their dashboard, receive notifications, and review their personal notification history.

Deferred role:
- Staff user support is optional and should remain outside the MVP unless a confirmed business need appears.

## 8. Service and Module Breakdown
Recommended core modules for the system:
- `auth` - login, logout, session handling, role checks
- `users` - user identity records and account management
- `students` - student-specific profile data
- `notifications` - notification creation, recipient assignment, delivery status, read status
- `dashboard` - role-based dashboard aggregation
- `audit` - audit logging and activity review
- `devices` - future device registration support
- `tracking` - future location permission and location record handling

## 9. Deployment-Ready Thinking
Even though the project is still in planning, the architecture should be ready for later expansion.

Recommended direction:
- Keep backend logic behind clear APIs so additional clients can connect later.
- Keep notification delivery logic separate from UI rendering logic.
- Design the data model so device registrations and location records can be added without restructuring existing user and notification data.
- Prefer modules and interfaces that can scale from one web app to web plus mobile plus smartwatch clients.
- Keep audit and privacy controls visible from the start because future tracking features will depend on them.

## 10. Simple Architecture Diagram
```text
[Phone Browser]      [Laptop Browser]
        \                  /
         \                /
          -> [Responsive Web Frontend]
                     |
                     v
               [API / Backend]
                     |
    -----------------------------------------
    |         |           |        |         |
  [Auth]   [Users]   [Students] [Notifications] [Audit]
                                      |
                                      v
                           [NotificationRecipient]

Future expansion:
[Mobile App] ----\
[Smartwatch] ----- > reuse the same backend APIs

Future backend modules:
[Devices] -> [Tracking] -> [LocationRecord]
```
