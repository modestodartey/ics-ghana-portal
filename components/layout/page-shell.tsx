type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
  children: React.ReactNode;
};

export function PageShell({ eyebrow, title, description, compact = false, children }: PageShellProps) {
  return (
    <div className="space-y-6">
      <section
        className={`overflow-hidden border border-brand-100/90 bg-white/90 shadow-soft backdrop-blur ${
          compact ? "rounded-[1.6rem] p-5 sm:p-6" : "rounded-[2rem] p-6 sm:p-8"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className={`font-semibold uppercase tracking-[0.2em] text-brand-700 ${compact ? "text-xs" : "text-sm"}`}>
            {eyebrow}
          </p>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            ICS Ghana
          </span>
        </div>
        <h1
          className={`font-display mt-4 max-w-3xl font-semibold tracking-tight text-slate-900 ${
            compact ? "text-2xl sm:text-[2rem]" : "text-3xl sm:text-4xl"
          }`}
        >
          {title}
        </h1>
        <p className={`mt-4 max-w-2xl text-slate-600 ${compact ? "text-sm leading-7" : "text-base leading-8"}`}>
          {description}
        </p>
      </section>
      {children}
    </div>
  );
}
