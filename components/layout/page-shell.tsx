type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-brand-100/90 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">{eyebrow}</p>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            ICS Ghana
          </span>
        </div>
        <h1 className="font-display mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{description}</p>
      </section>
      {children}
    </div>
  );
}
