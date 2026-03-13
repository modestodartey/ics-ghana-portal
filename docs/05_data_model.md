# Data Model

## Overview
This document defines the early core data entities for INNOTECH PROJECT. The model is designed to support a phase 1 notification-focused web application while remaining ready for future tracking, mobile, and smartwatch expansion.

## 1. User

### Purpose
Represents a system account that can log in and use the application.

### Main Fields
- `id`
- `email` or `username`
- `password_hash`
- `role`
- `status`
- `last_login_at`
- `created_at`
- `updated_at`

### Relationships
- One `User` may have one `StudentProfile` when the user is a student.
- One `User` may create many `Notification` records.
- One `User` may have many `AuditLog` records as the acting user.
- One `User` may have many future `DeviceRegistration` records.

## 2. StudentProfile

### Purpose
Stores student-specific information linked to a user account.

### Main Fields
- `id`
- `user_id`
- `student_number`
- `first_name`
- `last_name`
- `class_name` or `grade_level`
- `contact_status`
- `created_at`
- `updated_at`

### Relationships
- Each `StudentProfile` belongs to one `User`.
- One `StudentProfile` may receive many `NotificationRecipient` records.
- One `StudentProfile` may have many future `LocationRecord` entries.
- One `StudentProfile` may have many future `DeviceRegistration` records.

## 3. Notification

### Purpose
Stores the main notification message created by an administrator.

### Main Fields
- `id`
- `title`
- `body`
- `target_audience_type`
- `target_audience_reference`
- `created_by_user_id`
- `created_at`
- `updated_at`
- `status`

### Relationships
- Each `Notification` is created by one `User`.
- One `Notification` has many `NotificationRecipient` records.
- One `Notification` may have many related `AuditLog` records.

## 4. NotificationRecipient

### Purpose
Tracks notification delivery and read state for each student recipient.

### Main Fields
- `id`
- `notification_id`
- `student_profile_id`
- `delivery_status`
- `delivery_status_updated_at`
- `read_status`
- `read_at`
- `created_at`

### Relationships
- Each `NotificationRecipient` belongs to one `Notification`.
- Each `NotificationRecipient` belongs to one `StudentProfile`.
- Related events may be referenced in `AuditLog`.

## 5. AuditLog

### Purpose
Stores important system and user actions for accountability and review.

### Main Fields
- `id`
- `actor_user_id`
- `action_type`
- `target_entity_type`
- `target_entity_id`
- `description`
- `ip_address` if available
- `created_at`

### Relationships
- Each `AuditLog` may belong to one acting `User`.
- Each `AuditLog` may reference one target record such as a `Notification`, `NotificationRecipient`, `StudentProfile`, or future tracking entity.

## 6. DeviceRegistration

### Purpose
Future-ready entity for linking a student or user account to a device that may receive notifications or provide tracking data.

### Main Fields
- `id`
- `user_id`
- `student_profile_id`
- `device_type`
- `device_identifier`
- `notification_channel`
- `permission_status`
- `registered_at`
- `last_seen_at`
- `status`

### Relationships
- Each `DeviceRegistration` belongs to one `User` and may belong to one `StudentProfile`.
- One `DeviceRegistration` may have many future `LocationRecord` entries.
- Device events may appear in `AuditLog`.

## 7. LocationRecord

### Purpose
Future-ready entity for storing authorized location data for tracking workflows.

### Main Fields
- `id`
- `student_profile_id`
- `device_registration_id`
- `latitude`
- `longitude`
- `accuracy`
- `recorded_at`
- `source_type`
- `permission_status_snapshot`

### Relationships
- Each `LocationRecord` belongs to one `StudentProfile`.
- Each `LocationRecord` may belong to one `DeviceRegistration`.
- Tracking-related actions may be recorded in `AuditLog`.

## 8. Model Notes
- `User`, `StudentProfile`, `Notification`, `NotificationRecipient`, and `AuditLog` are core phase 1 entities.
- `DeviceRegistration` and `LocationRecord` are future-ready entities and should not drive phase 1 implementation scope.
- A practical recommendation is to keep notification recipients in a separate entity rather than storing read state directly on the notification record. This keeps the design ready for one-to-many delivery and multiple client types.
