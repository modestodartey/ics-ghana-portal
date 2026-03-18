import Link from "next/link";
import { ProtectedPage } from "@/components/auth/protected-page";
import { SectionCard } from "@/components/ui/section-card";

export default function AdminAccountsPage() {
  return (
    <ProtectedPage
      allowedRole="admin"
      eyebrow="ICS Ghana Accounts"
      title="Accounts temporarily unavailable"
      description="The portal account-management feature has been turned off for now while it is being finished properly."
    >
      <SectionCard
        title="Feature temporarily unavailable"
        description="Account creation and account-management tools are currently disabled. The rest of the admin portal is still available."
        className="bg-white/95"
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
          >
            Return to dashboard
          </Link>
        </div>
      </SectionCard>
    </ProtectedPage>
  );
}
