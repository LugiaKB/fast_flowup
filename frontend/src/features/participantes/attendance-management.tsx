"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

import { Button, Sheet, useToast } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-provider";
import { useColaboradores } from "@/features/colaboradores/use-colaboradores";
import type { components } from "@/lib/api/schema";

import { useAttendanceMutations } from "./use-attendance-mutations";

type Colaborador = components["schemas"]["Colaborador"];

export function AttendanceManagement({
  workshopId,
  participantes,
  onChanged,
}: {
  workshopId: number;
  participantes: Colaborador[];
  onChanged: () => void;
}) {
  const { request } = useAuth();
  const { add, remove, replace } = useAttendanceMutations(workshopId);
  const { notify } = useToast();
  const { data, isLoading } = useColaboradores({
    query: "",
    offset: 0,
    limit: 100,
    status: "active",
    requester: request,
  });
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [addId, setAddId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const allCollaborators = data?.items ?? [];
  const currentIds = new Set(participantes.map(({ id }) => id));
  const available = allCollaborators.filter(({ id }) => !currentIds.has(id));

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setSelected(participantes.map(({ id }) => id));
      setAddId("");
      setError(undefined);
    }
  }

  async function handleReplace() {
    setSaving(true);
    setError(undefined);
    try {
      await replace(selected);
      notify({ title: "Participantes atualizados" });
      setOpen(false);
      onChanged();
    } catch {
      setError("Não foi possível atualizar os participantes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd() {
    if (!addId) return;
    setSaving(true);
    setError(undefined);
    try {
      await add(Number(addId));
      setAddId("");
      notify({ title: "Participante adicionado" });
      setOpen(false);
      onChanged();
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
      setSelected((current) => current.filter((candidate) => candidate !== id));
      notify({ title: "Participante removido" });
      setOpen(false);
      onChanged();
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
        <fieldset className="grid gap-3" disabled={isLoading || saving}>
          <legend className="mb-2 font-heading text-lg font-semibold text-gray-900">
            Lista completa
          </legend>
          {allCollaborators.map((colaborador) => (
            <label
              key={colaborador.id}
              className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-200 px-4 py-2"
            >
              <input
                type="checkbox"
                checked={selected.includes(colaborador.id)}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, colaborador.id]
                      : current.filter((id) => id !== colaborador.id),
                  )
                }
                className="size-5 accent-primary"
              />
              {colaborador.nome}
            </label>
          ))}
          <Button onClick={() => void handleReplace()} disabled={saving || isLoading}>
            {saving ? "Salvando…" : "Salvar participantes"}
          </Button>
        </fieldset>

        <section aria-labelledby="quick-attendance" className="grid gap-4 border-t border-gray-200 pt-6">
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
              className="min-h-12 rounded-lg border border-gray-300 bg-white px-4"
            >
              <option value="">Selecione</option>
              {available.map(({ id, nome }) => (
                <option key={id} value={id}>
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
            {participantes.map(({ id, nome }) => (
              <li key={id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
                <span>{nome}</span>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={saving}
                  aria-label={`Remover ${nome}`}
                  onClick={() => void handleRemove(id)}
                >
                  <Trash2 aria-hidden="true" className="size-5" />
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Sheet>
  );
}
