import { CircleAlert, Inbox, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "./button";

const panelStyles =
  "grid place-items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-12 text-center";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className={panelStyles}>
      <Inbox aria-hidden="true" className="size-10 text-primary" />
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="max-w-xl text-gray-700">{description}</p>
      {action}
    </section>
  );
}

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Não foi possível carregar os dados",
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <section role="alert" className={`${panelStyles} border-error-strong/40`}>
      <CircleAlert aria-hidden="true" className="size-10 text-error-strong" />
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="max-w-xl text-gray-700">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw aria-hidden="true" className="size-5" />
          Tentar novamente
        </Button>
      )}
    </section>
  );
}
