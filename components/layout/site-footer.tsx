import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-brand-200/90 bg-gradient-to-b from-brand-100/45 via-white to-white shadow-[0_-20px_40px_-34px_rgba(23,54,41,0.28)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_0.9fr_1fr] lg:px-8">
        <div className="rounded-[1.75rem] border border-brand-100/80 bg-gradient-to-br from-white via-brand-50/40 to-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">ICS Ghana</p>
          <p className="font-display mt-2 text-2xl text-slate-900">International Community School</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
            A polished digital front door for an academic community focused on excellence, discipline, and a welcoming learning environment.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Portal pages</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <Link href="/login" scroll className="hover:text-brand-700">
              Login
            </Link>
            <Link href="/student" className="hover:text-brand-700">
              Student Portal
            </Link>
            <Link href="/admin" className="hover:text-brand-700">
              Admin Portal
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Brand asset</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Replace <span className="font-semibold text-slate-800">/public/ics-ghana-logo.svg</span> with the official school logo when a final asset is available.
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-500">Designed to stay clear, calm, and professional on both phones and laptops.</p>
        </div>
      </div>
    </footer>
  );
}
