import { ProtectedPage } from "@/components/auth/protected-page";
import { AdminNotificationComposer } from "@/components/notifications/admin-notification-composer";
import { AdminNotificationsList } from "@/components/notifications/admin-notifications-list";

export default function AdminNotificationsPage() {
  return (
    <ProtectedPage
      allowedRole="admin"
      eyebrow="ICS Ghana Notifications"
      title="Notifications management"
      description="Create notifications, review read details, and manage the full notification history from one place."
    >
      <div className="space-y-4">
        <AdminNotificationComposer />
        <AdminNotificationsList variant="page" />
      </div>
    </ProtectedPage>
  );
}
