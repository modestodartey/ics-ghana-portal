import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";

type BrandLogoProps = {
  compact?: boolean;
  linked?: boolean;
  inverted?: boolean;
  className?: string;
};

function BrandLogoContent({ compact, inverted }: { compact?: boolean; inverted?: boolean }) {
  return (
    <>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border border-brand-200/70 bg-white shadow-soft",
          compact ? "h-11 w-11 sm:h-12 sm:w-12" : "h-20 w-20 sm:h-24 sm:w-24"
        )}
      >
        <Image
          src="/ics-ghana-logo.svg"
          alt="ICS Ghana logo placeholder"
          fill
          sizes={compact ? "48px" : "96px"}
          className="object-cover"
          priority
        />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold uppercase tracking-[0.22em]",
            inverted ? "text-brand-100" : "text-brand-700"
          )}
        >
          ICS Ghana
        </p>
        <p
          className={cn(
            "font-display",
            inverted ? "text-white" : "text-slate-900",
            compact ? "text-base leading-tight sm:text-[1.05rem]" : "text-2xl leading-tight sm:text-3xl"
          )}
        >
          International Community School
        </p>
      </div>
    </>
  );
}

export function BrandLogo({ compact, linked = false, inverted = false, className }: BrandLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      <BrandLogoContent compact={compact} inverted={inverted} />
    </div>
  );

  if (linked) {
    return (
      <Link href="/" aria-label="Go to ICS Ghana homepage" className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
