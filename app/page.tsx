import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { PortalQuickLinks } from "@/components/layout/portal-quick-links";
import { PortalCard } from "@/components/ui/portal-card";
import { SectionCard } from "@/components/ui/section-card";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2.25rem] border border-brand-100/90 bg-white/92 shadow-soft">
        <div className="grid gap-8 px-6 py-7 sm:px-8 sm:py-9 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
          <div className="space-y-7">
            <div className="flex flex-wrap gap-2">
              <PortalQuickLinks
                className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 transition hover:border-brand-300 hover:bg-white"
                disabledClassName="border-slate-200 bg-slate-100 text-slate-500"
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                International Community School
              </p>
              <h1 className="font-display max-w-4xl text-4xl leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">
                One school portal for communication, notifications, location sharing, and student device support.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                ICS Ghana brings together essential daily tools in a clear, welcoming experience that works well on phones and laptops for both students and administrators.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                scroll
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
              >
                Sign In to Portal
              </Link>
              <Link
                href="/student"
                className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:border-brand-500"
              >
                Open student portal
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.9rem] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 p-6 text-white shadow-soft sm:p-8">
              <BrandLogo inverted className="items-start" />
              <div className="mt-10 space-y-4">
                <p className="text-sm uppercase tracking-[0.2em] text-brand-100">School community</p>
                <p className="font-display text-2xl leading-tight sm:text-3xl">Training tomorrow&apos;s leaders today.</p>
                <p className="text-sm leading-7 text-brand-50/90">
                  Founded in 2000, ICS Ghana serves a diverse learning community with a British System of Education and a strong culture of care.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SectionCard
                title="Founded in 2000"
                description="A well-established school community with a clear academic identity."
                className="bg-brand-50/80"
              />
              <SectionCard
                title="2,100+ Students"
                description="The portal is designed to support communication at meaningful school scale."
                className="bg-white"
              />
              <SectionCard
                title="40+ Nationalities"
                description="A diverse international community benefits from clear and inclusive communication."
                className="bg-white"
              />
              <SectionCard
                title="British System"
                description="A calm and structured learning environment reflected in the portal experience."
                className="bg-brand-50/80"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalCard
          title="Student Portal"
          description="A clear student space for school updates, location sharing, and Find My Device support."
          href="/student"
          status="Students"
        />
        <PortalCard
          title="Admin Portal"
          description="An organized workspace for communication, oversight, and account management."
          href="/admin"
          status="Administration"
        />
        <PortalCard
          title="Notifications"
          description="In-app alerts help students and administrators stay informed with timely school communication."
          href="/student"
          status="Communication"
        />
        <PortalCard
          title="Find My Device"
          description="Students can register devices, mark one as missing, and review the latest saved location when available."
          href="/student"
          status="Support"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Built for everyday school communication"
          description="The portal keeps the most important student and administrator tasks in one calm, consistent experience."
          className="bg-white/95"
        >
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="font-semibold text-slate-900">Reliable updates</p>
              <p className="mt-2 leading-6">
                Notifications, tracking, and device support each have a clear place inside the portal.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="font-semibold text-slate-900">Responsive access</p>
              <p className="mt-2 leading-6">
                Important actions stay easy to find on both phones and laptops.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="At a glance"
          description="A concise view of the school context behind the portal."
          className="bg-gradient-to-br from-white to-brand-50"
        >
          <div className="space-y-3 text-sm leading-7 text-slate-600">
            <p>
              ICS Ghana serves an international student community with over 2,100 students and more than 40 nationalities.
            </p>
            <p>
              The portal supports communication, location sharing, and student device help in a practical web-first format.
            </p>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div id="notifications" className="scroll-mt-8">
          <SectionCard
            title="Notifications"
            description="School updates are organized for clear reading inside the portal, whether the message is for students, administrators, or both."
          />
        </div>
        <div id="tracking" className="scroll-mt-8">
          <SectionCard
            title="Tracking"
            description="Students can share their current location when needed, and administrators can review the latest saved records in a clear web-based view."
          />
        </div>
        <div id="find-my-device" className="scroll-mt-8">
          <SectionCard
            title="Find My Device"
            description="Students can register devices, mark one as missing, and check the latest saved location when location data is available."
          />
        </div>
      </section>
    </div>
  );
}
