import Link from "next/link";
import { cn } from "@/utils/cn";

type PortalCardProps = {
  title: string;
  description: string;
  href: string;
  status: string;
  className?: string;
};

export function PortalCard({ title, description, href, status, className }: PortalCardProps) {
  return (
    <section
      className={cn(
        "group rounded-[1.75rem] border border-brand-100/80 bg-white/95 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl text-slate-900 sm:text-[1.75rem]">{title}</h3>
        <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
          {status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-flex items-center rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        View page
      </Link>
    </section>
  );
}
