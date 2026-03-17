import { ProtectedPage } from "@/components/auth/protected-page";
import { StudentNotificationsList } from "@/components/notifications/student-notifications-list";
import { SectionCard } from "@/components/ui/section-card";

export default function StaffPage() {
  return (
    <ProtectedPage
      allowedRole="staff"
      eyebrow="ICS Ghana Staff Portal"
      title="Staff dashboard"
      description="A focused space for staff communication and portal updates."
    >
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Staff overview"
          description="Staff accounts can receive important school updates through the same clear portal experience."
          className="bg-gradient-to-br from-white to-brand-50"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Staff role</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Stay connected through a staff-ready portal role with the same secure sign-in flow.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Notifications</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Staff can receive notifications sent to all users, all staff, or specific approved email addresses.
              </p>
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="Staff essentials"
          description="Use this space to keep up with school notices and shared portal updates."
          className="bg-white/95"
        >
          <div className="grid gap-3">
            <div className="rounded-2xl bg-brand-50/70 p-4 text-sm leading-6 text-slate-600">
              Review new notifications promptly and keep your account active for school communication.
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
              Staff notices, all-user notices, and specific-email notices will appear below.
            </div>
          </div>
        </SectionCard>
      </section>
      <section id="notifications" className="scroll-mt-8">
        <StudentNotificationsList />
      </section>
    </ProtectedPage>
  );
}
