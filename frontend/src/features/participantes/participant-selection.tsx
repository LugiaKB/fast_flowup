"use client";

import { Button, TextField } from "@/components/ui";
import type { components } from "@/lib/api/schema";

type Colaborador = components["schemas"]["Colaborador"];

export function ParticipantSelection({
  currentParticipantIds = [],
  disabled = false,
  emptyMessage = "Nenhum colaborador ativo encontrado.",
  error,
  idPrefix,
  isLoading,
  items,
  onQueryChange,
  onRetry,
  onSelectedIdsChange,
  query,
  searchLabel,
  selectedIds,
  title,
}: {
  currentParticipantIds?: number[];
  disabled?: boolean;
  emptyMessage?: string;
  error: Error | null;
  idPrefix: string;
  isLoading: boolean;
  items: Colaborador[];
  onQueryChange: (query: string) => void;
  onRetry: () => void;
  onSelectedIdsChange: (ids: number[]) => void;
  query: string;
  searchLabel: string;
  selectedIds: number[];
  title: string;
}) {
  const selected = new Set(selectedIds);
  const currentParticipants = new Set(currentParticipantIds);
  const selectedLabel = `${selectedIds.length} ${
    selectedIds.length === 1 ? "participante selecionado" : "participantes selecionados"
  }`;

  function toggle(id: number, checked: boolean) {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectedIdsChange([...next]);
  }

  return (
    <section aria-labelledby={`${idPrefix}-title`} className="grid gap-4">
      <div>
        <h3 id={`${idPrefix}-title`} className="text-lg font-semibold">
          {title}
        </h3>
        <p aria-live="polite" className="mt-1 text-sm text-muted">
          {selectedLabel}
        </p>
      </div>
      <TextField
        id={`${idPrefix}-search`}
        type="search"
        label={searchLabel}
        value={query}
        placeholder="Digite um nome"
        disabled={disabled}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      {isLoading && (
        <p role="status" className="text-sm text-muted">
          Buscando colaboradores…
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="grid gap-3 rounded-lg bg-error-subtle p-4 text-error-strong"
        >
          <p>Não foi possível buscar colaboradores.</p>
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}
      {!isLoading && !error && items.length === 0 && (
        <p className="rounded-lg bg-surface-subtle p-4 text-sm text-muted">{emptyMessage}</p>
      )}
      {!error && items.length > 0 && (
        <fieldset className="grid gap-3" disabled={disabled || isLoading}>
          <legend className="sr-only">{title}</legend>
          {items.map((collaborator) => (
            <label
              key={collaborator.id}
              className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-4 py-2"
            >
              <input
                type="checkbox"
                checked={selected.has(collaborator.id)}
                onChange={(event) => toggle(collaborator.id, event.target.checked)}
                className="size-5 accent-primary"
              />
              <span className="flex flex-1 items-center justify-between gap-3">
                <span>{collaborator.nome}</span>
                {currentParticipants.has(collaborator.id) && (
                  <span className="rounded border border-border px-2 py-0.5 text-xs font-medium text-muted">
                    Já participa
                  </span>
                )}
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </section>
  );
}
