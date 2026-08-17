"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, ConfirmDialog, Sheet, useToast } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-provider";
import { useColaboradores } from "@/features/colaboradores/use-colaboradores";
import type { components } from "@/lib/api/schema";

import { useAttendanceMutations } from "./use-attendance-mutations";
import { ParticipantSelection } from "./participant-selection";

type Colaborador = components["schemas"]["Colaborador"];

export function AttendanceManagement({
  workshopId,
  participantes,
  onChanged,
}: {
  workshopId: number;
  participantes: Colaborador[];
  onChanged: (participantes: Colaborador[]) => void;
}) {
  const { request } = useAuth();
  const { add, remove, replace } = useAttendanceMutations(workshopId);
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const { data, error: queryError, isLoading, refetch } = useColaboradores({
    query,
    offset: 0,
    limit: 100,
    status: "active",
    requester: request,
  });
  const [open, setOpen] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(participantes);
  const [selected, setSelected] = useState<number[]>([]);
  const [addId, setAddId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const allCollaborators = data?.items ?? [];
  const currentIds = useMemo(
    () => new Set(currentParticipants.map(({ id }) => id)),
    [currentParticipants],
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setCurrentParticipants(participantes);
      setSelected(participantes.map(({ id }) => id));
      setAddId("");
      setQuery("");
      setError(undefined);
    }
  }

  async function handleReplace() {
    setSaving(true);
    setError(undefined);
    try {
      const updated = await replace(selected);
      setCurrentParticipants(updated.participantes);
      setSelected(updated.participantes.map(({ id }) => id));
      onChanged(updated.participantes);
      notify({ title: "Participantes atualizados" });
    } catch {
      setError("Não foi possível atualizar os participantes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd() {
    if (!addId) return;
    const collaborator = allCollaborators.find(({ id }) => id === Number(addId));
    if (!collaborator || currentIds.has(collaborator.id)) return;
    setSaving(true);
    setError(undefined);
    try {
      await add(Number(addId));
      const updated = [...currentParticipants, collaborator].toSorted((left, right) =>
        left.nome.localeCompare(right.nome, "pt-BR"),
      );
      setCurrentParticipants(updated);
      setSelected((current) =>
        current.includes(collaborator.id) ? current : [...current, collaborator.id],
      );
      onChanged(updated);
      setAddId("");
      notify({ title: "Participante adicionado" });
    } catch {
      setError("Não foi possível adicionar o participante.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: number) {
    setSaving(true);
    setError(undefined);
    try {
      await remove(id);
      const updated = currentParticipants.filter((participant) => participant.id !== id);
      setCurrentParticipants(updated);
      setSelected((current) => current.filter((candidate) => candidate !== id));
      onChanged(updated);
      notify({ title: "Participante removido" });
    } catch {
      setError("Não foi possível remover o participante.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Gerenciar participantes"
      description="Substitua a lista completa ou faça inclusões e remoções individuais."
      trigger={
        <Button>
          <Users aria-hidden="true" className="size-5" />
          Gerenciar participantes
        </Button>
      }
    >
      <div className="grid gap-8">
        {error && (
          <p role="alert" className="rounded-lg bg-error-subtle p-4 text-error-strong">
            {error}
          </p>
        )}
        <ParticipantSelection
          idPrefix="attendance"
          title="Lista completa"
          searchLabel="Buscar colaboradores"
          query={query}
          onQueryChange={setQuery}
          selectedIds={selected}
          onSelectedIdsChange={setSelected}
          items={allCollaborators}
          isLoading={isLoading}
          error={queryError}
          onRetry={refetch}
          disabled={saving}
          emptyMessage="Nenhum colaborador encontrado."
        />
        <div>
          <Button onClick={() => void handleReplace()} disabled={saving || isLoading}>
            {saving ? "Salvando…" : "Salvar participantes"}
          </Button>
        </div>

        <section aria-labelledby="quick-attendance" className="grid gap-4 border-t border-border pt-6">
          <h3 id="quick-attendance" className="text-lg font-semibold">
            Ajustes individuais
          </h3>
          <div className="grid gap-2">
            <label htmlFor="participant-to-add" className="text-sm font-medium">
              Colaborador para adicionar
            </label>
            <select
              id="participant-to-add"
              value={addId}
              disabled={saving}
              onChange={(event) => setAddId(event.target.value)}
              className="min-h-12 rounded-lg border border-border bg-surface px-4 text-strong"
            >
              <option value="">Selecione</option>
              {allCollaborators.map(({ id, nome }) => (
                <option key={id} value={id} disabled={currentIds.has(id)}>
                  {nome}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              disabled={!addId || saving}
              onClick={() => void handleAdd()}
            >
              <Plus aria-hidden="true" className="size-5" />
              Adicionar participante
            </Button>
          </div>
          <ul className="grid gap-2">
            {currentParticipants.map(({ id, nome }) => (
              <li key={id} className="flex items-center justify-between gap-3 rounded-lg bg-surface-subtle p-3">
                <span>{nome}</span>
                <ConfirmDialog
                  title={`Remover ${nome}?`}
                  description="A participação será removida deste workshop."
                  confirmLabel="Remover"
                  onConfirm={() => void handleRemove(id)}
                  trigger={
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={saving}
                      aria-label={`Remover ${nome}`}
                    >
                      <Trash2 aria-hidden="true" className="size-5" />
                      Remover
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Sheet>
  );
}
