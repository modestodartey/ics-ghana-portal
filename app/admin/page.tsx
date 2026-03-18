import { ProtectedPage } from "@/components/auth/protected-page";
import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview";

export default function AdminPage() {
  return (
    <ProtectedPage
      allowedRole="admin"
      eyebrow="ICS Ghana Admin"
      title="Administrator dashboard"
      description="A compact overview of notifications, tracking, devices, and the most important daily admin actions."
    >
      <AdminDashboardOverview />
    </ProtectedPage>
  );
}
