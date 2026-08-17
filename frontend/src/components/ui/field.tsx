import { Search } from "lucide-react";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { className, error, hint, id: suppliedId, label, leadingIcon, ...props },
  ref,
) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = error || hint ? `${id}-description` : undefined;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-600">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-describedby={descriptionId}
          aria-invalid={Boolean(error)}
          className={cn(
            "min-h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70",
            leadingIcon && "pl-11",
            error && "border-error-strong focus:border-error-strong focus:ring-error/20",
            className,
          )}
          {...props}
        />
      </div>
      {(error || hint) && (
        <p
          id={descriptionId}
          className={cn("text-sm text-gray-600", error && "text-error-strong")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export const SearchField = forwardRef<HTMLInputElement, Omit<TextFieldProps, "leadingIcon">>(
  function SearchField(props, ref) {
    return (
      <TextField
        ref={ref}
        type="search"
        leadingIcon={<Search aria-hidden="true" className="size-5" />}
        {...props}
      />
    );
  },
);
