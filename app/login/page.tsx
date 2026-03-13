import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SectionCard } from "@/components/ui/section-card";
import { ScrollToTopOnMount } from "@/components/ui/scroll-to-top-on-mount";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <ScrollToTopOnMount />

      <section className="overflow-hidden rounded-[2.25rem] border border-brand-100/90 bg-white/94 shadow-soft">
        <div className="grid gap-4 lg:min-h-[34rem] lg:grid-cols-[0.98fr_1.02fr]">
          <div className="flex flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="space-y-6">
              <BrandLogo inverted className="items-start" />
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.22em] text-brand-100">Portal Sign In</p>
                <h1 className="font-display max-w-xl text-4xl leading-tight sm:text-5xl">
                  Welcome back to the ICS Ghana portal.
                </h1>
                <p className="max-w-lg text-sm leading-8 text-brand-50/90 sm:text-base">
                  Sign in with your approved email address to continue to the correct role-based portal. The form is intentionally positioned above the fold for a faster, cleaner entry experience.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">Admin</p>
                <p className="mt-2 text-sm leading-6 text-white/90">
                  School oversight, portal administration, and future communications workflow.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">Student</p>
                <p className="mt-2 text-sm leading-6 text-white/90">
                  Student access for personal dashboard entry and upcoming communication tools.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
            <div className="mx-auto w-full max-w-xl space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">ICS Ghana Sign In</p>
                <h2 className="font-display text-3xl leading-tight text-slate-900 sm:text-[2.5rem]">
                  Sign in and continue directly to your portal.
                </h2>
                <p className="text-base leading-8 text-slate-600">
                  The login experience is now optimized to keep the form immediately visible on page load for both laptops and phones.
                </p>
              </div>

              <SectionCard
                title="Portal access"
                description="Use your approved email account to enter the correct role-based area."
                className="border-brand-100 bg-white"
              >
                <LoginForm />
              </SectionCard>

              <div className="grid gap-3 sm:grid-cols-2">
                <SectionCard
                  title="Approved domains"
                  description="Current sign-in access is limited to approved portal email accounts."
                  className="bg-brand-50/70"
                />
                <SectionCard
                  title="Need help?"
                  description="If the login succeeds but your role is missing, add the matching user document in Firestore."
                  className="bg-white"
                />
              </div>

              <Link href="/" className="inline-flex text-sm font-semibold text-brand-700 hover:text-brand-900">
                Return to homepage
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-3">
        <SectionCard
          title="Visible immediately"
          description="The login form now sits higher in the page structure so it appears without manual scrolling."
          className="bg-white/95"
        />
        <SectionCard
          title="Responsive composition"
          description="The page uses a split layout on larger screens and a stacked layout on phones for a cleaner sign-in experience."
          className="bg-white/95"
        />
        <SectionCard
          title="Still beginner-friendly"
          description="Only the layout and visual hierarchy changed. The Firebase auth and role logic remain as simple as before."
          className="bg-white/95"
        />
      </section>
    </div>
  );
}
