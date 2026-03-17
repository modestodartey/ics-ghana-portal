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
      description="Your space for school updates, live session location sharing, and device support."
    >
      <div id="tracking" className="scroll-mt-8">
        <StudentLocationShare />
      </div>
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Student essentials"
          description="Keep up with school updates, current session location sharing, and device support from one simple dashboard."
          className="bg-gradient-to-br from-white to-brand-50"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">First step</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enable location access first so the portal can keep your session location current automatically.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Daily use</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review your latest notices, keep device records current, and stay reachable during the school day.
              </p>
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="What you can do here"
          description="The student portal keeps the most useful actions close at hand."
          className="bg-white/95"
        >
          <div className="grid gap-3">
            <div className="rounded-2xl bg-brand-50/70 p-4 text-sm leading-6 text-slate-600">
              Read school notifications as soon as they arrive.
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
              Keep your session location current once access is approved.
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
              Register devices and review their latest known location status.
            </div>
          </div>
        </SectionCard>
      </section>
      <section id="notifications" className="grid scroll-mt-8 gap-4 md:grid-cols-2">
        <StudentNotificationsList />
        <SectionCard
          title="Student checklist"
          description="A quick reminder of the most useful portal habits."
          className="bg-white/95"
        >
          <div className="grid gap-3">
            <div className="rounded-2xl bg-brand-50/70 p-4 text-sm leading-6 text-slate-600">
              Check unread notifications before leaving the portal.
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
              Keep device names clear so Find My Device stays easy to use.
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
              Leave location access enabled during active school sessions when needed.
            </div>
          </div>
        </SectionCard>
      </section>
      <div id="find-my-device" className="scroll-mt-8">
        <StudentDeviceManager />
      </div>
    </ProtectedPage>
  );
}
