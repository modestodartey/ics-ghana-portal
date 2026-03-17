import { ProtectedPage } from "@/components/auth/protected-page";
import { AdminAuditLog } from "@/components/audit/admin-audit-log";

export default function AdminAuditPage() {
  return (
    <ProtectedPage
      allowedRole="admin"
      eyebrow="ICS Ghana Audit"
      title="Audit log"
      description="Review recent admin activity across accounts, notifications, and bulk imports."
    >
      <AdminAuditLog />
    </ProtectedPage>
  );
}
