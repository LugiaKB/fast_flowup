import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-gray-200 motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export function LoadingState({ label = "Carregando" }: { label?: string }) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="mb-4 h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
      ))}
    </section>
  );
}
