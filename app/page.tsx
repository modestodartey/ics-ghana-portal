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
                A calm, modern portal for school communication, student support, and everyday visibility.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                ICS Ghana&apos;s portal brings together notifications, location sharing, and Find My Device Lite in one welcoming experience that works well on phones and laptops.
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
                Preview Student Portal
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.9rem] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 p-6 text-white shadow-soft sm:p-8">
              <BrandLogo inverted className="items-start" />
              <div className="mt-10 space-y-4">
                <p className="text-sm uppercase tracking-[0.2em] text-brand-100">School direction</p>
                <p className="font-display text-2xl leading-tight sm:text-3xl">Training tomorrow&apos;s leaders today.</p>
                <p className="text-sm leading-7 text-brand-50/90">
                  The portal is designed to support students and administrators with clear tools, calm structure, and room to grow.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <SectionCard
                title="25+ Years"
                description="A mature school identity deserves a mature and polished digital experience."
                className="bg-brand-50/80"
              />
              <SectionCard
                title="British System"
                description="The visual language stays structured, calm, and academically grounded."
                className="bg-white"
              />
              <SectionCard
                title="Green Campus"
                description="The palette and atmosphere are drawn from ICS Ghana&apos;s calm green identity."
                className="bg-brand-50/80"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalCard
          title="Student Portal"
          description="A refined space for students to access messages, updates, and future school services."
          href="/student"
          status="Preview"
        />
        <PortalCard
          title="Admin Portal"
          description="A structured workspace for oversight, communication, and school administration."
          href="/admin"
          status="Preview"
        />
        <PortalCard
          title="Notifications"
          description="In-app announcements help students and administrators stay informed with clear school-wide communication."
          href="/student"
          status="Live"
        />
        <PortalCard
          title="Find My Device Lite"
          description="Students can register devices, mark one as missing, and open the latest saved location in Google Maps."
          href="/student"
          status="MVP"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Built around communication, awareness, and student support"
          description="The current portal brings together the most useful early tools in one consistent experience so school users can move quickly without confusion."
          className="bg-white/95"
        >
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="font-semibold text-slate-900">Clear daily flow</p>
              <p className="mt-2 leading-6">
                Notifications, tracking, and device support each have a visible place in the student experience.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="font-semibold text-slate-900">Responsive balance</p>
              <p className="mt-2 leading-6">
                Cards, actions, and page sections stay easy to scan on both phones and laptops.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="School-oriented tagline"
          description="The interface keeps a professional, welcoming tone inspired by ICS Ghana&apos;s school identity."
          className="bg-gradient-to-br from-white to-brand-50"
        >
          <p className="font-display text-2xl leading-tight text-slate-900">Training tomorrow&apos;s leaders today.</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The current portal stays polished and future-ready while keeping the first student and admin tools easy to use.
          </p>
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
            description="Students can share their current location when needed, and administrators can review the latest saved records in a simple web-first view."
          />
        </div>
        <div id="find-my-device" className="scroll-mt-8">
          <SectionCard
            title="Find My Device Lite"
            description="Students can register devices, mark one as missing, and open the latest saved location in Google Maps when location data is available."
          />
        </div>
      </section>
    </div>
  );
}
