import { ProtectedPage } from "@/components/auth/protected-page";
import { AdminAccountsManager } from "@/components/accounts/admin-accounts-manager";

export default function AdminAccountsPage() {
  return (
    <ProtectedPage
      allowedRole="admin"
      eyebrow="ICS Ghana Accounts"
      title="Accounts management"
      description="Create accounts, import CSV records, review roles, and manage who can access the portal."
    >
      <AdminAccountsManager />
    </ProtectedPage>
  );
}
