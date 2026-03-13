import Link from "next/link";
import { HeaderAuthControls } from "@/components/auth/header-auth-controls";
import { LoginModalTrigger } from "@/components/auth/login-modal-trigger";
import { BrandLogo } from "@/components/layout/brand-logo";
import { PortalQuickLinks } from "@/components/layout/portal-quick-links";
import { mainNavigation } from "@/utils/routes";

export function SiteHeader() {
  return (
    <header className="border-b border-brand-100/90 bg-white/92 backdrop-blur-xl">
      <div className="bg-brand-700 py-1.5 text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 text-[11px] font-semibold uppercase tracking-[0.2em] sm:px-6 lg:px-8">
          <span>ICS Ghana</span>
          <span className="text-brand-100">Training tomorrow&apos;s leaders today</span>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <BrandLogo compact linked />
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              A refined school portal for communication, location sharing, and student device support across the ICS Ghana community.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
            <PortalQuickLinks
              className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-brand-700 transition hover:border-brand-300 hover:bg-white"
              disabledClassName="border-slate-200 bg-slate-100 text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[1.4rem] border border-brand-100/80 bg-white/80 p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Primary navigation">
            <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {mainNavigation.map((item) => (
                <li key={item.href}>
                  {item.href === "/login" ? (
                    <LoginModalTrigger
                      label={item.label}
                      className="block rounded-full border border-transparent bg-brand-50 px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-white hover:text-brand-700"
                    />
                  ) : (
                    <Link
                      href={item.href}
                      className="block rounded-full border border-transparent bg-brand-50 px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-white hover:text-brand-700"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <HeaderAuthControls />
        </div>
      </div>
    </header>
  );
}
