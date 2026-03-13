import { StudentNotificationsList } from "@/components/notifications/student-notifications-list";
import { StudentDeviceManager } from "@/components/devices/student-device-manager";
import { StudentLocationShare } from "@/components/tracking/student-location-share";
import { ProtectedPage } from "@/components/auth/protected-page";
import { SectionCard } from "@/components/ui/section-card";

export default function StudentPage() {
  return (
    <ProtectedPage
      allowedRole="student"
      eyebrow="ICS Ghana Student Portal"
      title="Student dashboard"
      description="Your space for school updates, location sharing, and device support."
    >
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Student landing area"
          description="A calm and welcoming space helps students find important updates and tools without extra clutter."
          className="bg-gradient-to-br from-white to-brand-50"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Access</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Messages, location sharing, and device tools are gathered here in one place.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Student support</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The portal is ready to grow into more school services while staying simple to use on phones and laptops.
              </p>
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="Student experience"
          description="Each section is designed to stay clear, responsive, and easy to use throughout the school day."
          className="bg-white/95"
        />
      </section>
      <section id="notifications" className="grid scroll-mt-8 gap-4 md:grid-cols-2">
        <StudentNotificationsList />
        <SectionCard
          title="Account Summary"
          description="Keep your device list up to date and share your location only when needed for school support."
          className="bg-white/95"
        />
      </section>
      <div id="tracking" className="scroll-mt-8">
        <StudentLocationShare />
      </div>
      <div id="find-my-device" className="scroll-mt-8">
        <StudentDeviceManager />
      </div>
    </ProtectedPage>
  );
}
