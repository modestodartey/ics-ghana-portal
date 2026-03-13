import { cn } from "@/utils/cn";

type SectionCardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export function SectionCard({ title, description, children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-[1.75rem] border border-brand-100/80 bg-white/95 p-6 shadow-soft backdrop-blur",
        className
      )}
    >
      <h2 className="font-display text-xl font-semibold text-slate-900 sm:text-[1.45rem]">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
