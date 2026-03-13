import { AdminNotificationComposer } from "@/components/notifications/admin-notification-composer";
import { AdminNotificationsList } from "@/components/notifications/admin-notifications-list";
import { AdminLocationOverview } from "@/components/tracking/admin-location-overview";
import { ProtectedPage } from "@/components/auth/protected-page";
import { SectionCard } from "@/components/ui/section-card";

export default function AdminPage() {
  return (
    <ProtectedPage
      allowedRole="admin"
      eyebrow="ICS Ghana Admin Portal"
      title="Administrator dashboard"
      description="A structured workspace for school communication, oversight, and student support."
    >
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Portal overview"
          description="This page keeps the admin experience calm and structured while the first communication and support modules continue to grow."
          className="bg-gradient-to-br from-white to-brand-50"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Access</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Available to authorized school administrators only.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Phase</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Notifications and location oversight are ready for everyday MVP use.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Experience</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The layout stays clear and readable across phones and laptops.
              </p>
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="Admin role"
          description="This space is reserved for school operations, communication control, and future dashboard oversight."
          className="bg-white/95"
        />
      </section>
      <section id="notifications" className="grid scroll-mt-8 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminNotificationComposer />
        <AdminNotificationsList />
        <SectionCard
          title="Audit Overview"
          description="Reporting and audit views can expand here later as the portal adds more school workflows."
          className="bg-white/95"
        />
      </section>
      <div id="tracking" className="scroll-mt-8">
        <AdminLocationOverview />
      </div>
    </ProtectedPage>
  );
}
