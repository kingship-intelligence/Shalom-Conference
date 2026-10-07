import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** Native disclosure keeps forms mounted and supports keyboard activation. */
export default function AdminSection({ title, children, defaultOpen = false }: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen || undefined} className="group rounded-2xl border border-ink/10 bg-card">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-5 text-ink transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-7 [&::-webkit-details-marker]:hidden">
        <h2 className="text-base font-bold uppercase tracking-wide sm:text-lg">{title}</h2>
        <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="min-w-0 border-t border-ink/10 p-4 sm:p-7">{children}</div>
    </details>
  );
}
