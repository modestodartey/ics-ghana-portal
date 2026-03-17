import { ProtectedPage } from "@/components/auth/protected-page";
import { AdminDevicesOverview } from "@/components/devices/admin-devices-overview";

export default function AdminDevicesPage() {
  return (
    <ProtectedPage
      allowedRole="admin"
      eyebrow="ICS Ghana Devices"
      title="Devices overview"
      description="Review registered student devices, missing-device status, and saved location availability."
    >
      <AdminDevicesOverview variant="page" />
    </ProtectedPage>
  );
}
