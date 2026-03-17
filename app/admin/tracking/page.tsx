import { ProtectedPage } from "@/components/auth/protected-page";
import { AdminLocationOverview } from "@/components/tracking/admin-location-overview";

export default function AdminTrackingPage() {
  return (
    <ProtectedPage
      allowedRole="admin"
      eyebrow="ICS Ghana Tracking"
      title="Tracking history"
      description="Review the latest saved locations, search records by name or email, and open saved coordinates in Google Maps."
    >
      <AdminLocationOverview variant="page" />
    </ProtectedPage>
  );
}
