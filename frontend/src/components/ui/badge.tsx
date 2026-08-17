import { Circle } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "success" | "warning" | "error";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "border-gray-500 bg-gray-100 [&_svg]:fill-gray-600 [&_svg]:text-gray-600",
  success:
    "border-success-strong bg-success-subtle [&_svg]:fill-success-strong [&_svg]:text-success-strong",
  warning:
    "border-warning-strong bg-warning-subtle [&_svg]:fill-warning-strong [&_svg]:text-warning-strong",
  error:
    "border-error-strong bg-error-subtle [&_svg]:fill-error-strong [&_svg]:text-error-strong",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ children, className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-900",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      <Circle aria-hidden="true" className="size-2.5" />
      {children}
    </span>
  );
}
